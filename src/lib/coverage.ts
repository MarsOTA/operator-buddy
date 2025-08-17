// src/lib/coverage.ts

// ---------- Utils ----------
export function toMinutes(hhmm?: string | null): number {
  if (!hhmm) return 0;
  const [h, m] = hhmm.split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function formatHM(mins: number): string {
  const v = Math.max(0, Math.round(mins));
  const h = Math.floor(v / 60);
  const m = v % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export type Slot = {
  operatorId?: string | null;
  startTime?: string | null;
  endTime?: string | null;
};

export type SlotTimes = Record<string, { start?: string; end?: string }>;

type BaseParams = {
  shiftStart: string;
  shiftEnd: string;
  slots: Slot[];
  slotTimes?: SlotTimes;
  /** chiave per slotTimes: `${slotKeyPrefix}${index}` */
  slotKeyPrefix?: string;
};

// ------------------------------------------------------------------
// Copertura corretta in termini di ORE-OPERATORE
//  - domanda = durataTurno * requiredOperators
//  - copertura = integrale nel tempo di min( operatoriAttivi, requiredOperators )
//  - uncovered = domanda - copertura
// ------------------------------------------------------------------
export function totalUncoveredMinutes(
  params: BaseParams & { requiredOperators?: number }
): number {
  const {
    shiftStart,
    shiftEnd,
    slots,
    slotTimes,
    slotKeyPrefix = "",
    requiredOperators = 1,
  } = params;

  const S = toMinutes(shiftStart);
  const E = toMinutes(shiftEnd);
  const demand = Math.max(E - S, 0) * Math.max(requiredOperators, 0);

  // Eventi +1/-1 SOLO per slot assegnati
  const events: Array<[number, number]> = [];
  (slots || []).forEach((s, i) => {
    if (!s?.operatorId) return;
    const key = `${slotKeyPrefix}${i}`;
    const st = slotTimes?.[key]?.start ?? s.startTime ?? shiftStart;
    const en = slotTimes?.[key]?.end ?? s.endTime ?? shiftEnd;
    const a = Math.max(toMinutes(st), S);
    const b = Math.min(toMinutes(en), E);
    if (b > a) {
      events.push([a, +1]);
      events.push([b, -1]);
    }
  });

  if (events.length === 0) return demand; // nessuna copertura

  // Ordina temporalmente (a parità, +1 prima di -1)
  events.sort((x, y) => (x[0] === y[0] ? y[1] - x[1] : x[0] - y[0]));

  let covered = 0;
  let active = 0;
  let cur = S;

  for (let i = 0; i < events.length; i++) {
    const [t, delta] = events[i];

    if (t > cur) {
      const slice = t - cur;
      covered += Math.min(active, requiredOperators) * slice;
      cur = t;
    }
    active += delta;
  }

  // coda finale fino a E
  if (cur < E) {
    covered += Math.min(active, requiredOperators) * (E - cur);
  }

  return Math.max(demand - covered, 0);
}

// ------------------------------------------------------------------
// Primo "buco" rispetto alla capienza richiesta (per il bottone +Copri)
// Restituisce l'intervallo [start, end] dove active < requiredOperators
// ------------------------------------------------------------------
export function getFirstGapWithCapacity(
  params: BaseParams & { requiredOperators: number }
): { start: string; end: string } | null {
  const {
    shiftStart,
    shiftEnd,
    slots,
    slotTimes,
    slotKeyPrefix = "",
    requiredOperators,
  } = params;

  const S = toMinutes(shiftStart);
  const E = toMinutes(shiftEnd);

  const events: Array<[number, number]> = [];
  (slots || []).forEach((s, i) => {
    if (!s?.operatorId) return;
    const key = `${slotKeyPrefix}${i}`;
    const st = slotTimes?.[key]?.start ?? s.startTime ?? shiftStart;
    const en = slotTimes?.[key]?.end ?? s.endTime ?? shiftEnd;
    const a = Math.max(toMinutes(st), S);
    const b = Math.min(toMinutes(en), E);
    if (b > a) {
      events.push([a, +1]);
      events.push([b, -1]);
    }
  });

  if (events.length === 0) {
    return requiredOperators > 0 ? { start: shiftStart, end: shiftEnd } : null;
  }

  events.sort((x, y) => (x[0] === y[0] ? y[1] - x[1] : x[0] - y[0]));

  let active = 0;
  let cur = S;

  for (let i = 0; i < events.length; i++) {
    const [t, delta] = events[i];

    if (t > cur) {
      if (active < requiredOperators) {
        // gap inizia a cur, termina quando torniamo a capienza
        let j = i;
        let localActive = active;
        let endCursor = cur;

        while (j < events.length) {
          const [nt, nd] = events[j];

          if (nt > endCursor) {
            if (localActive >= requiredOperators) break;
            endCursor = nt;
          }

          localActive += nd;
          j++;

          if (localActive >= requiredOperators) break;
        }

        const gapEnd = localActive >= requiredOperators ? endCursor : E;
        return { start: mmToHHMM(cur), end: mmToHHMM(Math.min(gapEnd, E)) };
      }
      cur = t;
    }

    active += delta;
  }

  if (cur < E && active < requiredOperators) {
    return { start: mmToHHMM(cur), end: mmToHHMM(E) };
  }

  return null;
}

function mmToHHMM(x: number): string {
  const h = String(Math.floor(x / 60)).padStart(2, "0");
  const m = String(x % 60).padStart(2, "0");
  return `${h}:${m}`;
}
