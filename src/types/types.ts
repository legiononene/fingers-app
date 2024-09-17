export interface Student {
  name: string;
  aadhar_number: string;
  status: string;
}
export interface Batches {
  id: string;
  students: Student[];
  name: string;
  isActive: boolean;
}
export interface Users {
  id: string;
  username: string;
  batch: Batches[];
}

export interface DashboardType {
  batchCount: number;
  studentCount: number;
  studentStatus: Student[];
  userCount: number;
  user: Users[];
}

//*--------------

export interface UserType {
  user: Users;
}

export interface FingersType {
  id: number;
  scale: number;
  primary: string | null;
  studentId: number | null;
}
