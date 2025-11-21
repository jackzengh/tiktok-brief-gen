import type { Metadata } from "next";
import "./globals.css";
import SessionProvider from "@/components/SessionProvider";
import { StrictMode } from "react";

export const metadata: Metadata = {
  title: "Superpower Meta Copywriter",
  description:
    "Upload videos for AI transcription and scene analysis, or images for detailed description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StrictMode>
      <html lang="en">
        <body className="antialiased">
          <SessionProvider>{children}</SessionProvider>
        </body>
      </html>
    </StrictMode>
  );
}
