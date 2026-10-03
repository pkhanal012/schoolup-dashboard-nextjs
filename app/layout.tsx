import type { Metadata } from "next";
import { Inter, Geist_Mono, Source_Serif_4, Bricolage_Grotesque } from "next/font/google";
import "./globals.css";
import { ModeProvider } from "@/components/app/state";
import { ToastHost } from "@/components/ui/kit";

const sans = Inter({ subsets: ["latin"], variable: "--font-sans-face", display: "swap" });
const mono = Geist_Mono({ subsets: ["latin"], variable: "--font-mono-face", display: "swap" });
// The writing surface: a text face for long-form drafts.
const serif = Source_Serif_4({ subsets: ["latin"], variable: "--font-serif-face", display: "swap" });
// Headings and big figures: the landing page's display face, so the app and the site sound alike.
const display = Bricolage_Grotesque({ subsets: ["latin"], variable: "--font-display-face", display: "swap" });

export const metadata: Metadata = {
  title: "SchoolUp",
  description: "Study-abroad applications, documents and interview prep in one place.",
};

/* Applies the saved theme, sidebar width and plan-card dismissal before first paint so none of them flashes. */
// Themes: "default" (dark sidebar and top bar around a white sheet), "light" (warm dotted paper, after the landing page), "dark". New visitors get default.
const themeScript = `try{var s=localStorage.getItem("su-theme"),c=document.documentElement.classList;if(s==="dark")c.add("dark");else if(s!=="light")c.add("theme-default");if(localStorage.getItem("su-nav")==="rail")document.documentElement.classList.add("nav-rail");if(localStorage.getItem("su-plan-card")==="hidden")document.documentElement.classList.add("plan-card-hidden")}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable} ${serif.variable} ${display.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ModeProvider>
          <ToastHost>{children}</ToastHost>
        </ModeProvider>
      </body>
    </html>
  );
}
