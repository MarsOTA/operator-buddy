export const toMinutes = (hhmm: string) => {
  const [h, m] = (hhmm || "").split(":").map(Number);
  return (h || 0) * 60 + (m || 0);
};

export const formatHM = (mins: number) => {
  const v = Math.max(0, mins);
  const h = Math.floor(v / 60), m = v % 60;
  return h > 0 ? `${h}h${m ? ` ${m}m` : ""}` : `${m}m`;
};

// Interfaccia per i gap 
export interface Gap {
  start: string;
  end: string;
  durationMinutes: number;
  operatorsNeeded?: number; // Numero di operatori necessari per questo gap
}

function formatTime(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

// Calcola la copertura minuto per minuto per ogni slot temporale
function calculateCoverageByMinute({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix = "",
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: Array<{
    operatorId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }>;
  slotTimes?: Record<string, { start?: string; end?: string }>;
  slotKeyPrefix?: string;
}): number[] {
  const shiftStartMins = toMinutes(shiftStart);
  const shiftEndMins = toMinutes(shiftEnd);
  const shiftDurationMins = shiftEndMins - shiftStartMins;
  
  // Array che conta quanti operatori coprono ogni minuto
  const coverage = new Array(shiftDurationMins).fill(0);
  
  slots.forEach((slot, idx) => {
    if (!slot?.operatorId) return;
    
    const key = `${slotKeyPrefix}${idx}`;
    const start = slotTimes?.[key]?.start ?? slot.startTime ?? shiftStart;
    const end = slotTimes?.[key]?.end ?? slot.endTime ?? shiftEnd;
    
    const startMins = toMinutes(start);
    const endMins = toMinutes(end);
    
    // Incrementa il conteggio per ogni minuto coperto da questo slot
    for (let minute = Math.max(0, startMins - shiftStartMins); 
         minute < Math.min(shiftDurationMins, endMins - shiftStartMins); 
         minute++) {
      coverage[minute]++;
    }
  });
  
  return coverage;
}

// Trova i gap dove servono più operatori
export function findGapsInShift({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix = "",
  requiredOperators = 1, // Numero di operatori necessari contemporaneamente
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: Array<{
    operatorId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }>;
  slotTimes?: Record<string, { start?: string; end?: string }>;
  slotKeyPrefix?: string;
  requiredOperators?: number;
}): Gap[] {
  
  if (slots.length === 0) {
    return [{
      start: shiftStart,
      end: shiftEnd,
      durationMinutes: toMinutes(shiftEnd) - toMinutes(shiftStart),
      operatorsNeeded: requiredOperators
    }];
  }

  const shiftStartMins = toMinutes(shiftStart);
  const coverage = calculateCoverageByMinute({ 
    shiftStart, shiftEnd, slots, slotTimes, slotKeyPrefix 
  });
  
  const gaps: Gap[] = [];
  let gapStart: number | null = null;
  let maxOperatorsNeeded = 0;
  
  for (let minute = 0; minute < coverage.length; minute++) {
    const operatorsPresent = coverage[minute];
    const operatorsNeeded = Math.max(0, requiredOperators - operatorsPresent);
    
    if (operatorsNeeded > 0) {
      // Inizia un nuovo gap o continua quello esistente
      if (gapStart === null) {
        gapStart = minute;
        maxOperatorsNeeded = operatorsNeeded;
      } else {
        maxOperatorsNeeded = Math.max(maxOperatorsNeeded, operatorsNeeded);
      }
    } else {
      // Chiudi il gap se ne stavamo tracciando uno
      if (gapStart !== null) {
        gaps.push({
          start: formatTime(shiftStartMins + gapStart),
          end: formatTime(shiftStartMins + minute),
          durationMinutes: minute - gapStart,
          operatorsNeeded: maxOperatorsNeeded
        });
        gapStart = null;
        maxOperatorsNeeded = 0;
      }
    }
  }
  
  // Chiudi l'ultimo gap se necessario
  if (gapStart !== null) {
    gaps.push({
      start: formatTime(shiftStartMins + gapStart),
      end: shiftEnd,
      durationMinutes: coverage.length - gapStart,
      operatorsNeeded: maxOperatorsNeeded
    });
  }
  
  return gaps;
}

// Funzione per ottenere il primo gap
export function getFirstGap({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix = "",
  requiredOperators = 1,
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: Array<{
    operatorId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }>;
  slotTimes?: Record<string, { start?: string; end?: string }>;
  slotKeyPrefix?: string;
  requiredOperators?: number;
}): Gap | null {
  const gaps = findGapsInShift({ 
    shiftStart, shiftEnd, slots, slotTimes, slotKeyPrefix, requiredOperators 
  });
  return gaps.length > 0 ? gaps[0] : null;
}

// Calcola il totale di ore-operatore mancanti
export function totalUncoveredMinutes({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix = "",
  requiredOperators = 1,
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: Array<{
    operatorId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }>;
  slotTimes?: Record<string, { start?: string; end?: string }>;
  slotKeyPrefix?: string;
  requiredOperators?: number;
}): number {
  
  const coverage = calculateCoverageByMinute({ 
    shiftStart, shiftEnd, slots, slotTimes, slotKeyPrefix 
  });
  
  // Somma tutti i minuti-operatore mancanti
  return coverage.reduce((total, operatorsPresent) => {
    const operatorsMissing = Math.max(0, requiredOperators - operatorsPresent);
    return total + operatorsMissing;
  }, 0);
}

// Funzione legacy mantenuta per compatibilità
export function uncoveredForSlot({
  slot,
  shiftStart,
  shiftEnd,
  slotTime,
}: {
  slot: {
    operatorId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  };
  shiftStart: string;
  shiftEnd: string;
  slotTime?: { start?: string; end?: string };
}): number {
  if (!slot?.operatorId) return 0;
  const start = slotTime?.start ?? slot.startTime ?? shiftStart;
  const end   = slotTime?.end   ?? slot.endTime   ?? shiftEnd;
  const slotDur = Math.max(0, toMinutes(end) - toMinutes(start));
  const fullDur = Math.max(0, toMinutes(shiftEnd) - toMinutes(shiftStart));
  return Math.max(0, fullDur - slotDur);
}

// Funzione di debug per visualizzare la copertura
export function debugCoverage({
  shiftStart,
  shiftEnd,
  slots,
  slotTimes,
  slotKeyPrefix = "",
  requiredOperators = 1,
}: {
  shiftStart: string;
  shiftEnd: string;
  slots: Array<{
    operatorId?: string | null;
    startTime?: string | null;
    endTime?: string | null;
  }>;
  slotTimes?: Record<string, { start?: string; end?: string }>;
  slotKeyPrefix?: string;
  requiredOperators?: number;
}) {
  console.log(`\n=== DEBUG COVERAGE ===`);
  console.log(`Turno: ${shiftStart}-${shiftEnd}, Operatori richiesti: ${requiredOperators}`);
  
  const coverage = calculateCoverageByMinute({ 
    shiftStart, shiftEnd, slots, slotTimes, slotKeyPrefix 
  });
  
  const shiftStartMins = toMinutes(shiftStart);
  
  // Mostra copertura ogni 30 minuti per leggibilità
  for (let i = 0; i < coverage.length; i += 30) {
    const time = formatTime(shiftStartMins + i);
    const ops = coverage[i];
    const missing = Math.max(0, requiredOperators - ops);
    console.log(`${time}: ${ops}/${requiredOperators} operatori ${missing > 0 ? `(mancano ${missing})` : '✅'}`);
  }
  
  const totalMissing = totalUncoveredMinutes({
    shiftStart, shiftEnd, slots, slotTimes, slotKeyPrefix, requiredOperators
  });
  
  console.log(`\nTotale minuti-operatore mancanti: ${totalMissing} (${formatHM(totalMissing)})`);
  
  const gaps = findGapsInShift({
    shiftStart, shiftEnd, slots, slotTimes, slotKeyPrefix, requiredOperators
  });
  
  console.log(`\nGap trovati:`, gaps);
  console.log(`=== FINE DEBUG ===\n`);
}
