import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Desk } from "@/components/desk";
import { WelcomeGate } from "@/components/welcome-gate";
import { useDesk } from "@/lib/desk-store";

export const Route = createFileRoute("/")({ component: Home });

function useDeskHydrated() {
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const persistApi = useDesk.persist;
    if (persistApi.hasHydrated()) {
      setHydrated(true);
      return;
    }
    return persistApi.onFinishHydration(() => setHydrated(true));
  }, []);

  return hydrated;
}

function Home() {
  const hydrated = useDeskHydrated();
  const session = useDesk((state) => state.session);

  if (!hydrated) return <WelcomeGate />;
  if (!session) return <WelcomeGate />;
  return <Desk />;
}
