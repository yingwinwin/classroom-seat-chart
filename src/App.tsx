import { useEffect, useMemo, useState } from 'react';
import { ClassroomEditor } from './components/ClassroomEditor';
import { SeatingChart } from './components/SeatingChart';
import { StudentInput } from './components/StudentInput';
import type { Classroom } from './types/classroom';
import { downloadExcel } from './utils/excel';
import { text } from './utils/language';
import { assignStudents, countSeats, createEmptySeating, swapSeats, type Seating, type ViewMode } from './utils/seating';
import { loadClassrooms, saveClassrooms } from './utils/storage';

export default function App() {
  const language = 'ja';
  const t = text[language];
  const [classrooms, setClassrooms] = useState<Classroom[]>(loadClassrooms);
  const [selectedId, setSelectedId] = useState('');
  const [studentsText, setStudentsText] = useState('');
  const [seating, setSeating] = useState<Seating>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('teacher');
  const [editor, setEditor] = useState<'new' | 'edit' | null>(null);
  const [error, setError] = useState('');
  const classroom = classrooms.find((item) => item.id === selectedId);
  const students = useMemo(() => studentsText.split('\n').map((name) => name.trim()).filter(Boolean), [studentsText]);

  useEffect(() => saveClassrooms(classrooms), [classrooms]);
  useEffect(() => {
    if (!selectedId && classrooms[0]) setSelectedId(classrooms[0].id);
    if (selectedId && !classrooms.some((item) => item.id === selectedId)) setSelectedId(classrooms[0]?.id ?? '');
  }, [classrooms, selectedId]);
  useEffect(() => { if (classroom) { setSeating(createEmptySeating(classroom)); setError(''); setViewMode('teacher'); } else setSeating([]); }, [selectedId]);

  const saveClassroom = (next: Classroom) => {
    setClassrooms((current) => current.some((item) => item.id === next.id) ? current.map((item) => item.id === next.id ? next : item) : [...current, next]);
    setSelectedId(next.id);
    setSeating(createEmptySeating(next));
    setViewMode('teacher');
    setEditor(null);
  };
  const autoAssign = () => {
    if (!classroom) return;
    if (students.length > countSeats(classroom)) { setError(t.tooMany); return; }
    setError('');
    setSeating(assignStudents(classroom, students));
  };
  const deleteClassroom = () => {
    if (classroom && window.confirm(t.confirmDelete(classroom.name))) setClassrooms((current) => current.filter((item) => item.id !== classroom.id));
  };

  return <main className="app-shell">
    <header><h1>{t.title}</h1></header>
    <section className="controls">
      <div className="classroom-controls"><label>{t.classroom}<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">{t.selectClassroom}</option>{classrooms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="secondary" disabled={!classroom} onClick={() => setEditor('edit')}>{t.edit}</button><button className="secondary" disabled={!classroom} onClick={deleteClassroom}>{t.remove}</button><button onClick={() => setEditor('new')}>{t.create}</button></div>
      <StudentInput value={studentsText} onChange={setStudentsText} language={language} />
      <div className="actions"><button disabled={!classroom} onClick={autoAssign}>{t.assign}</button>{error && <p className="error" role="alert">{error}</p>}</div>
    </section>
    {classroom ? <><SeatingChart classroom={classroom} seating={seating} mode={viewMode} onDrop={(from, to) => setSeating((current) => swapSeats(current, from, to))} language={language} /><footer><div className="view-switch" role="group" aria-label={t.teacherView}><button className={viewMode === 'teacher' ? 'active-view' : 'secondary'} onClick={() => setViewMode('teacher')}>{t.teacherView}</button><button className={viewMode === 'student' ? 'active-view' : 'secondary'} onClick={() => setViewMode('student')}>{t.studentView}</button></div><div className="excel-actions"><button className="secondary" onClick={() => downloadExcel(classroom, seating, 'teacher', language)}>{t.teacherExcel}</button><button onClick={() => downloadExcel(classroom, seating, 'student', language)}>{t.studentExcel}</button></div></footer></> : <p className="empty-state">{t.noClassroom}</p>}
    {editor && <ClassroomEditor classroom={editor === 'edit' ? classroom : undefined} onSave={saveClassroom} onCancel={() => setEditor(null)} language={language} />}
  </main>;
}
