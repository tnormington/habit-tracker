"use client";

import { Leva } from "leva";
import { useLevaControls } from "@/lib/hooks";

/**
 * LevaProvider wraps the Leva GUI panel for development-time parameter tweaking.
 *
 * This component renders the Leva panel only in development mode.
 * It provides a GUI for tweaking parameters like colors, animations, and layout values.
 *
 * The panel is positioned in the top-right corner by default.
 *
 * This component also registers the global application controls via useLevaControls.
 * These controls are available for components to consume throughout the app.
 */
export function LevaProvider() {
  const isDev = process.env.NODE_ENV === "development";

  // Register global controls - this makes them appear in the Leva panel
  // Components can import useLevaControls to access these values
  useLevaControls();

  // Hide Leva panel in production
  if (!isDev) {
    return null;
  }

  return (
    <Leva
      collapsed={false}
      oneLineLabels={false}
      flat={false}
      theme={{
        sizes: {
          rootWidth: "280px",
          controlWidth: "160px",
        },
      }}
    />
  );
}
