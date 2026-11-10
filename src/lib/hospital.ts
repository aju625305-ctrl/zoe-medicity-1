export const DEPARTMENTS = [
  "General Medicine",
  "Cardiology",
  "Dermatology",
  "Orthopaedics",
  "Paediatrics",
] as const;

export type Department = (typeof DEPARTMENTS)[number];

export const DOCTORS: Record<Department, readonly string[]> = {
  "General Medicine": ["Dr. Meera Iyer", "Dr. Arun Shah"],
  Cardiology: ["Dr. Leela Nair", "Dr. Vikram Bose"],
  Dermatology: ["Dr. Sana Qureshi", "Dr. Imran Lal"],
  Orthopaedics: ["Dr. Rohan Desai", "Dr. Kavya Menon"],
  Paediatrics: ["Dr. Anika Rao", "Dr. Farhan Qadri"],
};

export const PILLARS = [
  { title: "Better Care", detail: "Every visit is written down and easy to find." },
  { title: "A Healthier Tomorrow", detail: "The ward list stays ready for the next shift." },
  { title: "Trusted Always", detail: "Records stay on this desk, on this device." },
] as const;

export type Appointment = {
  id: string;
  patient: string;
  age: number;
  phone: string;
  department: Department;
  doctor: string;
  date: string;
  fee: number;
  sample?: boolean;
};

export type StaffRole = "Reception" | "Consultant" | "Admin";

export type StaffSession = {
  name: string;
  role: StaffRole;
};

export function generateAppointmentId(number: number): string {
  return "APT" + String(number).padStart(3, "0");
}

export function calculateFee(fee = 500, discount = 0): number {
  return fee - discount;
}

export function searchPatient(appointments: Appointment[], patientName: string): Appointment[] {
  const query = patientName.trim().toLowerCase();
  if (!query) return [];
  return appointments.filter((appointment) => appointment.patient.toLowerCase() === query);
}

export function countAppointments(appointments: Appointment[]): number {
  return appointments.length;
}

export function formatDisplayDate(iso: string): string {
  const [year, month, day] = iso.split("-");
  if (!year || !month || !day) return iso;
  return `${day}-${month}-${year}`;
}

export function formatPhone(phone: string): string {
  if (phone.length !== 10) return phone;
  return `${phone.slice(0, 5)} ${phone.slice(5)}`;
}

export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export function todayIso(now = new Date()): string {
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function shiftIso(days: number, now = new Date()): string {
  const next = new Date(now);
  next.setDate(next.getDate() + days);
  return todayIso(next);
}

export function greeting(now = new Date()): string {
  const hour = now.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function createSeed(now = new Date()): Appointment[] {
  return [
    {
      id: "APT001",
      patient: "Aisha Rahman",
      age: 34,
      phone: "9845011122",
      department: "Cardiology",
      doctor: "Dr. Leela Nair",
      date: todayIso(now),
      fee: 500,
      sample: true,
    },
    {
      id: "APT002",
      patient: "Rohan Deshmukh",
      age: 8,
      phone: "9810099344",
      department: "Paediatrics",
      doctor: "Dr. Anika Rao",
      date: todayIso(now),
      fee: 450,
      sample: true,
    },
    {
      id: "APT003",
      patient: "Meera Krishnan",
      age: 57,
      phone: "9900123488",
      department: "Orthopaedics",
      doctor: "Dr. Rohan Desai",
      date: shiftIso(1, now),
      fee: 700,
      sample: true,
    },
    {
      id: "APT004",
      patient: "Imran Qureshi",
      age: 41,
      phone: "9765432109",
      department: "Dermatology",
      doctor: "Dr. Sana Qureshi",
      date: shiftIso(1, now),
      fee: 500,
      sample: true,
    },
    {
      id: "APT005",
      patient: "Aisha Rahman",
      age: 34,
      phone: "9845011122",
      department: "General Medicine",
      doctor: "Dr. Meera Iyer",
      date: shiftIso(3, now),
      fee: 400,
      sample: true,
    },
  ];
}

export const DEFAULT_FEE = 500;
export const SEED_NEXT_NUMBER = 6;
