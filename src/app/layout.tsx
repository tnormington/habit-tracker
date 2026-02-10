import type { Metadata } from "next";
import "./globals.css";
import { AppLayout } from "@/components/layout";
import { ThemeProvider } from "@/components/theme";
import { NotificationProvider } from "@/components/notifications";

export const metadata: Metadata = {
  title: "Habit Tracker",
  description: "Track your daily habits and build better routines",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider>
          <NotificationProvider>
            <AppLayout>{children}</AppLayout>
          </NotificationProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
