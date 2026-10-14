import type { Metadata } from "next";
import "./globals.css";
import StoreProvider from "@/store/StoreProvider";
import { ToastProvider } from "@/context/ToastContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Pallet Dimension Calculator Pro | Manufacturing Crating & Wood Cut Lists",
  description:
    "Industrial Pallet Dimension Calculator for manufacturing shipping departments. Enter CAD product dimensions to instantly generate itemized wood cut lists, board foot estimates, tare weight, and forklift clearances.",
  keywords: [
    "pallet calculator",
    "cut list generator",
    "manufacturing shipping",
    "board feet calculator",
    "crating dimensions",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <ToastProvider>
            <div className="app-shell">
              <Navbar />
              <main className="main-content">{children}</main>
            </div>
          </ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
