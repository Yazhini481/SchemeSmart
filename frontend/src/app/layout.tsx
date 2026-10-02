import type { Metadata } from "next";
import "./globals.css";
import { AppProvider } from "@/context/AppContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingAssistant from "@/components/FloatingAssistant";

export const metadata: Metadata = {
  title: "SchemeSmart | AI-Powered Tamil Nadu Government Scheme Assistant",
  description:
    "Discover, verify eligibility, check document readiness, and compare Tamil Nadu government schemes with grounded AI assistance in English and Tamil.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full bg-slate-50 antialiased">
      <body className="min-h-full flex flex-col font-sans text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
        <AppProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <Footer />
          <FloatingAssistant />
        </AppProvider>
      </body>
    </html>
  );
}
