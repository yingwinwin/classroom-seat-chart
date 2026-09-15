import { text, type Language } from '../utils/language';

type Props = { value: string; onChange: (value: string) => void; language: Language };

export function StudentInput({ value, onChange, language }: Props) {
  const t = text[language];
  return <label className="student-input">
    <span>{t.students}</span>
    <textarea value={value} onChange={(event) => onChange(event.target.value)} placeholder={t.studentPlaceholder} />
  </label>;
}
