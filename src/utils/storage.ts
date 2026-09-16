import type { Classroom } from '../types/classroom';
import type { StudentList } from '../types/studentList';

const STORAGE_KEY = 'seating-chart-classrooms';
const STUDENT_LISTS_KEY = 'seating-chart-student-lists';

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

export function loadStudentLists(): StudentList[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem(STUDENT_LISTS_KEY) ?? '[]');
    if (!Array.isArray(value)) return [];
    return value.filter((item): item is StudentList => {
      if (!item || typeof item !== 'object') return false;
      const list = item as StudentList;
      return typeof list.id === 'string' && typeof list.name === 'string' && Array.isArray(list.students)
        && typeof list.createdAt === 'string' && typeof list.updatedAt === 'string'
        && list.students.every((student) => student && typeof student.id === 'string' && typeof student.name === 'string');
    });
  } catch { return []; }
}

export function saveStudentLists(lists: StudentList[]) {
  localStorage.setItem(STUDENT_LISTS_KEY, JSON.stringify(lists));
}
