import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CalendarIcon, ClockIcon } from "lucide-react";

const ShiftInsertForm = () => {
  return (
    <Card className="w-full max-w-xl bg-white rounded-2xl shadow-md border p-6">
      <CardHeader className="text-xl font-bold mb-2">Inserimento turno</CardHeader>
      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="col-span-1">
          <Label className="mb-1">Data</Label>
          <div className="relative">
            <Input type="date" className="pr-10" />
            <CalendarIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="col-span-1">
          <Label className="mb-1">Tipologia</Label>
          <Input placeholder="Seleziona tipologia" />
        </div>

        <div className="col-span-2">
          <Label className="mb-1">Note per il turno</Label>
          <Textarea placeholder="Note..." />
        </div>

        <div className="col-span-1">
          <Label className="mb-1">Ora Inizio</Label>
          <div className="relative">
            <Input type="time" className="pr-10" />
            <ClockIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="col-span-1">
          <Label className="mb-1">Ora Fine</Label>
          <div className="relative">
            <Input type="time" className="pr-10" />
            <ClockIcon className="absolute right-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>

        <div className="col-span-1">
          <Label className="mb-1">Numero operatori</Label>
          <Input type="number" min={1} defaultValue={1} />
        </div>

        <div className="col-span-2">
          <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
            Aggiungi turno
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ShiftInsertForm;
