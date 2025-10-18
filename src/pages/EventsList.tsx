import { Helmet } from "react-helmet-async";
import { useAppStore } from "@/store/appStore";
import { Button } from "@/components/ui/button";
import { Plus, CalendarIcon } from "lucide-react";
import { useMemo, useState } from "react";
import CreateEventModal from "@/components/events/CreateEventModal";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import EventsFilters from "@/components/events/EventsFilters";
import EventRow from "@/components/events/EventRow";
import { exportEventsToExcel } from "@/utils/eventsExport";
import { toast } from "sonner";

const calcEffectiveHours = (start: string, end: string, pauseHours: number = 0): number => {
  try {
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    const startMin = sh * 60 + sm;
    const endMin = eh * 60 + em;
    let diff = (endMin - startMin) / 60;
    if (diff < 0) diff = 0;
    return Math.max(0, diff - pauseHours);
  } catch {
    return 0;
  }
};

const formatDateDDMMYY = (dateStr: string): string => {
  try {
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year.slice(-2)}`;
  } catch {
    return dateStr;
  }
};

const EventsList = () => {
  const events = useAppStore((s) => s.events);
  const brands = useAppStore((s) => s.brands);
  const clients = useAppStore((s) => s.clients);
  const operators = useAppStore((s) => s.operators);
  const getShiftsByEvent = useAppStore((s) => s.getShiftsByEvent);
  
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [dateFilter, setDateFilter] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [clientFilter, setClientFilter] = useState<string | null>(null);
  const [brandFilter, setBrandFilter] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>("date-asc");
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [expandedEventIds, setExpandedEventIds] = useState<string[]>([]);

  // Processa gli eventi in una struttura flat
  const processedEvents = useMemo(() => {
    const flatEvents = events.map(event => {
      const shifts = getShiftsByEvent(event.id);
      const client = clients.find(c => c.id === event.clientId);
      const brand = brands.find(b => b.id === event.brandId);
      
      const totalOperators = shifts.reduce((sum, s) => sum + s.operatorIds.length, 0);
      const totalAssignedHours = shifts.reduce((sum, s) => {
        const hours = calcEffectiveHours(s.startTime, s.endTime, s.pauseHours ?? 0);
        return sum + (hours * s.operatorIds.length);
      }, 0);
      
      const firstShiftDate = shifts.length > 0 
        ? shifts.sort((a, b) => a.date.localeCompare(b.date))[0].date 
        : null;
      
      return {
        id: event.id,
        title: event.title,
        clientId: event.clientId || "",
        brandId: event.brandId || "",
        clientName: client?.name || "—",
        brandName: brand?.name || "",
        date: firstShiftDate || "",
        dateFormatted: firstShiftDate ? formatDateDDMMYY(firstShiftDate) : "—",
        totalOperators,
        totalAssignedHours: totalAssignedHours.toFixed(2),
        shifts: shifts.map(s => ({
          id: s.id,
          startTime: s.startTime,
          endTime: s.endTime,
          activityType: s.activityType,
          role: s.role,
          pauseHours: s.pauseHours ?? 0,
          operatorIds: s.operatorIds,
        })),
      };
    }).filter(ev => ev.date !== "");

    return flatEvents;
  }, [events, clients, brands, getShiftsByEvent]);

  // Filtra e ordina gli eventi
  const filteredAndSortedEvents = useMemo(() => {
    let filtered = processedEvents;

    // Filtro date
    if (dateFilter.startDate || dateFilter.endDate) {
      filtered = filtered.filter(ev => {
        if (!ev.date) return false;
        const eventDate = new Date(ev.date + "T00:00:00");
        
        if (dateFilter.startDate && dateFilter.endDate) {
          return eventDate >= dateFilter.startDate && eventDate <= dateFilter.endDate;
        }
        if (dateFilter.startDate) return eventDate >= dateFilter.startDate;
        if (dateFilter.endDate) return eventDate <= dateFilter.endDate;
        return true;
      });
    }

    // Filtro cliente
    if (clientFilter) {
      filtered = filtered.filter(ev => ev.clientId === clientFilter);
    }

    // Filtro brand
    if (brandFilter) {
      filtered = filtered.filter(ev => ev.brandId === brandFilter);
    }

    // Ordinamento
    const sorted = [...filtered].sort((a, b) => {
      switch (sortBy) {
        case "date-asc":
          return a.date.localeCompare(b.date);
        case "date-desc":
          return b.date.localeCompare(a.date);
        case "client-asc":
          return a.clientName.localeCompare(b.clientName);
        case "client-desc":
          return b.clientName.localeCompare(a.clientName);
        default:
          return 0;
      }
    });

    return sorted;
  }, [processedEvents, dateFilter, clientFilter, brandFilter, sortBy]);

  const handleToggleSelect = (eventId: string) => {
    setSelectedEventIds(prev => 
      prev.includes(eventId) 
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleSelectAll = () => {
    if (selectedEventIds.length === filteredAndSortedEvents.length) {
      setSelectedEventIds([]);
    } else {
      setSelectedEventIds(filteredAndSortedEvents.map(ev => ev.id));
    }
  };

  const handleExport = () => {
    if (selectedEventIds.length === 0) {
      toast.error("Seleziona almeno un evento da esportare");
      return;
    }

    const eventsToExport = filteredAndSortedEvents
      .filter(ev => selectedEventIds.includes(ev.id))
      .map(ev => ({
        id: ev.id,
        title: ev.title,
        date: ev.date,
        clientName: ev.clientName,
        brandName: ev.brandName,
        shifts: ev.shifts,
      }));

    exportEventsToExcel(eventsToExport, selectedEventIds, operators);
    toast.success(`${selectedEventIds.length} eventi esportati con successo`);
  };

  const handleExpandAll = () => {
    if (expandedEventIds.length === filteredAndSortedEvents.length) {
      setExpandedEventIds([]);
    } else {
      setExpandedEventIds(filteredAndSortedEvents.map(ev => ev.id));
    }
  };

  const allSelected = filteredAndSortedEvents.length > 0 && 
    selectedEventIds.length === filteredAndSortedEvents.length;

  return (
    <main className="container py-8">
      <Helmet>
        <title>Lista Eventi | Gestionale Sicurezza</title>
        <meta name="description" content="Elenco eventi con cliente e data. Crea e gestisci eventi dell'agenzia di sicurezza." />
        <link rel="canonical" href="/events" />
      </Helmet>

      <section className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-semibold">Lista Eventi</h1>
          {selectedEventIds.length > 0 && (
            <Badge variant="secondary" className="gap-1">
              {selectedEventIds.length} selezionati
            </Badge>
          )}
        </div>
        <div className="flex gap-2">
          {filteredAndSortedEvents.length > 0 && (
            <Button variant="outline" onClick={handleExpandAll}>
              {expandedEventIds.length === filteredAndSortedEvents.length ? "Chiudi tutto" : "Espandi tutto"}
            </Button>
          )}
          <Button onClick={() => setCreateModalOpen(true)}>
            <Plus />
            Crea evento
          </Button>
        </div>
      </section>

      <EventsFilters
        dateFilter={dateFilter}
        onDateFilterChange={setDateFilter}
        clientFilter={clientFilter}
        onClientFilterChange={setClientFilter}
        brandFilter={brandFilter}
        onBrandFilterChange={setBrandFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        selectedCount={selectedEventIds.length}
        onExport={handleExport}
        clients={clients}
        brands={brands}
      />

      {filteredAndSortedEvents.length === 0 ? (
        <section className="rounded-lg border border-border p-8 text-center text-muted-foreground">
          {dateFilter.startDate || dateFilter.endDate || clientFilter || brandFilter
            ? "Nessun evento trovato per i filtri selezionati."
            : "Nessun evento programmato. Crea il primo evento."}
        </section>
      ) : (
        <div className="space-y-4">
          {/* Select all checkbox */}
          <div className="flex items-center gap-2 px-2">
            <Checkbox
              checked={allSelected}
              onCheckedChange={handleSelectAll}
            />
            <span className="text-sm text-muted-foreground">
              Seleziona tutti ({filteredAndSortedEvents.length})
            </span>
          </div>

          {/* Event rows */}
          <div className="space-y-3">
            {filteredAndSortedEvents.map(event => (
              <EventRow
                key={event.id}
                event={event}
                operators={operators}
                isSelected={selectedEventIds.includes(event.id)}
                onToggleSelect={handleToggleSelect}
                isExpanded={expandedEventIds.includes(event.id)}
                onToggleExpand={(id) => {
                  setExpandedEventIds(prev =>
                    prev.includes(id) ? prev.filter(eid => eid !== id) : [...prev, id]
                  );
                }}
              />
            ))}
          </div>
        </div>
      )}
      
      <CreateEventModal 
        open={createModalOpen} 
        onOpenChange={setCreateModalOpen} 
      />
    </main>
  );
};

export default EventsList;
