import type { Classroom, SeatKey, Table } from '../types/classroom';

export type Seating = (string | null)[][][];
export type ViewMode = 'teacher' | 'student';
export type DisplayTable = { table: Table; rowIndex: number; tableIndex: number; seats: { seatIndex: number; student: string | null }[] };
export type DisplayLayout = DisplayTable[][];

export function createEmptySeating(classroom: Classroom): Seating {
  return classroom.tables.map((row) => row.map((table) => Array<string | null>(table.seatCount).fill(null)));
}

export function countSeats(classroom: Classroom) {
  return classroom.tables.flat().reduce((total, table) => total + table.seatCount, 0);
}

export function assignStudents(classroom: Classroom, students: string[]): Seating {
  const seats = createEmptySeating(classroom);
  let studentIndex = 0;
  seats.forEach((row) => row.forEach((table) => table.forEach((_, seatIndex) => {
    if (studentIndex < students.length) table[seatIndex] = students[studentIndex++];
  })));
  return seats;
}

export function swapSeats(seating: Seating, from: SeatKey, to: SeatKey): Seating {
  const next = seating.map((row) => row.map((table) => [...table]));
  const value = next[from.rowIndex][from.tableIndex][from.seatIndex];
  next[from.rowIndex][from.tableIndex][from.seatIndex] = next[to.rowIndex][to.tableIndex][to.seatIndex];
  next[to.rowIndex][to.tableIndex][to.seatIndex] = value;
  return next;
}

// Returns a display-only orientation. The classroom and seating state are never mutated.
export function getDisplayLayout(classroom: Classroom, seating: Seating, mode: ViewMode): DisplayLayout {
  const rows = classroom.tables.map((row, rowIndex) => row.map((table, tableIndex) => ({
    table,
    rowIndex,
    tableIndex,
    seats: Array.from({ length: table.seatCount }, (_, seatIndex) => ({ seatIndex, student: seating[rowIndex]?.[tableIndex]?.[seatIndex] ?? null })),
  })));
  if (mode === 'teacher') return rows;
  return rows.reverse().map((row) => row.reverse().map((table) => ({ ...table, seats: [...table.seats].reverse() })));
}
