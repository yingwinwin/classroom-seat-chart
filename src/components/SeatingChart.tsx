import type { CSSProperties } from 'react';
import type { Classroom, SeatKey } from '../types/classroom';
import type { Student } from '../types/studentList';
import { text, type Language } from '../utils/language';
import { getDisplayLayout, getGridColumnStart, getGridColumnWidths, type Seating, type ViewMode } from '../utils/seating';

type Props = { classroom: Classroom; seating: Seating; students: Student[]; mode: ViewMode; onDrop: (from: SeatKey, to: SeatKey) => void; language: Language };

export function SeatingChart({ classroom, seating, students, mode, onDrop, language }: Props) {
  const t = text[language];
  const studentNames = new Map(students.map((student) => [student.id, student.name]));
  const layout = getDisplayLayout(classroom, seating, mode);
  const gridWidths = getGridColumnWidths(classroom, mode);
  const gridTemplateColumns = gridWidths.flatMap((width, index) => [
    ...Array.from({ length: width }, () => '86px'),
    ...(index < gridWidths.length - 1 ? ['40px'] : []),
  ]).join(' ');
  const board = <div className="board"><span>{t.front}</span></div>;
  return <section className="seating-section" aria-label={t.title}>{mode === 'student' && board}<div className="seat-chart">
    {layout.map((row, displayRowIndex) => {
      return <div className="table-row" key={displayRowIndex} style={{ gridTemplateColumns }}>{row.map(({ table, rowIndex, tableIndex, columnIndex, seats }) => {
        return <div className="student-table" key={table.id} style={{ '--seats': table.seatCount, gridColumn: `${getGridColumnStart(gridWidths, columnIndex) + 1} / span ${table.seatCount}` } as CSSProperties}>{seats.map(({ seatIndex, student }) => {
          const seat = { rowIndex, tableIndex, seatIndex };
          return <div className={`seat ${student ? 'occupied' : ''}`} key={seatIndex} draggable={Boolean(student)} onDragStart={(event) => { if (student) event.dataTransfer.setData('application/seat', JSON.stringify(seat)); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const raw = event.dataTransfer.getData('application/seat'); if (raw) onDrop(JSON.parse(raw) as SeatKey, seat); }}><span>{student ? studentNames.get(student) ?? t.emptySeat : t.emptySeat}</span></div>;
        })}</div>;
      })}</div>;
    })}
  </div>{mode === 'teacher' && board}</section>;
}
