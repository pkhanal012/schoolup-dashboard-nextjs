"use client";

import { ArrowUpRight } from "lucide-react";
import { Panel, PanelHead, buttonStyles } from "@/components/ui/kit";


/**
 * OpenStreetMap's embed needs no API key. The bbox is a small window around the
 * campus point; `marker` drops the pin. Attribution below is required by ODbL.
 */
export function CampusMap({ name, place, lat, lon }: { name: string; place: string; lat: number; lon: number }) {
  const d = 0.012;
  const bbox = [lon - d, lat - d / 2, lon + d, lat + d / 2].join(",");
  const embed = `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&layer=mapnik&marker=${lat},${lon}`;
  const full = `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=15/${lat}/${lon}`;

  return (
    <Panel className="overflow-hidden">
      <PanelHead
        title="Where it is"
        hint={place}
        action={
          <a href={full} target="_blank" rel="noopener noreferrer" className={buttonStyles({ variant: "ghost", size: "sm" })}>
            Open map <ArrowUpRight />
          </a>
        }
      />
      <div className="p-4">
        <div className="overflow-hidden rounded-2xl border">
          <iframe
            title={`Map of ${name}`}
            src={embed}
            loading="lazy"
            // Mapnik tiles are light; take the glare off them in dark mode.
            className="block aspect-[16/10] w-full dark:brightness-[0.82] dark:contrast-[1.08]"
            style={{ border: 0 }}
          />
        </div>
        <p className="mt-2 text-right text-[11.5px] text-ink-3">
          ©{" "}
          <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer" className="hover:underline">
            OpenStreetMap
          </a>{" "}
          contributors
        </p>
      </div>
    </Panel>
  );
}
