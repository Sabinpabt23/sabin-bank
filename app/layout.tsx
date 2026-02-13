// app/layout.tsx
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sabin Bank",
  description: "Modern Banking Solutions",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}