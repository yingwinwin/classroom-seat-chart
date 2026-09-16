export type Student = {
  id: string;
  name: string;
};

export type StudentList = {
  id: string;
  name: string;
  students: Student[];
  createdAt: string;
  updatedAt: string;
};