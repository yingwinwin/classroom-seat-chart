import type { Classroom, SeatKey, Table } from '../types/classroom';
import type { Student } from '../types/studentList';

export type Seating = (string | null)[][][];
export type ViewMode = 'teacher' | 'student';
export type DisplayTable = { table: Table; rowIndex: number; tableIndex: number; columnIndex: number; seats: { seatIndex: number; student: string | null }[] };
export type DisplayLayout = DisplayTable[][];

export function getGridColumnWidths(classroom: Classroom, mode: ViewMode): number[] {
  const widths = Array.from({ length: Math.max(...classroom.tables.map((row) => row.length), 1) }, (_, columnIndex) => Math.max(...classroom.tables.map((row) => row[columnIndex]?.seatCount ?? 0), 1));
  return mode === 'student' ? widths : [...widths].reverse();
}

export function getGridColumnStart(widths: number[], columnIndex: number) {
  return widths.slice(0, columnIndex).reduce((total, width) => total + width + 1, 0);
}

export function createEmptySeating(classroom: Classroom): Seating {
  return classroom.tables.map((row) => row.map((table) => Array<string | null>(table.seatCount).fill(null)));
}

export function countSeats(classroom: Classroom) {
  return classroom.tables.flat().reduce((total, table) => total + table.seatCount, 0);
}

export function assignStudents(classroom: Classroom, students: Student[]): Seating {
  const seats = createEmptySeating(classroom);
  let studentIndex = 0;
  seats.forEach((row) => row.forEach((table) => table.forEach((_, seatIndex) => {
    if (studentIndex < students.length) table[seatIndex] = students[studentIndex++].id;
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
  const columnCount = Math.max(...classroom.tables.map((row) => row.length), 1);
  const rows = classroom.tables.map((row, rowIndex) => row.map((table, tableIndex) => ({
    table,
    rowIndex,
    tableIndex,
    columnIndex: mode === 'student' ? tableIndex : columnCount - tableIndex - 1,
    seats: Array.from({ length: table.seatCount }, (_, seatIndex) => ({ seatIndex, student: seating[rowIndex]?.[tableIndex]?.[seatIndex] ?? null })),
  })));
  if (mode === 'student') return rows;
  return rows.reverse().map((row) => row.reverse().map((table) => ({ ...table, seats: [...table.seats].reverse() })));
}
