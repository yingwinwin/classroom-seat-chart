import type { CSSProperties } from 'react';
import type { Classroom, SeatKey } from '../types/classroom';
import { text, type Language } from '../utils/language';
import { getDisplayLayout, type Seating, type ViewMode } from '../utils/seating';

type Props = { classroom: Classroom; seating: Seating; mode: ViewMode; onDrop: (from: SeatKey, to: SeatKey) => void; language: Language };

export function SeatingChart({ classroom, seating, mode, onDrop, language }: Props) {
  const t = text[language];
  const layout = getDisplayLayout(classroom, seating, mode);
  return <section className="seating-section" aria-label={t.title}><div className="board"><span>{t.front}</span></div><div className="seat-chart">
    {layout.map((row, displayRowIndex) => {
      return <div className="table-row" key={displayRowIndex}>{row.map(({ table, rowIndex, tableIndex, seats }) => {
        return <div className="student-table" key={table.id} style={{ '--seats': table.seatCount } as CSSProperties}>{seats.map(({ seatIndex, student }) => {
          const seat = { rowIndex, tableIndex, seatIndex };
          return <div className={`seat ${student ? 'occupied' : ''}`} key={seatIndex} draggable={Boolean(student)} onDragStart={(event) => { if (student) event.dataTransfer.setData('application/seat', JSON.stringify(seat)); }} onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const raw = event.dataTransfer.getData('application/seat'); if (raw) onDrop(JSON.parse(raw) as SeatKey, seat); }}><span>{student ?? t.emptySeat}</span></div>;
        })}</div>;
      })}</div>;
    })}
  </div></section>;
}
