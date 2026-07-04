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
    if (localStorage.getItem(TOUR_KEY)) return;
    // Secuenciar: no arrancar el tour hasta que el banner de cookies se haya
    // resuelto, para no apilar dos overlays en la primera visita.
    const cookiesResueltas = () => Boolean(localStorage.getItem("pp-cookie-consent"));
    if (cookiesResueltas()) { setActive(true); return; }
    const t = setInterval(() => {
      if (cookiesResueltas()) { clearInterval(t); setActive(true); }
    }, 800);
    // Tope de seguridad: arrancar igual tras 30s aunque no toque cookies
    const fallback = setTimeout(() => { clearInterval(t); setActive(true); }, 30_000);
    return () => { clearInterval(t); clearTimeout(fallback); };
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
