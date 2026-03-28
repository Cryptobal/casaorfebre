"use client";

import { useEffect, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { buyerTourSteps } from "./tours/buyer-tour";
import { checkTourStatus, completeTour } from "@/app/actions/tour-actions";

const TOUR_ID = "buyer-first-visit-v1";

interface BuyerTourProps {
  isLoggedIn: boolean;
}

export function BuyerTour({ isLoggedIn }: BuyerTourProps) {
  const [shouldAutoStart, setShouldAutoStart] = useState(false);

  useEffect(() => {
    const check = async () => {
      if (isLoggedIn) {
        const completed = await checkTourStatus(TOUR_ID);
        setShouldAutoStart(!completed);
      } else {
        const completed = localStorage.getItem(`tour_${TOUR_ID}`);
        setShouldAutoStart(!completed);
      }
    };
    check();
  }, [isLoggedIn]);

  useEffect(() => {
    if (!shouldAutoStart) return;

    const timer = setTimeout(() => {
      const driverInstance = driver({
        showProgress: true,
        animate: true,
        overlayColor: "rgba(26, 26, 24, 0.85)",
        stagePadding: 8,
        stageRadius: 8,
        allowClose: true,
        popoverClass: "casa-orfebre-tour",
        progressText: "{{current}} de {{total}}",
        nextBtnText: "Siguiente →",
        prevBtnText: "← Anterior",
        doneBtnText: "¡A explorar!",
        steps: buyerTourSteps,
        onDestroyStarted: () => {
          if (isLoggedIn) {
            completeTour(TOUR_ID, driverInstance.hasNextStep());
          } else {
            localStorage.setItem(`tour_${TOUR_ID}`, "true");
          }
          driverInstance.destroy();
        },
      });

      driverInstance.drive();
    }, 1500);

    return () => clearTimeout(timer);
  }, [shouldAutoStart, isLoggedIn]);

  return null;
}
