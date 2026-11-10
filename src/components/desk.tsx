import { useMemo, useState, type FormEvent } from "react";
import {
  Baby,
  BarChart3,
  Bone,
  CalendarPlus,
  ClipboardList,
  Droplets,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  Search,
  ShieldCheck,
  Stethoscope,
  Users,
} from "lucide-react";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Wordmark } from "@/components/mark";
import { useDesk, type BookingDraft } from "@/lib/desk-store";
import {
  DEPARTMENTS,
  DOCTORS,
  PILLARS,
  type Appointment,
  type Department,
  calculateFee,
  countAppointments,
  formatDisplayDate,
  formatPhone,
  formatRupees,
  generateAppointmentId,
  greeting,
  searchPatient,
  todayIso,
} from "@/lib/hospital";

type Tab = "desk" | "book" | "registry" | "insights";

const NAV: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "desk", label: "Desk", icon: LayoutDashboard },
  { id: "book", label: "Book", icon: CalendarPlus },
  { id: "registry", label: "Registry", icon: ClipboardList },
  { id: "insights", label: "Insights", icon: BarChart3 },
];

const DEPT_ICON: Record<Department, typeof Stethoscope> = {
  "General Medicine": Stethoscope,
  Cardiology: HeartPulse,
  Dermatology: Droplets,
  Orthopaedics: Bone,
  Paediatrics: Baby,
};

const SHORT_DEPT: Record<Department, string> = {
  "General Medicine": "General",
  Cardiology: "Cardio",
  Dermatology: "Derm",
  Orthopaedics: "Ortho",
  Paediatrics: "Paeds",
};

const PILLAR_ICONS = [HeartPulse, Users, ShieldCheck] as const;

type FormState = {
  department: Department | "";
  patient: string;
  age: string;
  phone: string;
  doctor: string;
  date: string;
  baseFee: string;
  discount: string;
};

const EMPTY_FORM: FormState = {
  department: "",
  patient: "",
  age: "",
  phone: "",
  doctor: "",
  date: "",
  baseFee: "500",
  discount: "0",
};

function fieldClass(invalid: boolean) {
  return (
    "mt-2 w-full rounded-md border bg-mist px-3 py-3 text-base font-medium text-ink placeholder:font-normal placeholder:text-muted " +
    (invalid ? "border-navy" : "border-line")
  );
}

export function Desk() {
  const session = useDesk((state) => state.session);
  const signOut = useDesk((state) => state.signOut);
  const [tab, setTab] = useState<Tab>("desk");

  if (!session) return null;

  return (
    <div className="min-h-dvh bg-sky lg:grid lg:grid-cols-[17.5rem_minmax(0,1fr)]">
      <aside className="hidden bg-navy text-white lg:flex lg:min-h-dvh lg:flex-col lg:px-5 lg:py-6">
        <Wordmark light />
        <nav className="mt-8 flex flex-col gap-1" aria-label="Desk">
          {NAV.map((item) => (
            <NavButton key={item.id} item={item} active={tab === item.id} onSelect={setTab} />
          ))}
        </nav>
        <div className="mt-auto">
          <ul className="space-y-3 border-t border-white/15 pt-5">
            {PILLARS.map((pillar, index) => {
              const Icon = PILLAR_ICONS[index];
              return (
                <li key={pillar.title} className="flex gap-3">
                  <Icon className="mt-0.5 size-4 shrink-0 text-leaf" aria-hidden="true" />
                  <span>
                    <span className="block text-sm font-semibold">{pillar.title}</span>
                    <span className="block text-xs leading-snug text-white/70">{pillar.detail}</span>
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="mt-5 rounded-md bg-white/10 px-3 py-3">
            <p className="text-sm font-semibold">{session.name}</p>
            <p className="text-xs text-white/70">{session.role}</p>
            <button
              type="button"
              onClick={signOut}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-md border border-white/25 text-sm font-semibold"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
      </aside>

      <div className="min-w-0">
        <header className="sticky top-0 z-20 flex items-center justify-between gap-3 border-b border-line bg-surface px-4 py-3 lg:hidden">
          <Wordmark />
          <button
            type="button"
            onClick={signOut}
            className="inline-flex min-h-11 items-center gap-1 rounded-md px-2 text-sm font-semibold text-navy"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Out
          </button>
        </header>

        <main className="mx-auto w-full max-w-5xl px-4 py-5 pb-28 lg:px-8 lg:py-8 lg:pb-10">
          {tab === "desk" ? <DeskHome onBook={() => setTab("book")} /> : null}
          {tab === "book" ? <BookPanel /> : null}
          {tab === "registry" ? <Registry /> : null}
          {tab === "insights" ? <Insights /> : null}
        </main>

        <nav
          className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-surface px-2 py-1 lg:hidden"
          aria-label="Desk"
        >
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={
                  active
                    ? "flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-semibold text-blue"
                    : "flex min-h-14 flex-col items-center justify-center gap-1 text-xs font-medium text-muted"
                }
              >
                <Icon className="size-5" aria-hidden="true" />
                {item.label}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

function NavButton({
  item,
  active,
  onSelect,
}: {
  item: (typeof NAV)[number];
  active: boolean;
  onSelect: (tab: Tab) => void;
}) {
  const Icon = item.icon;
  return (
    <button
      type="button"
      onClick={() => onSelect(item.id)}
      className={
        active
          ? "flex min-h-11 items-center gap-3 rounded-md bg-white/20 px-3 text-left text-sm font-semibold text-white"
          : "flex min-h-11 items-center gap-3 rounded-md px-3 text-left text-sm font-medium text-white/75 hover:bg-white/10 hover:text-white"
      }
    >
      <Icon className="size-4" aria-hidden="true" />
      {item.id === "book" ? "Book appointment" : item.label}
    </button>
  );
}

function SampleNote() {
  const appointments = useDesk((state) => state.appointments);
  const clearSamples = useDesk((state) => state.clearSamples);
  const hasSample = appointments.some((appointment) => appointment.sample);
  if (!hasSample) return null;
  return (
    <div className="mb-5 flex flex-col gap-3 rounded-md border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted">
        A sample ward list is on the desk so search, cancel, and statistics have something to show.
      </p>
      <button
        type="button"
        onClick={clearSamples}
        className="min-h-11 shrink-0 rounded-md border border-line px-3 text-sm font-semibold text-ink"
      >
        Clear samples
      </button>
    </div>
  );
}

function DeskHome({ onBook }: { onBook: () => void }) {
  const session = useDesk((state) => state.session);
  const appointments = useDesk((state) => state.appointments);
  const today = todayIso();
  const todays = appointments.filter((appointment) => appointment.date === today);
  const upcoming = [...appointments]
    .filter((appointment) => appointment.date >= today)
    .sort((a, b) => a.date.localeCompare(b.date) || a.patient.localeCompare(b.patient));
  const collected = appointments.reduce((sum, appointment) => sum + appointment.fee, 0);
  const first = session?.name.split(" ")[0] ?? "there";

  return (
    <div className="rise">
      <SampleNote />
      <section className="rounded-lg bg-navy px-5 py-6 text-white sm:px-7">
        <p className="text-sm font-medium text-white/75">
          {session?.role} desk · {formatDisplayDate(today)}
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
          {greeting()}, {first}.
        </h1>
        <p className="mt-2 max-w-xl text-sm text-white/80">
          Zoe Medicity reception. Book a visit, find a patient, or close a slip that is no longer needed.
        </p>
        <button
          type="button"
          onClick={onBook}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-md bg-white px-4 text-sm font-semibold text-navy"
        >
          <CalendarPlus className="size-4" aria-hidden="true" />
          Book appointment
        </button>
      </section>

      <dl className="mt-4 grid grid-cols-3 gap-3">
        <Stat label="On the books" value={String(countAppointments(appointments))} />
        <Stat label="Today" value={String(todays.length)} />
        <Stat label="Fees booked" value={formatRupees(collected)} />
      </dl>

      <section className="mt-6">
        <h2 className="text-lg font-bold text-ink">Today’s list</h2>
        {todays.length === 0 ? (
          <p className="mt-3 rounded-md border border-dashed border-line bg-surface px-4 py-6 text-sm text-muted">
            No one is booked for today. The next visits are below, or book a new one.
          </p>
        ) : (
          <ul className="mt-3 space-y-3">
            {todays.map((appointment) => (
              <li key={appointment.id}>
                <AppointmentCard appointment={appointment} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {upcoming.length > todays.length ? (
        <section className="mt-6">
          <h2 className="text-lg font-bold text-ink">Coming up</h2>
          <ul className="mt-3 space-y-3">
            {upcoming
              .filter((appointment) => appointment.date !== today)
              .slice(0, 4)
              .map((appointment) => (
                <li key={appointment.id}>
                  <AppointmentCard appointment={appointment} />
                </li>
              ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-3 sm:px-4">
      <dt className="text-xs font-medium text-muted">{label}</dt>
      <dd className="mt-1 text-lg font-bold tabular-nums text-ink sm:text-2xl">{value}</dd>
    </div>
  );
}

function AppointmentCard({ appointment }: { appointment: Appointment }) {
  const cancel = useDesk((state) => state.cancel);
  const [confirming, setConfirming] = useState(false);
  const Icon = DEPT_ICON[appointment.department];

  return (
    <article className="rounded-md border border-line bg-surface px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-semibold tracking-wide text-blue tabular-nums">{appointment.id}</p>
          <h3 className="mt-1 truncate text-base font-bold text-ink">{appointment.patient}</h3>
          <p className="text-sm text-muted">
            {appointment.age} yrs · {formatPhone(appointment.phone)}
          </p>
        </div>
        <p className="shrink-0 text-sm font-bold tabular-nums text-ink">{formatRupees(appointment.fee)}</p>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted">
        <span className="inline-flex items-center gap-1 rounded-md bg-sky px-2 py-1 font-semibold text-blue">
          <Icon className="size-3.5" aria-hidden="true" />
          {appointment.department}
        </span>
        <span>{appointment.doctor}</span>
        <span className="tabular-nums">{formatDisplayDate(appointment.date)}</span>
        {appointment.sample ? <span className="text-xs">Sample</span> : null}
      </div>
      <div className="mt-3">
        {confirming ? (
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => cancel(appointment.id)}
              className="min-h-11 rounded-md bg-navy px-3 text-sm font-semibold text-white"
            >
              Confirm cancel
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="min-h-11 rounded-md border border-line px-3 text-sm font-semibold text-ink"
            >
              Keep
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirming(true)}
            className="min-h-11 rounded-md px-1 text-sm font-semibold text-navy"
          >
            Cancel appointment
          </button>
        )}
      </div>
    </article>
  );
}

function BookPanel() {
  const book = useDesk((state) => state.book);
  const nextNumber = useDesk((state) => state.nextNumber);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [slip, setSlip] = useState<{ appointment: Appointment; base: number; discount: number } | null>(
    null,
  );

  const base = Number(form.baseFee);
  const discount = Number(form.discount);
  const feeReady =
    form.baseFee.trim() !== "" &&
    Number.isInteger(base) &&
    Number.isInteger(discount) &&
    base >= 0 &&
    discount >= 0 &&
    discount <= base;
  const preview = feeReady ? calculateFee(base, discount) : null;
  const doctors = form.department ? DOCTORS[form.department] : [];

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((current) => {
      const next = { ...current, [key]: value };
      if (key === "department" && current.department && current.department !== value) {
        const previousDoctors: readonly string[] = DOCTORS[current.department];
        if (previousDoctors.includes(current.doctor)) next.doctor = "";
      }
      return next;
    });
    setErrors((current) => {
      if (!current[key]) return current;
      const next = { ...current };
      delete next[key];
      return next;
    });
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    const nextErrors: Record<string, string> = {};
    const patient = form.patient.trim();
    const doctor = form.doctor.trim();
    const phone = form.phone.replace(/\s+/g, "");
    const age = Number(form.age);
    const fee = Number(form.baseFee);
    const off = Number(form.discount);

    if (!form.department) nextErrors.department = "Choose a department.";
    if (!patient) nextErrors.patient = "Patient name cannot be empty.";
    if (!Number.isInteger(age) || age < 1) nextErrors.age = "Enter a whole number of years, at least 1.";
    if (!/^\d{10}$/.test(phone)) nextErrors.phone = "Enter a valid 10-digit phone number.";
    if (!doctor) nextErrors.doctor = "Doctor and date cannot be empty.";
    if (!form.date) nextErrors.date = "Doctor and date cannot be empty.";
    if (form.baseFee.trim() === "" || !Number.isInteger(fee) || fee < 0) {
      nextErrors.baseFee = "Enter a valid fee.";
    }
    if (form.discount.trim() === "" || !Number.isInteger(off) || off < 0) {
      nextErrors.discount = "Enter a valid discount.";
    } else if (Number.isInteger(fee) && off > fee) {
      nextErrors.discount = "Discount cannot be more than the fee.";
    }

    if (Object.keys(nextErrors).length || !form.department) {
      setErrors(nextErrors);
      return;
    }

    const draft: BookingDraft = {
      patient,
      age,
      phone,
      department: form.department,
      doctor,
      date: form.date,
      baseFee: fee,
      discount: off,
    };
    const appointment = book(draft);
    setSlip({ appointment, base: fee, discount: off });
    setForm(EMPTY_FORM);
    setErrors({});
  }

  return (
    <div className="rise">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Book appointment</h1>
      <p className="mt-1 text-sm text-muted">
        Next slip <span className="font-semibold tabular-nums text-ink">{generateAppointmentId(nextNumber)}</span>
        . Standard consult is {formatRupees(500)} before any discount.
      </p>

      {slip ? (
        <div
          className="mt-5 rounded-md border border-leaf bg-leaf-soft px-4 py-4"
          role="status"
          aria-live="polite"
        >
          <p className="text-sm font-semibold text-leaf">Appointment booked successfully</p>
          <h2 className="mt-1 text-xl font-bold text-ink">{slip.appointment.patient}</h2>
          <dl className="mt-3 grid gap-2 text-sm sm:grid-cols-2">
            <SlipRow label="Appointment ID" value={slip.appointment.id} />
            <SlipRow label="Age" value={`${slip.appointment.age}`} />
            <SlipRow label="Phone" value={formatPhone(slip.appointment.phone)} />
            <SlipRow label="Department" value={slip.appointment.department} />
            <SlipRow label="Doctor" value={slip.appointment.doctor} />
            <SlipRow label="Date" value={formatDisplayDate(slip.appointment.date)} />
            <SlipRow
              label="Fee"
              value={
                slip.discount > 0
                  ? `${formatRupees(slip.base)} − ${formatRupees(slip.discount)} = ${formatRupees(slip.appointment.fee)}`
                  : formatRupees(slip.appointment.fee)
              }
            />
          </dl>
        </div>
      ) : null}

      <form onSubmit={submit} className="mt-5 grid gap-6 lg:grid-cols-[minmax(0,1fr)_16rem]" noValidate>
        <div className="space-y-5">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">Department</legend>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {DEPARTMENTS.map((department, index) => {
                const Icon = DEPT_ICON[department];
                const selected = form.department === department;
                return (
                  <button
                    key={department}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => update("department", department)}
                    className={
                      selected
                        ? "flex min-h-12 items-center gap-3 rounded-md border border-blue bg-sky px-3 text-left text-sm font-semibold text-navy"
                        : "flex min-h-12 items-center gap-3 rounded-md border border-line bg-surface px-3 text-left text-sm font-semibold text-ink"
                    }
                  >
                    <Icon className="size-4 shrink-0 text-blue" aria-hidden="true" />
                    <span>
                      <span className="mr-2 text-xs font-medium text-muted">{index + 1}</span>
                      {department}
                    </span>
                  </button>
                );
              })}
            </div>
            {errors.department ? <FieldError message={errors.department} /> : null}
          </fieldset>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block text-sm font-semibold text-ink" htmlFor="patient-name">
              Patient name
              <input
                id="patient-name"
                value={form.patient}
                onChange={(event) => update("patient", event.target.value)}
                autoComplete="name"
                className={fieldClass(Boolean(errors.patient))}
              />
              {errors.patient ? <FieldError message={errors.patient} /> : null}
            </label>
            <label className="block text-sm font-semibold text-ink" htmlFor="patient-age">
              Age
              <input
                id="patient-age"
                inputMode="numeric"
                value={form.age}
                onChange={(event) => update("age", event.target.value.replace(/[^\d]/g, ""))}
                className={fieldClass(Boolean(errors.age))}
              />
              {errors.age ? <FieldError message={errors.age} /> : null}
            </label>
            <label className="block text-sm font-semibold text-ink" htmlFor="patient-phone">
              Phone
              <input
                id="patient-phone"
                inputMode="numeric"
                autoComplete="tel"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value.replace(/[^\d]/g, "").slice(0, 10))}
                placeholder="10 digits"
                className={fieldClass(Boolean(errors.phone))}
              />
              {errors.phone ? <FieldError message={errors.phone} /> : null}
            </label>
            <label className="block text-sm font-semibold text-ink" htmlFor="doctor-name">
              Doctor
              <input
                id="doctor-name"
                list="doctor-suggestions"
                value={form.doctor}
                onChange={(event) => update("doctor", event.target.value)}
                placeholder={form.department ? "Pick a consultant or type a name" : "Choose a department first"}
                className={fieldClass(Boolean(errors.doctor))}
              />
              <datalist id="doctor-suggestions">
                {doctors.map((doctor) => (
                  <option key={doctor} value={doctor} />
                ))}
              </datalist>
              {errors.doctor ? <FieldError message={errors.doctor} /> : null}
            </label>
            <label className="block text-sm font-semibold text-ink" htmlFor="visit-date">
              Date
              <input
                id="visit-date"
                type="date"
                value={form.date}
                onChange={(event) => update("date", event.target.value)}
                className={fieldClass(Boolean(errors.date))}
              />
              {errors.date ? <FieldError message={errors.date} /> : null}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block text-sm font-semibold text-ink" htmlFor="base-fee">
                Fee
                <input
                  id="base-fee"
                  inputMode="numeric"
                  value={form.baseFee}
                  onChange={(event) => update("baseFee", event.target.value.replace(/[^\d]/g, ""))}
                  className={fieldClass(Boolean(errors.baseFee))}
                />
              </label>
              <label className="block text-sm font-semibold text-ink" htmlFor="discount">
                Discount
                <input
                  id="discount"
                  inputMode="numeric"
                  value={form.discount}
                  onChange={(event) => update("discount", event.target.value.replace(/[^\d]/g, ""))}
                  className={fieldClass(Boolean(errors.discount))}
                />
              </label>
            </div>
          </div>
          {errors.baseFee ? <FieldError message={errors.baseFee} /> : null}
          {errors.discount ? <FieldError message={errors.discount} /> : null}

          <button
            type="submit"
            className="min-h-12 w-full rounded-md bg-blue text-base font-semibold text-white hover:bg-blue-deep sm:w-auto sm:px-8"
          >
            Book appointment
          </button>
        </div>

        <aside className="h-fit rounded-md border border-line bg-surface p-4">
          <p className="text-xs font-semibold tracking-wide text-muted">Fee slip</p>
          <p className="mt-2 text-3xl font-bold tabular-nums text-ink">
            {preview === null ? "—" : formatRupees(preview)}
          </p>
          <p className="mt-2 text-sm text-muted">
            {preview === null
              ? "Fee minus discount. Discount cannot pass the consult fee."
              : discount > 0
                ? `${formatRupees(base)} consult, ${formatRupees(discount)} off.`
                : "No discount on this visit."}
          </p>
        </aside>
      </form>
    </div>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <p className="mt-2 text-sm font-medium text-navy" role="alert">
      {message}
    </p>
  );
}

function SlipRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="font-semibold text-ink">{value}</dd>
    </div>
  );
}

function Registry() {
  const appointments = useDesk((state) => state.appointments);
  const [query, setQuery] = useState("");
  const trimmed = query.trim();
  const exact = searchPatient(appointments, trimmed);
  const lowered = trimmed.toLowerCase();
  const partial = appointments.filter((appointment) => {
    return (
      appointment.patient.toLowerCase().includes(lowered) ||
      appointment.id.toLowerCase().includes(lowered) ||
      appointment.phone.includes(trimmed.replace(/\s+/g, "")) ||
      appointment.doctor.toLowerCase().includes(lowered) ||
      appointment.department.toLowerCase().includes(lowered)
    );
  });
  const usingExact = exact.length > 0;
  const results = !trimmed ? appointments : usingExact ? exact : partial;

  return (
    <div className="rise">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Registry</h1>
      <p className="mt-1 text-sm text-muted">
        {countAppointments(appointments)} appointment{appointments.length === 1 ? "" : "s"} on the books.
        An exact patient name uses the desk search. Anything else looks through the list.
      </p>
      <label className="mt-5 flex items-center gap-2 rounded-md border border-line bg-surface px-3" htmlFor="patient-search">
        <Search className="size-4 shrink-0 text-muted" aria-hidden="true" />
        <input
          id="patient-search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search patient, ID, phone, or doctor"
          className="min-h-12 w-full bg-transparent text-base text-ink placeholder:text-muted"
        />
      </label>
      {trimmed && usingExact ? (
        <p className="mt-3 text-sm font-medium text-leaf">Exact name match for “{trimmed}”.</p>
      ) : null}
      {trimmed && !usingExact && partial.length > 0 ? (
        <p className="mt-3 text-sm text-muted">No exact name match. Showing close results.</p>
      ) : null}

      {appointments.length === 0 ? (
        <p className="mt-5 rounded-md border border-dashed border-line bg-surface px-4 py-8 text-sm text-muted">
          No appointments found. Book the first visit from the Book tab.
        </p>
      ) : results.length === 0 ? (
        <p className="mt-5 rounded-md border border-dashed border-line bg-surface px-4 py-8 text-sm text-muted">
          Patient not found.
        </p>
      ) : (
        <ul className="mt-4 space-y-3">
          {results.map((appointment) => (
            <li key={appointment.id}>
              <AppointmentCard appointment={appointment} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

type TipProps = {
  active?: boolean;
  payload?: Array<{ value?: number }>;
  label?: string | number;
};

function ChartTip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  const value = payload[0]?.value ?? 0;
  return (
    <div className="rounded-md border border-line bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-semibold text-ink">{label}</p>
      <p className="tabular-nums text-muted">
        {value} appointment{value === 1 ? "" : "s"}
      </p>
    </div>
  );
}

function Insights() {
  const appointments = useDesk((state) => state.appointments);
  const total = countAppointments(appointments);
  const counts = DEPARTMENTS.map((department) => ({
    name: SHORT_DEPT[department],
    full: department,
    total: appointments.filter((appointment) => appointment.department === department).length,
  }));
  const peak = Math.max(...counts.map((row) => row.total));
  const leaders = counts.filter((row) => row.total > 0 && row.total === peak).length;
  const sorted = useMemo(
    () => [...appointments].sort((a, b) => a.patient.localeCompare(b.patient) || a.id.localeCompare(b.id)),
    [appointments],
  );

  return (
    <div className="rise">
      <h1 className="text-3xl font-bold tracking-tight text-ink">Insights</h1>
      <p className="mt-1 text-sm text-muted">
        Total appointments: <span className="font-semibold tabular-nums text-ink">{total}</span>
      </p>

      {total === 0 ? (
        <p className="mt-5 rounded-md border border-dashed border-line bg-surface px-4 py-8 text-sm text-muted">
          No appointments yet, so there is nothing to count.
        </p>
      ) : (
        <>
          <section className="mt-5 rounded-md border border-line bg-surface p-4">
            <h2 className="text-base font-bold text-ink">Appointments by department</h2>
            <div className="mt-3 h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={counts} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fill: "var(--color-muted)", fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip cursor={{ fill: "var(--color-sky)" }} content={<ChartTip />} />
                  <Bar dataKey="total" radius={[8, 8, 0, 0]}>
                    {counts.map((row) => (
                      <Cell
                        key={row.full}
                        fill={leaders === 1 && row.total === peak ? "var(--color-leaf)" : "var(--color-blue)"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <ul className="mt-2 space-y-1 text-sm text-muted">
              {counts.map((row) => (
                <li key={row.full} className="flex justify-between gap-3">
                  <span>{row.full}</span>
                  <span className="font-semibold tabular-nums text-ink">{row.total}</span>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-5">
            <h2 className="text-base font-bold text-ink">Sorted by patient name</h2>
            <ul className="mt-3 divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
              {sorted.map((appointment) => (
                <li key={appointment.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <span className="min-w-0 truncate font-medium text-ink">{appointment.patient}</span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-blue">{appointment.id}</span>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </div>
  );
}
