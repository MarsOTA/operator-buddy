import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UsersIcon, FileTextIcon } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";

const CounterCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: number | string }) => (
  <Card className="flex items-center gap-4 p-6 shadow-md">
    <div className="text-emerald-600 text-2xl">{icon}</div>
    <div>
      <p className="text-muted-foreground text-sm font-medium">{label}</p>
      <p className="text-2xl font-semibold text-emerald-700">{value}</p>
    </div>
  </Card>
);

export default function ShiftInsertPage() {
  return (
    <div className="flex flex-col lg:flex-row gap-8 p-8 font-[Mulish]">
      <div className="space-y-4 w-full max-w-xs">
        <CounterCard icon={<UsersIcon />} label="Operatori assegnati" value={30} />
        <CounterCard icon={<ClockIcon />} label="Ore assegnate" value={209} />
        <CounterCard icon={<FileTextIcon />} label="Ore evento" value={228} />
      </div>

      <div className="flex-1">
        <Card className="p-6">
          <CardContent className="space-y-6">
            <h2 className="text-xl font-semibold tracking-tight">Inserimento turno</h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Data</Label>
                <Input type="date" className="rounded-md" />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Tipologia</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleziona tipologia" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="doorman">Doorman</SelectItem>
                    <SelectItem value="presidio">Presidio</SelectItem>
                    <SelectItem value="gpg">GPG</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Note</Label>
                <Input placeholder="Note per il turno..." className="rounded-md" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-1">
                <Label className="text-muted-foreground">Ora inizio</Label>
                <Input type="time" className="rounded-md" />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">Ora fine</Label>
                <Input type="time" className="rounded-md" />
              </div>
              <div className="space-y-1">
                <Label className="text-muted-foreground">N. operatori</Label>
                <Input type="number" min={1} defaultValue={1} className="rounded-md" />
              </div>
            </div>

            <Button className="w-full mt-4 bg-emerald-600 hover:bg-emerald-700 text-white text-lg py-6 rounded-xl">
              Aggiungi turno
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
