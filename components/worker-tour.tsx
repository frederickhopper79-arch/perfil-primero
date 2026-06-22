"use client";
import { useState, useEffect } from "react";
import { GuidedTour } from "@/components/ui/guided-tour";

const TOUR_KEY = "pp_worker_tour_done";

const STEPS = [
  { target: ".steps", title: "Pasos del proceso", content: "Sigue estos 6 pasos para completar tu perfil y hacerlo visible a empresas verificadas.", placement: "right" as const },
  { target: ".formSurface", title: "Completa tu perfil", content: "Ingresa tus datos profesionales. Cuanto más completo, más matches recibirás.", placement: "bottom" as const },
  { target: ".activationLeft", title: "Activa tu perfil", content: "Cuando estés listo, activa tu perfil por 30 días para aparecer en búsquedas de empresas.", placement: "left" as const },
];

export function WorkerTour() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) setActive(true);
  }, []);

  return (
    <GuidedTour
      steps={STEPS}
      active={active}
      onFinish={() => setActive(false)}
      storageKey={TOUR_KEY}
    />
  );
}
