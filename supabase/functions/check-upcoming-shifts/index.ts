import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.75.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('🔍 Checking for upcoming shifts...');

    // Calcola l'intervallo di tempo: tra 45 e 75 minuti da ora
    const now = new Date();
    const from = new Date(now.getTime() + 45 * 60000); // 45 minuti
    const to = new Date(now.getTime() + 75 * 60000);   // 75 minuti

    const today = now.toISOString().split('T')[0];
    const fromTime = from.toTimeString().slice(0, 5); // HH:MM
    const toTime = to.toTimeString().slice(0, 5);

    console.log(`📅 Looking for shifts on ${today} between ${fromTime} and ${toTime}`);

    // Trova tutti i turni che iniziano tra 45-75 minuti
    const { data: upcomingShifts, error: shiftsError } = await supabase
      .from('shifts')
      .select('id, event_id, date, start_time, location')
      .eq('date', today)
      .gte('start_time', fromTime)
      .lte('start_time', toTime);

    if (shiftsError) {
      console.error('Error fetching shifts:', shiftsError);
      throw shiftsError;
    }

    console.log(`Found ${upcomingShifts?.length || 0} upcoming shifts`);

    let notificationsSent = 0;

    for (const shift of upcomingShifts || []) {
      console.log(`Processing shift ${shift.id}`);

      // Trova gli operatori assegnati
      const { data: assignments, error: assignmentsError } = await supabase
        .from('shift_assignments')
        .select('operator_id')
        .eq('shift_id', shift.id);

      if (assignmentsError) {
        console.error(`Error fetching assignments for shift ${shift.id}:`, assignmentsError);
        continue;
      }

      // Prendi i dettagli dell'evento
      const { data: event, error: eventError } = await supabase
        .from('events')
        .select('title, address')
        .eq('id', shift.event_id)
        .single();

      if (eventError) {
        console.error(`Error fetching event for shift ${shift.id}:`, eventError);
      }

      // Invia notifica a ogni operatore
      for (const assignment of assignments || []) {
        const notificationType = 'shift_reminder_1h';

        // Controlla se la notifica è già stata inviata
        const { data: existingNotification } = await supabase
          .from('sent_notifications')
          .select('id')
          .eq('shift_id', shift.id)
          .eq('operator_id', assignment.operator_id)
          .eq('notification_type', notificationType)
          .single();

        if (existingNotification) {
          console.log(`Notification already sent to operator ${assignment.operator_id} for shift ${shift.id}`);
          continue;
        }

        // Prepara il messaggio
        const title = 'Turno in arrivo';
        const location = shift.location || event?.address || '';
        const body = `Il tuo turno "${event?.title || 'Turno'}" inizia tra un'ora (${shift.start_time})${location ? ` presso ${location}` : ''}`;

        console.log(`Sending notification to operator ${assignment.operator_id}`);

        // Invia la notifica push
        const { error: notificationError } = await supabase.functions.invoke('send-push-notification', {
          body: {
            operatorId: assignment.operator_id,
            title,
            body,
            eventId: shift.event_id,
            shiftId: shift.id,
          },
        });

        if (notificationError) {
          console.error(`Error sending notification to ${assignment.operator_id}:`, notificationError);
          continue;
        }

        // Marca la notifica come inviata
        const { error: insertError } = await supabase
          .from('sent_notifications')
          .insert({
            shift_id: shift.id,
            operator_id: assignment.operator_id,
            notification_type: notificationType,
          });

        if (insertError) {
          console.error(`Error marking notification as sent:`, insertError);
        } else {
          notificationsSent++;
          console.log(`✅ Notification sent to operator ${assignment.operator_id}`);
        }
      }
    }

    console.log(`✅ Process completed. Sent ${notificationsSent} notifications`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        shiftsChecked: upcomingShifts?.length || 0,
        notificationsSent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in check-upcoming-shifts:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
