// src/components/events/ShiftInsertForm.tsx
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CalendarIcon, ClockIcon, UsersIcon, StickyNoteIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";

const ShiftInsertForm = () => {
  const [date, setDate] = useState("");
  const [type, setType] = useState("");
  const [note, setNote] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [quantity, setQuantity] = useState(1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log({
      date,
      type,
      note,
      startTime,
      endTime,
      quantity,
    });
  };

  return (
    <div className="flex flex-col md:flex-row w-full gap-8 p-4">
      {/* Counter Sidebar */}
      <div className="w-full md:w-1/4 bg-white rounded-xl shadow p-4 space-y-6">
        <div className="flex items-center gap-2">
          <UsersIcon className="text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Operatori assegnati</p>
            <p className="text-xl font-bold text-green-700">30</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Ore assegnate</p>
            <p className="text-xl font-bold text-green-700">209.0</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ClockIcon className="text-green-500" />
          <div>
            <p className="text-sm text-gray-500">Ore evento</p>
            <p className="text-xl font-bold text-green-700">228.0</p>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <form
        onSubmit={handleSubmit}
        className="flex-1 bg-white rounded-xl shadow p-6 space-y-6"
      >
        <h2 className="text-2xl font-semibold text-gray-800">Inserimento turno</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="date">Data</Label>
            <div className="relative">
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="pr-10"
              />
              <CalendarIcon className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="type">Tipologia</Label>
            <Input
              id="type"
              placeholder="Seleziona tipologia"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="note">Note</Label>
            <div className="relative">
              <Input
                id="note"
                placeholder="Note per il turno"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <StickyNoteIcon className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="start">Ora Inizio</Label>
            <div className="relative">
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="pr-10"
              />
              <ClockIcon className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="end">Ora Fine</Label>
            <div className="relative">
              <Input
                id="end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="pr-10"
              />
              <ClockIcon className="absolute right-2 top-2.5 h-5 w-5 text-gray-400" />
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">Quantità</Label>
            <Input
              id="quantity"
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>
        </div>

        <Button type="submit" className="w-full mt-4">
          Aggiungi turno
        </Button>
      </form>
    </div>
  );
};

export default ShiftInsertForm;
