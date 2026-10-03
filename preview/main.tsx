import * as React from "react";
import { createRoot } from "react-dom/client";
import { PreviewRouter, usePathname } from "./router";
import { ModeProvider } from "@/components/app/state";
import { ToastHost } from "@/components/ui/kit";
import Today from "@/app/page";
import Colleges from "@/app/colleges/page";
import Scholarships from "@/app/scholarships/page";
import Applications from "@/app/applications/page";
import Documents from "@/app/documents/page";
import Prep from "@/app/prep/page";
import Calendar from "@/app/calendar/page";
import Settings from "@/app/settings/page";
import "./preview.css";

const ROUTES: Record<string, React.ComponentType> = {
  "/": Today,
  "/colleges": Colleges,
  "/scholarships": Scholarships,
  "/applications": Applications,
  "/documents": Documents,
  "/prep": Prep,
  "/calendar": Calendar,
  "/settings": Settings,
};

function Screen() {
  const path = usePathname();
  const Page = ROUTES[path] ?? Today;
  return <Page />;
}

createRoot(document.getElementById("root")!).render(
  <PreviewRouter>
    <ModeProvider>
      <ToastHost>
        <Screen />
      </ToastHost>
    </ModeProvider>
  </PreviewRouter>,
);
