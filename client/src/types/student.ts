export interface AttendanceRecord {
  id: string;
  date: string;
  status: "PRESENT" | "ABSENT";
  method?: "MANUAL" | "QR";
}

export interface Student {
  id: string;
  studentCode: string;
  name: string;
  phone?: string;
  parentPhone?: string;
  address?: string;
  photo?: string;
  monthlyFee: number;
  isActive: boolean;

  class: {
    id: string;
    title: string;
  };

  group: {
    id: string;
    name: string;
  };

  // optional attendance data if backend includes it
  attendances?: AttendanceRecord[];
}
