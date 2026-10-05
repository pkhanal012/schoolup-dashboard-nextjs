import type { Metadata } from "next";
import { Bricolage_Grotesque } from "next/font/google";
import { LandingTwo } from "@/components/landing2/landing-two";
import "@/components/landing2/landing2.css";
import "@/components/landing2/heroes/heroes.css";

// Display face: a grotesque with some bounce in it — friendly, still sharp at 120px.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-l2-display", display: "swap" });

export const metadata: Metadata = {
  title: "SchoolUp — Study abroad, minus the panic",
  description:
    "Schools, scholarships, essays, interviews and every deadline — finally in one friendly place. Free to start, no card needed.",
};

export default function Page() {
  return (
    <div className={display.variable}>
      <LandingTwo />
    </div>
  );
}
