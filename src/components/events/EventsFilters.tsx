import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, X, Download } from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DateFilter {
  startDate: Date | null;
  endDate: Date | null;
}

interface EventsFiltersProps {
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  clientFilter: string | null;
  onClientFilterChange: (clientId: string | null) => void;
  brandFilter: string | null;
  onBrandFilterChange: (brandId: string | null) => void;
  sortBy: string;
  onSortByChange: (sort: string) => void;
  selectedCount: number;
  onExport: () => void;
  clients: Array<{ id: string; name: string }>;
  brands: Array<{ id: string; name: string; clientId: string }>;
}

export default function EventsFilters({
  dateFilter,
  onDateFilterChange,
  clientFilter,
  onClientFilterChange,
  brandFilter,
  onBrandFilterChange,
  sortBy,
  onSortByChange,
  selectedCount,
  onExport,
  clients,
  brands,
}: EventsFiltersProps) {
  const handleReset = () => {
    onDateFilterChange({ startDate: null, endDate: null });
  };

  const handlePreset = (preset: "today" | "week" | "month") => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    switch (preset) {
      case "today": {
        onDateFilterChange({ startDate: today, endDate: today });
        break;
      }
      case "week": {
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1);
        const weekEnd = new Date(weekStart);
        weekEnd.setDate(weekStart.getDate() + 6);
        onDateFilterChange({ startDate: weekStart, endDate: weekEnd });
        break;
      }
      case "month": {
        const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
        const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
        onDateFilterChange({ startDate: monthStart, endDate: monthEnd });
        break;
      }
    }
  };

  const availableBrands = clientFilter
    ? brands.filter(b => b.clientId === clientFilter)
    : brands;

  return (
    <Card className="p-4 mb-6 space-y-4">
      {/* Riga 1: Filtri data, cliente, brand */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        <div className="flex items-center gap-2 text-sm font-medium shrink-0">
          <CalendarIcon className="h-4 w-4" />
          <span>Filtri</span>
        </div>

        <div className="flex flex-wrap gap-2 items-center flex-1">
          {/* Dal */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateFilter.startDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter.startDate
                  ? format(dateFilter.startDate, "dd/MM/yy", { locale: it })
                  : "Dal..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter.startDate || undefined}
                onSelect={(date) =>
                  onDateFilterChange({
                    ...dateFilter,
                    startDate: date || null,
                  })
                }
                initialFocus
                locale={it}
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Al */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className={cn(
                  "justify-start text-left font-normal",
                  !dateFilter.endDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateFilter.endDate
                  ? format(dateFilter.endDate, "dd/MM/yy", { locale: it })
                  : "Al..."}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={dateFilter.endDate || undefined}
                onSelect={(date) =>
                  onDateFilterChange({
                    ...dateFilter,
                    endDate: date || null,
                  })
                }
                initialFocus
                locale={it}
                disabled={(date) =>
                  dateFilter.startDate ? date < dateFilter.startDate : false
                }
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          {/* Reset */}
          {(dateFilter.startDate || dateFilter.endDate) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleReset}
              className="h-9 w-9"
            >
              <X className="h-4 w-4" />
            </Button>
          )}

          {/* Separator verticale */}
          <div className="hidden sm:block h-8 w-px bg-border mx-1" />

          {/* Preset rapidi */}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePreset("today")}
          >
            Oggi
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePreset("week")}
          >
            Questa settimana
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => handlePreset("month")}
          >
            Questo mese
          </Button>
        </div>
      </div>

      {/* Riga 2: Cliente, Brand, Sort, Export */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center flex-wrap">
        {/* Cliente */}
        <Select value={clientFilter || "all"} onValueChange={(v) => onClientFilterChange(v === "all" ? null : v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tutti i clienti" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i clienti</SelectItem>
            {clients.map(c => (
              <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Brand */}
        <Select value={brandFilter || "all"} onValueChange={(v) => onBrandFilterChange(v === "all" ? null : v)}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue placeholder="Tutti i brand" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tutti i brand</SelectItem>
            {availableBrands.map(b => (
              <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* Sort */}
        <Select value={sortBy} onValueChange={onSortByChange}>
          <SelectTrigger className="w-full sm:w-48">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="date-asc">Data (crescente)</SelectItem>
            <SelectItem value="date-desc">Data (decrescente)</SelectItem>
            <SelectItem value="client-asc">Cliente (A-Z)</SelectItem>
            <SelectItem value="client-desc">Cliente (Z-A)</SelectItem>
          </SelectContent>
        </Select>

        {/* Export button */}
        <Button
          variant="default"
          size="sm"
          disabled={selectedCount === 0}
          onClick={onExport}
          className="ml-auto"
        >
          <Download className="mr-2 h-4 w-4" />
          Esporta ({selectedCount})
        </Button>
      </div>
    </Card>
  );
}
