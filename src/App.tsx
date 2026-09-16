import { useEffect, useState } from 'react';
import { ClassroomEditor } from './components/ClassroomEditor';
import { SeatingChart } from './components/SeatingChart';
import { StudentInput } from './components/StudentInput';
import type { Classroom } from './types/classroom';
import type { Student, StudentList } from './types/studentList';
import { downloadExcel } from './utils/excel';
import { text } from './utils/language';
import { assignStudents, countSeats, createEmptySeating, swapSeats, type Seating, type ViewMode } from './utils/seating';
import { loadClassrooms, loadStudentLists, saveClassrooms, saveStudentLists } from './utils/storage';

function createId() {
  return crypto.randomUUID();
}

export default function App() {
  const language = 'ja';
  const t = text[language];
  const [classrooms, setClassrooms] = useState<Classroom[]>(loadClassrooms);
  const [studentLists, setStudentLists] = useState<StudentList[]>(loadStudentLists);
  const [selectedId, setSelectedId] = useState('');
  const [students, setStudents] = useState<Student[]>([]);
  const [selectedListId, setSelectedListId] = useState('');
  const [listName, setListName] = useState('');
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [seating, setSeating] = useState<Seating>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('student');
  const [editor, setEditor] = useState<'new' | 'edit' | null>(null);
  const [error, setError] = useState('');
  const classroom = classrooms.find((item) => item.id === selectedId);
  const studentsText = students.map((student) => student.name).join('\n');

  useEffect(() => saveClassrooms(classrooms), [classrooms]);
  useEffect(() => saveStudentLists(studentLists), [studentLists]);
  useEffect(() => {
    if (!selectedId && classrooms[0]) setSelectedId(classrooms[0].id);
    if (selectedId && !classrooms.some((item) => item.id === selectedId)) setSelectedId(classrooms[0]?.id ?? '');
  }, [classrooms, selectedId]);
  useEffect(() => { if (classroom) { setSeating(createEmptySeating(classroom)); setError(''); setViewMode('student'); } else setSeating([]); }, [selectedId]);

  const saveClassroom = (next: Classroom) => {
    setClassrooms((current) => current.some((item) => item.id === next.id) ? current.map((item) => item.id === next.id ? next : item) : [...current, next]);
    setSelectedId(next.id);
    setSeating(createEmptySeating(next));
    setViewMode('student');
    setEditor(null);
  };
  const autoAssign = () => {
    if (!classroom) return;
    if (students.length > countSeats(classroom)) { setError(t.tooMany); return; }
    setError('');
    setSeating(assignStudents(classroom, students));
  };
  const updateStudentsText = (value: string) => {
    const names = value.split('\n').map((name) => name.trim()).filter(Boolean);
    setStudents((current) => names.map((name, index) => ({ id: current[index]?.id ?? createId(), name })));
  };
  const readStudentList = () => {
    const list = studentLists.find((item) => item.id === selectedListId);
    if (!list) return;
    setStudents(list.students);
    setListName(list.name);
    setEditingListId(null);
    setError('');
  };
  const beginEditStudentList = () => {
    const list = studentLists.find((item) => item.id === selectedListId);
    if (!list) return;
    setStudents(list.students);
    setListName(list.name);
    setEditingListId(list.id);
    setError('');
  };
  const saveStudentList = () => {
    const trimmedName = listName.trim();
    if (!trimmedName) { setError(t.listNameRequired); return; }
    const now = new Date().toISOString();
    const nextList: StudentList = { id: editingListId ?? createId(), name: trimmedName, students, createdAt: editingListId ? studentLists.find((item) => item.id === editingListId)?.createdAt ?? now : now, updatedAt: now };
    setStudentLists((current) => editingListId ? current.map((item) => item.id === editingListId ? nextList : item) : [...current, nextList]);
    setSelectedListId(nextList.id);
    setEditingListId(null);
    setError('');
  };
  const deleteStudentList = () => {
    const list = studentLists.find((item) => item.id === selectedListId);
    if (!list || !window.confirm(t.confirmDelete(list.name))) return;
    setStudentLists((current) => current.filter((item) => item.id !== list.id));
    setSelectedListId('');
    setEditingListId(null);
  };
  const deleteClassroom = () => {
    if (classroom && window.confirm(t.confirmDelete(classroom.name))) setClassrooms((current) => current.filter((item) => item.id !== classroom.id));
  };

  return <main className="app-shell">
    <header><h1>{t.title}</h1></header>
    <section className="controls">
      <div className="classroom-controls"><label>{t.classroom}<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">{t.selectClassroom}</option>{classrooms.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><button className="secondary" disabled={!classroom} onClick={() => setEditor('edit')}>{t.edit}</button><button className="secondary" disabled={!classroom} onClick={deleteClassroom}>{t.remove}</button><button onClick={() => setEditor('new')}>{t.create}</button></div>
      <StudentInput value={studentsText} onChange={updateStudentsText} language={language} />
      <div className="student-list-tools">
        <label>{t.listName}<input value={listName} onChange={(event) => setListName(event.target.value)} placeholder={t.listName} /></label>
        <span>{t.studentCount(students.length)}</span>
        <button onClick={saveStudentList}>{t.saveList}</button>
        <label>{t.savedLists}<select value={selectedListId} onChange={(event) => setSelectedListId(event.target.value)}><option value="">{t.selectList}</option>{studentLists.map((list) => <option key={list.id} value={list.id}>{list.name}</option>)}</select></label>
        <div className="student-list-actions"><button className="secondary" disabled={!selectedListId} onClick={readStudentList}>{t.readList}</button><button className="secondary" disabled={!selectedListId} onClick={beginEditStudentList}>{t.editList}</button><button className="secondary" disabled={!selectedListId} onClick={deleteStudentList}>{t.deleteList}</button></div>
      </div>
      <div className="actions"><button disabled={!classroom} onClick={autoAssign}>{t.assign}</button>{error && <p className="error" role="alert">{error}</p>}</div>
    </section>
    {classroom ? <><SeatingChart classroom={classroom} seating={seating} students={students} mode={viewMode} onDrop={(from, to) => setSeating((current) => swapSeats(current, from, to))} language={language} /><footer><div className="view-switch" role="group" aria-label={t.teacherView}><button className={viewMode === 'teacher' ? 'active-view' : 'secondary'} onClick={() => setViewMode('teacher')}>{t.teacherView}</button><button className={viewMode === 'student' ? 'active-view' : 'secondary'} onClick={() => setViewMode('student')}>{t.studentView}</button></div><div className="excel-actions"><button className="secondary" onClick={() => downloadExcel(classroom, seating, students, 'teacher', language)}>{t.teacherExcel}</button><button onClick={() => downloadExcel(classroom, seating, students, 'student', language)}>{t.studentExcel}</button></div></footer></> : <p className="empty-state">{t.noClassroom}</p>}
    {editor && <ClassroomEditor classroom={editor === 'edit' ? classroom : undefined} onSave={saveClassroom} onCancel={() => setEditor(null)} language={language} />}
  </main>;
}
