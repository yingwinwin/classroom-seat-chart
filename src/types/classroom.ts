export type SeatCount = 2 | 3 | 4;

export type Table = {
  id: string;
  seatCount: SeatCount;
};

export type Classroom = {
  id: string;
  name: string;
  tables: Table[][];
};

export type SeatKey = { rowIndex: number; tableIndex: number; seatIndex: number };
