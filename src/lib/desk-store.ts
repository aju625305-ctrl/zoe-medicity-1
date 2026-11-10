import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type Appointment,
  type Department,
  type StaffSession,
  SEED_NEXT_NUMBER,
  calculateFee,
  createSeed,
  generateAppointmentId,
} from "@/lib/hospital";

export type BookingDraft = {
  patient: string;
  age: number;
  phone: string;
  department: Department;
  doctor: string;
  date: string;
  baseFee: number;
  discount: number;
};

type DeskState = {
  session: StaffSession | null;
  appointments: Appointment[];
  nextNumber: number;
  signIn: (session: StaffSession) => void;
  signOut: () => void;
  book: (draft: BookingDraft) => Appointment;
  cancel: (id: string) => boolean;
  clearSamples: () => void;
};

export const useDesk = create<DeskState>()(
  persist(
    (set, get) => ({
      session: null,
      appointments: createSeed(),
      nextNumber: SEED_NEXT_NUMBER,
      signIn: (session) => set({ session }),
      signOut: () => set({ session: null }),
      book: (draft) => {
        const number = get().nextNumber;
        const appointment: Appointment = {
          id: generateAppointmentId(number),
          patient: draft.patient.trim(),
          age: draft.age,
          phone: draft.phone,
          department: draft.department,
          doctor: draft.doctor.trim(),
          date: draft.date,
          fee: calculateFee(draft.baseFee, draft.discount),
        };
        set({
          appointments: [...get().appointments, appointment],
          nextNumber: number + 1,
        });
        return appointment;
      },
      cancel: (id) => {
        const current = get().appointments;
        const next = current.filter((appointment) => appointment.id !== id);
        if (next.length === current.length) return false;
        set({ appointments: next });
        return true;
      },
      clearSamples: () =>
        set({
          appointments: get().appointments.filter((appointment) => !appointment.sample),
        }),
    }),
    {
      name: "zoe-medicity-desk",
      partialize: (state) => ({
        session: state.session,
        appointments: state.appointments,
        nextNumber: state.nextNumber,
      }),
    },
  ),
);
