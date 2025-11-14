import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Video & Image AI Analysis",
  description:
    "Upload videos for AI transcription and scene analysis, or images for detailed description",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
