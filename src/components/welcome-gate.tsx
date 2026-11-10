import { useState, type FormEvent } from "react";
import { HeartPulse, ShieldCheck, Users } from "lucide-react";
import { Wordmark } from "@/components/mark";
import { type StaffRole } from "@/lib/hospital";
import { useDesk } from "@/lib/desk-store";

const ROLES: StaffRole[] = ["Reception", "Consultant", "Admin"];

const PILLAR_ICONS = [HeartPulse, Users, ShieldCheck] as const;
const PILLAR_LABELS = ["Better Care", "A Healthier Tomorrow", "Trusted Always"] as const;

export function WelcomeGate() {
  const signIn = useDesk((state) => state.signIn);
  const [name, setName] = useState("");
  const [role, setRole] = useState<StaffRole>("Reception");
  const [error, setError] = useState("");

  function submit(event: FormEvent) {
    event.preventDefault();
    const trimmed = name.trim().replace(/\s+/g, " ");
    if (trimmed.length < 2) {
      setError("Enter the name on your staff badge.");
      return;
    }
    signIn({ name: trimmed, role });
  }

  return (
    <main className="relative min-h-dvh">
      <img
        src="/media/zoe-medicity-welcome.png"
        alt=""
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <div className="relative z-10 flex min-h-dvh items-end justify-center px-4 py-5 sm:items-center sm:justify-end sm:p-10 lg:p-16">
        <form
          onSubmit={submit}
          className="rise w-full max-w-md rounded-lg border border-white/50 bg-surface/95 p-5 shadow-2xl backdrop-blur-md sm:p-7"
        >
          <Wordmark />
          <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink">Welcome back</h1>
          <p className="mt-2 text-sm text-muted">
            Sign in to continue to Zoe Medicity Hospital Management System
          </p>
          <span className="mt-4 block h-1 w-14 rounded-full bg-blue" />

          <label className="mt-6 block text-sm font-semibold text-ink" htmlFor="staff-name">
            Staff name
            <input
              id="staff-name"
              name="staff-name"
              autoComplete="name"
              value={name}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError("");
              }}
              placeholder="e.g. Neha Kapoor"
              className="mt-2 w-full rounded-md border border-line bg-mist px-3 py-3 text-base font-medium text-ink outline-none placeholder:font-normal placeholder:text-muted focus:border-blue"
            />
          </label>
          {error ? (
            <p className="mt-2 text-sm font-medium text-navy" role="alert">
              {error}
            </p>
          ) : null}

          <fieldset className="mt-5">
            <legend className="text-sm font-semibold text-ink">Desk role</legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {ROLES.map((option) => {
                const selected = option === role;
                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    onClick={() => setRole(option)}
                    className={
                      selected
                        ? "min-h-11 rounded-md bg-blue px-2 text-sm font-semibold text-white"
                        : "min-h-11 rounded-md border border-line bg-surface px-2 text-sm font-semibold text-ink"
                    }
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <button
            type="submit"
            className="mt-6 min-h-12 w-full rounded-md bg-blue text-base font-semibold text-white hover:bg-blue-deep"
          >
            Sign in
          </button>
          <p className="mt-3 text-center text-xs text-muted">
            The appointment book stays on this device.
          </p>

          <ul className="mt-5 grid grid-cols-3 gap-2 border-t border-line pt-4">
            {PILLAR_LABELS.map((label, index) => {
              const Icon = PILLAR_ICONS[index];
              return (
                <li key={label} className="text-center">
                  <Icon className="mx-auto size-5 text-blue" aria-hidden="true" />
                  <span className="mt-1 block text-xs font-medium leading-tight text-muted">{label}</span>
                </li>
              );
            })}
          </ul>
        </form>
      </div>
    </main>
  );
}
