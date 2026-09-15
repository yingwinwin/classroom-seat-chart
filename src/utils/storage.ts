import type { Classroom } from '../types/classroom';

const STORAGE_KEY = 'seating-chart-classrooms';

export function loadClassrooms(): Classroom[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is Classroom => {
      if (!item || typeof item !== 'object') return false;
      const classroom = item as Classroom;
      return typeof classroom.id === 'string' && typeof classroom.name === 'string' && Array.isArray(classroom.tables) && classroom.tables.every((row) => Array.isArray(row) && row.every((table) => table && typeof table.id === 'string' && (table.seatCount === 2 || table.seatCount === 3 || table.seatCount === 4)));
    });
  } catch { return []; }
}

export function saveClassrooms(classrooms: Classroom[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(classrooms));
}
