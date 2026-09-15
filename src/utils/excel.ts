import * as XLSX from 'xlsx';
import type { Classroom } from '../types/classroom';
import { text, type Language } from './language';
import { getDisplayLayout, type Seating, type ViewMode } from './seating';

const border = { top: { style: 'thin' }, bottom: { style: 'thin' }, left: { style: 'thin' }, right: { style: 'thin' } } as const;

export function downloadExcel(classroom: Classroom, seating: Seating, mode: ViewMode, language: Language = 'ja') {
  const t = text[language];
  const sheet = XLSX.utils.aoa_to_sheet([]);
  const layout = getDisplayLayout(classroom, seating, mode);
  const maxColumns = Math.max(...classroom.tables.map((row) => row.reduce((total, table) => total + table.seatCount + 1, 0)), 1);
  const merges: XLSX.Range[] = [XLSX.utils.decode_range(`A1:${XLSX.utils.encode_cell({ r: 0, c: maxColumns - 1 })}`)];
  XLSX.utils.sheet_add_aoa(sheet, [[`${classroom.name} ${t.title}`]], { origin: 'A1' });
  XLSX.utils.sheet_add_aoa(sheet, [[t.front]], { origin: 'A3' });
  layout.forEach((row, rowIndex) => {
    let column = 0;
    row.forEach(({ table, seats }) => {
      XLSX.utils.sheet_add_aoa(sheet, [seats.map((seat) => seat.student ?? '')], { origin: { r: rowIndex + 4, c: column } });
      for (let seat = 0; seat < table.seatCount; seat += 1) {
        const cell = XLSX.utils.encode_cell({ r: rowIndex + 4, c: column + seat });
        if (!sheet[cell]) sheet[cell] = { t: 's', v: '' };
        sheet[cell].s = { border, alignment: { horizontal: 'center', vertical: 'center', wrapText: true } };
      }
      column += table.seatCount + 1;
    });
  });
  sheet['!merges'] = merges;
  sheet['!cols'] = Array.from({ length: maxColumns }, () => ({ wch: 12 }));
  sheet['!rows'] = Array.from({ length: classroom.tables.length + 6 }, (_, index) => ({ hpt: index === 0 ? 24 : 32 }));
  sheet['!pageSetup'] = { orientation: 'landscape', paperSize: '9', fitToWidth: 1, fitToHeight: 1 };
  sheet.A1.s = { font: { bold: true, sz: 16 }, alignment: { horizontal: 'center' } };
  sheet.A3.s = { font: { bold: true }, alignment: { horizontal: 'center' } };
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, sheet, t.title);
  XLSX.writeFile(workbook, `${classroom.name}_${mode === 'teacher' ? t.teacherView : t.studentView}_${t.title}.xlsx`);
}
