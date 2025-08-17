import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ShiftInsertForm = () => {
  return (
    <div className="p-6">
      <Card className="max-w-4xl mx-auto rounded-2xl shadow-lg">
        <CardContent className="p-6 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="date">Data</Label>
              <Input id="date" type="date" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="start">Ora Inizio</Label>
              <Input id="start" type="time" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="end">Ora Fine</Label>
              <Input id="end" type="time" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="activity">Tipo Attività</Label>
              <Input id="activity" placeholder="Es. doorman" />
            </div>
            <div className="flex flex-col space-y-1.5">
              <Label htmlFor="operator">Operatori Richiesti</Label>
              <Input id="operator" type="number" min={1} defaultValue={1} />
            </div>
          </div>

          <div className="flex flex-col space-y-1.5">
            <Label htmlFor="note">Note</Label>
            <Input id="note" placeholder="Aggiungi eventuali note" />
          </div>

          <div className="pt-4 text-right">
            <Button>Salva Turno</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ShiftInsertForm;
