import { useEffect, useState } from 'react';
import type { Classroom, SeatCount } from '../types/classroom';
import { text, type Language } from '../utils/language';

type Props = { classroom?: Classroom; onSave: (classroom: Classroom) => void; onCancel: () => void; language: Language };

export function ClassroomEditor({ classroom, onSave, onCancel, language }: Props) {
  const t = text[language];
  const [name, setName] = useState(classroom?.name ?? '');
  const [rows, setRows] = useState<SeatCount[][]>(() => classroom?.tables.map((row) => row.map((table) => table.seatCount)) ?? [[2, 3, 2]]);
  useEffect(() => { setName(classroom?.name ?? ''); setRows(classroom?.tables.map((row) => row.map((table) => table.seatCount)) ?? [[2, 3, 2]]); }, [classroom]);
  const updateRow = (index: number, row: SeatCount[]) => setRows((current) => current.map((item, rowIndex) => rowIndex === index ? row : item));
  const save = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim() || rows.length === 0 || rows.some((row) => row.length === 0)) return;
    onSave({ id: classroom?.id ?? crypto.randomUUID(), name: name.trim(), tables: rows.map((row, rowIndex) => row.map((seatCount, tableIndex) => ({ id: classroom?.tables[rowIndex]?.[tableIndex]?.id ?? crypto.randomUUID(), seatCount }))) });
  };
  return <div className="modal-backdrop"><form className="classroom-editor" onSubmit={save}>
    <h2>{classroom ? t.editClassroom : t.newClassroom}</h2>
    <label>{t.classroomName}<input value={name} onChange={(event) => setName(event.target.value)} autoFocus /></label>
    <span className="field-label">{t.tableLayout}</span>
    <div className="layout-rows">{rows.map((row, rowIndex) => <div className="layout-row" key={rowIndex}>
      <strong>{t.row(rowIndex + 1)}</strong>
      {row.map((count, tableIndex) => <select key={tableIndex} aria-label={t.desk(count)} value={count} onChange={(event) => updateRow(rowIndex, row.map((item, index) => index === tableIndex ? Number(event.target.value) as SeatCount : item))}><option value="2">{t.desk(2)}</option><option value="3">{t.desk(3)}</option><option value="4">{t.desk(4)}</option></select>)}
      <button type="button" className="icon-button" aria-label={t.deleteTable} title={t.deleteTable} onClick={() => updateRow(rowIndex, row.slice(0, -1))}>−</button><button type="button" className="icon-button" aria-label={t.addTable} title={t.addTable} onClick={() => updateRow(rowIndex, [...row, 2])}>+</button>
      <button type="button" className="row-delete" onClick={() => setRows((current) => current.filter((_, index) => index !== rowIndex))}>{t.deleteRow}</button>
    </div>)}</div>
    <button type="button" className="add-row" onClick={() => setRows((current) => [...current, [2, 3, 2]])}>{t.addRow}</button>
    <div className="modal-actions"><button type="button" className="secondary" onClick={onCancel}>{t.cancel}</button><button type="submit">{t.save}</button></div>
  </form></div>;
}
