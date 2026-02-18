"use client";

import { Leva } from "leva";
import { useLevaControls } from "@/lib/hooks";

const isDev = process.env.NODE_ENV === "development";

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
  // Register global controls - this makes them appear in the Leva panel
  // Components can import useLevaControls to access these values
  useLevaControls();

  // Use Leva's built-in hidden prop to hide in production
  // This ensures no UI is rendered while keeping the store functional
  return (
    <Leva
      hidden={!isDev}
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
