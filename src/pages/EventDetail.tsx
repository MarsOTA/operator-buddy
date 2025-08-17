import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useMemo, useState } from "react";
import { useAppStore, ACTIVITY_TYPES, type ActivityType } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CalendarIcon, Users, Crown, UserPlus, Plus, Trash2, Edit2, Save, X, FileText, ArrowUpDown, ArrowUp, ArrowDown, ListChecks, Clock } from "lucide-react";
import OperatorAssignDialog from "@/components/events/OperatorAssignDialog";
import ShiftPlanningForm from "@/components/events/ShiftPlanningForm";
import ShiftInsertForm from "@/components/events/ShiftInsertForm";
import ShiftHeader from "@/components/ShiftHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

// ⬇️ NOVITÀ: import del calcolo gap con capienza fissa
import { getFirstGapWithCapacity } from "@/lib/coverage";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const event = useAppStore(s => s.getEventById(id!));

  // ...TUTTO IL RESTO INVARIATO...

  return (
    <main className="container py-8">
      <Helmet>
        <title>{event.title} | Evento</title>
        <meta name="description" content={`Dettaglio evento ${event.title}. Pianifica turni e assegna operatori.`} />
        <link rel="canonical" href={`/events/${event.id}`} />
      </Helmet>

      {/* 🆕 Form inserimento nuovo turno */}
      <div className="mb-8">
        <ShiftInsertForm />
      </div>

      {/* 🔽 CONTINUA COME PRIMA */}
      {/* top section */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        {/* ... */}
      </section>

      {/* ... resto della pagina invariato ... */}
    </main>
  );
};
export default EventDetail;
