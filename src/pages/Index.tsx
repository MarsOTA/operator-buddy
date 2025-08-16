// src/pages/index.tsx
import React from "react";
import ShiftCard from "../components/ShiftCard";

export default function Home() {
  const shift = {
    id: "shift-1",
    date: "16/08/2025",
    startTime: "09:00",
    endTime: "21:00",
  };

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Gestione Turni</h1>
      <ShiftCard shift={shift} />
    </main>
  );
}
