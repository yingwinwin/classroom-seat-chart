import ExcelJS from 'exceljs';
import type { Classroom } from '../types/classroom';
import type { Student } from '../types/studentList';
import { text, type Language } from './language';
import { getDisplayLayout, getGridColumnStart, getGridColumnWidths, type Seating, type ViewMode } from './seating';

const border = { style: 'thin' as const, color: { argb: 'FF000000' } };

export async function downloadExcel(classroom: Classroom, seating: Seating, students: Student[], mode: ViewMode, language: Language = 'ja') {
  const t = text[language];
  const studentNames = new Map(students.map((student) => [student.id, student.name]));
  const workbook = new ExcelJS.Workbook();
  workbook.creator = '座席表作成ツール';
  workbook.created = new Date();
  const sheet = workbook.addWorksheet(t.title);
  const layout = getDisplayLayout(classroom, seating, mode);
  const tableSlotWidths = getGridColumnWidths(classroom, mode);
  const maxColumns = tableSlotWidths.reduce((total, width) => total + width + 1, 0) - 1;
  const boardRow = mode === 'student' ? 3 : layout.length + 5;
  const firstColumn = 1;
  const lastColumn = maxColumns;
  const columnName = (column: number) => {
    let name = '';
    let value = column;
    while (value > 0) {
      const remainder = (value - 1) % 26;
      name = String.fromCharCode(65 + remainder) + name;
      value = Math.floor((value - 1) / 26);
    }
    return name;
  };
  sheet.mergeCells(`A1:${columnName(lastColumn)}1`);
  sheet.getCell('A1').value = classroom.name;
  sheet.getCell('A1').font = { name: 'Yu Gothic', size: 16, bold: true };
  sheet.getCell('A1').alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.mergeCells(`A${boardRow + 1}:${columnName(lastColumn)}${boardRow + 1}`);
  sheet.getCell(`A${boardRow + 1}`).value = t.front;
  sheet.getCell(`A${boardRow + 1}`).font = { name: 'Yu Gothic', size: 12, bold: true };
  sheet.getCell(`A${boardRow + 1}`).alignment = { horizontal: 'center', vertical: 'middle' };
  sheet.views = [{ showGridLines: false }];
  layout.forEach((row, rowIndex) => {
    row.forEach(({ table, columnIndex, seats }) => {
      const column = getGridColumnStart(tableSlotWidths, columnIndex) + firstColumn;
      for (let seat = 0; seat < table.seatCount; seat += 1) {
        const cell = sheet.getCell(rowIndex + 5, column + seat);
        const student = seats[seat].student;
        cell.value = student ? studentNames.get(student) ?? '' : '';
        cell.font = { name: 'Yu Gothic', size: 12 };
        cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true, textRotation: 0 };
        cell.border = { top: border, bottom: border, left: border, right: border };
      }
    });
  });
  tableSlotWidths.forEach((width, tableIndex) => {
    const column = getGridColumnStart(tableSlotWidths, tableIndex) + firstColumn;
    for (let offset = 0; offset < width; offset += 1) sheet.getColumn(column + offset).width = 14;
    if (tableIndex < tableSlotWidths.length - 1) sheet.getColumn(column + width).width = 4;
  });
  sheet.getRow(1).height = 26;
  sheet.getRow(boardRow + 1).height = 24;
  for (let row = 5; row < layout.length + 5; row += 1) sheet.getRow(row).height = 34;
  const lastRow = Math.max(layout.length + 4, boardRow + 1);
  sheet.pageSetup = { paperSize: 9, orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 1, horizontalDpi: 300, verticalDpi: 300, margins: { left: 0.25, right: 0.25, top: 0.5, bottom: 0.5, header: 0.2, footer: 0.2 }, printArea: `A1:${columnName(lastColumn)}${lastRow}` };
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${classroom.name}_${mode === 'teacher' ? t.teacherView : t.studentView}_${t.title}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}
