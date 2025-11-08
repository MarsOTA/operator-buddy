import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Bell, Send } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useAppStore } from '@/store/appStore';

export const NotificationTestPanel = () => {
  const { operators, events, getShiftsByEvent } = useAppStore();
  const [selectedOperator, setSelectedOperator] = useState<string>('');
  const [selectedEvent, setSelectedEvent] = useState<string>('');
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sending, setSending] = useState(false);

  const handleSendTestNotification = async () => {
    if (!selectedOperator) {
      toast.error('Seleziona un operatore');
      return;
    }

    setSending(true);

    try {
      const event = events.find(e => e.id === selectedEvent);
      const title = customTitle || 'Notifica di Test';
      const body = customMessage || `Questa è una notifica di test da EZYSTAFF${event ? ` per l'evento "${event.title}"` : ''}`;

      const { error } = await supabase.functions.invoke('send-push-notification', {
        body: {
          operatorId: selectedOperator,
          title,
          body,
          eventId: selectedEvent || undefined,
        },
      });

      if (error) throw error;

      toast.success('Notifica di test inviata con successo!');
      
      // Reset form
      setCustomTitle('');
      setCustomMessage('');
      setSelectedEvent('');
    } catch (error: any) {
      console.error('Error sending test notification:', error);
      toast.error(error.message || 'Errore durante l\'invio della notifica');
    } finally {
      setSending(false);
    }
  };

  const handleSendBulkNotification = async () => {
    if (!customTitle || !customMessage) {
      toast.error('Inserisci titolo e messaggio');
      return;
    }

    setSending(true);
    let successCount = 0;

    try {
      // Invia a tutti gli operatori
      for (const operator of operators) {
        try {
          const { error } = await supabase.functions.invoke('send-push-notification', {
            body: {
              operatorId: operator.id,
              title: customTitle,
              body: customMessage,
              eventId: selectedEvent || undefined,
            },
          });

          if (!error) {
            successCount++;
          }
        } catch (err) {
          console.error(`Error sending to operator ${operator.id}:`, err);
        }
      }

      toast.success(`Notifica inviata a ${successCount}/${operators.length} operatori`);
      
      // Reset form
      setCustomTitle('');
      setCustomMessage('');
      setSelectedEvent('');
    } catch (error: any) {
      console.error('Error sending bulk notifications:', error);
      toast.error('Errore durante l\'invio delle notifiche');
    } finally {
      setSending(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-primary" />
          Test Notifiche Push
        </CardTitle>
        <CardDescription>
          Invia notifiche di test agli operatori per verificare il sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="operator">Operatore *</Label>
          <Select value={selectedOperator} onValueChange={setSelectedOperator}>
            <SelectTrigger id="operator">
              <SelectValue placeholder="Seleziona operatore" />
            </SelectTrigger>
            <SelectContent>
              {operators.map((operator) => (
                <SelectItem key={operator.id} value={operator.id}>
                  {operator.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="event">Evento (opzionale)</Label>
          <div className="flex gap-2">
            <Select value={selectedEvent} onValueChange={setSelectedEvent}>
              <SelectTrigger id="event" className="flex-1">
                <SelectValue placeholder="Nessun evento selezionato" />
              </SelectTrigger>
              <SelectContent>
                {events.map((event) => (
                  <SelectItem key={event.id} value={event.id}>
                    {event.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedEvent && (
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => setSelectedEvent('')}
                title="Rimuovi evento"
              >
                ×
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="title">Titolo (opzionale)</Label>
          <Input
            id="title"
            placeholder="Notifica di Test"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="message">Messaggio (opzionale)</Label>
          <Input
            id="message"
            placeholder="Questo è un messaggio di test"
            value={customMessage}
            onChange={(e) => setCustomMessage(e.target.value)}
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2 pt-2">
          <Button
            onClick={handleSendTestNotification}
            disabled={sending || !selectedOperator}
            className="flex-1"
          >
            <Send className="mr-2 h-4 w-4" />
            {sending ? 'Invio...' : 'Invia a Operatore Selezionato'}
          </Button>

          <Button
            onClick={handleSendBulkNotification}
            disabled={sending || !customTitle || !customMessage}
            variant="secondary"
            className="flex-1"
          >
            <Bell className="mr-2 h-4 w-4" />
            {sending ? 'Invio...' : 'Invia a Tutti'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          * L'operatore deve aver abilitato le notifiche push sul proprio dispositivo
        </p>
      </CardContent>
    </Card>
  );
};
