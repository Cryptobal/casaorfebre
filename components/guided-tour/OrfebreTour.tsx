"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { orfebrePortalSteps } from "./tours/orfebre-portal-tour";
import { checkTourStatus, completeTour } from "@/app/actions/tour-actions";

const TOUR_ID = "orfebre-portal-v1";

export function OrfebreTour() {
  const [shouldAutoStart, setShouldAutoStart] = useState(false);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkTourStatus(TOUR_ID).then((completed) => {
      if (!completed) {
        setShouldAutoStart(true);
      }
      setIsReady(true);
    });
  }, []);

  const startTour = () => {
    const driverInstance = driver({
      showProgress: true,
      animate: true,
      overlayColor: "rgba(26, 26, 24, 0.85)",
      stagePadding: 8,
      stageRadius: 8,
      allowClose: true,
      popoverClass: "casa-orfebre-tour",
      progressText: "Paso {{current}} de {{total}}",
      nextBtnText: "Siguiente →",
      prevBtnText: "← Anterior",
      doneBtnText: "¡Listo, a crear!",
      steps: orfebrePortalSteps,
      onDestroyStarted: () => {
        if (driverInstance.hasNextStep()) {
          completeTour(TOUR_ID, true);
        } else {
          completeTour(TOUR_ID, false);
        }
        driverInstance.destroy();
      },
    });

    driverInstance.drive();
  };

  useEffect(() => {
    if (shouldAutoStart && isReady) {
      const timer = setTimeout(startTour, 1000);
      return () => clearTimeout(timer);
    }
  }, [shouldAutoStart, isReady]);

  if (!isReady) return null;

  return (
    <button
      onClick={startTour}
      className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm text-text-secondary transition-colors duration-200 hover:bg-accent/10 hover:text-accent"
      title="Ver tour guiado"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <span className="hidden sm:inline">Guía del Portal</span>
    </button>
  );
}
