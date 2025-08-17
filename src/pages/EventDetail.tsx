import { Helmet } from "react-helmet-async";
import { useParams } from "react-router-dom";
import { useAppStore } from "@/store/appStore";
import ShiftInsertForm from "@/components/events/ShiftInsertForm";
import ShiftPlanningForm from "@/components/events/ShiftPlanningForm";
import OperatorAssignDialog from "@/components/events/OperatorAssignDialog";
import ShiftHeader from "@/components/ShiftHeader";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  CalendarIcon,
  Users,
  Crown,
  UserPlus,
  Plus,
  Trash2,
  Edit2,
  Save,
  X,
  FileText,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ListChecks,
  Clock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getFirstGapWithCapacity } from "@/lib/coverage";

const EventDetail = () => {
  const { id } = useParams<{ id: string }>();
  const event = useAppStore((s) => s.getEventById(id!));

  return (
    <main className="container py-8">
      <Helmet>
        <title>{event?.title} | Evento</title>
        <meta
          name="description"
          content={`Dettaglio evento ${event?.title}. Pianifica turni e assegna operatori.`}
        />
        <link rel="canonical" href={`/events/${event?.id}`} />
      </Helmet>

      {/* 🆕 Maschera di inserimento turno */}
      <div className="mb-8">
        <ShiftInsertForm />
      </div>

      {/* 🔽 CONTINUA COME PRIMA - puoi personalizzare il contenuto qui */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        <div className="col-span-2">
          <ShiftPlanningForm eventId={id!} />
        </div>
        <div>
          <OperatorAssignDialog eventId={id!} />
        </div>
      </section>
    </main>
  );
};

export default EventDetail;
