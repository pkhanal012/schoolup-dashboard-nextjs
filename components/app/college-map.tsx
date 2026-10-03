"use client";

import * as React from "react";
import type { Map as MapLibreMap, Marker } from "maplibre-gl";
import { Maximize2, Minimize2, Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { School } from "./data";

/* OpenFreeMap: no API key, commercial use allowed. "Liberty" is the closest
   free style to the Google-style basemap Airbnb uses. */
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/* The map is light in both themes, so its pins and controls use fixed light
   colours rather than theme tokens. `scale` (not transform) animates the active
   pin, because MapLibre owns the marker's transform for positioning. */
const PIN =
  "cursor-pointer rounded-full bg-white px-2.5 py-1 font-sans text-[13px] font-semibold leading-tight text-[#222] " +
  "shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.18)] transition-[background-color,color,scale] duration-150 " +
  "hover:scale-105 data-[active=true]:scale-110 data-[active=true]:bg-[#222] data-[active=true]:text-white";

const CONTROL = "grid place-items-center bg-white text-[#222] transition-colors hover:bg-[#f2f2f2]";

export function CollegeMap({
  schools,
  activeId,
  onHover,
  onOpen,
  expanded,
  onToggleExpand,
  className,
}: {
  schools: School[];
  activeId: string | null;
  onHover: (id: string | null) => void;
  onOpen: (school: School) => void;
  expanded: boolean;
  onToggleExpand: () => void;
  className?: string;
}) {
  const containerRef = React.useRef<HTMLDivElement>(null);
  const mapRef = React.useRef<MapLibreMap | null>(null);
  const libRef = React.useRef<typeof import("maplibre-gl") | null>(null);
  const markersRef = React.useRef(new Map<string, { marker: Marker; el: HTMLButtonElement }>());
  const fittedRef = React.useRef(false);
  const [ready, setReady] = React.useState(false);
  const [failed, setFailed] = React.useState(false);

  // Marker listeners are attached once, so they read the latest callbacks from here.
  const handlers = React.useRef({ onHover, onOpen });
  React.useEffect(() => {
    handlers.current = { onHover, onOpen };
  });

  // Create the map once. maplibre-gl touches `window` on import, so it loads here, in the browser.
  React.useEffect(() => {
    let cancelled = false;
    let map: MapLibreMap | null = null;
    const markers = markersRef.current;
    import("maplibre-gl").then((lib) => {
      if (cancelled || !containerRef.current) return;
      // Bundling breaks MapLibre's own worker URL; scripts/copy-maplibre-worker.mjs serves it from public/.
      lib.setWorkerUrl("/vendor/maplibre/maplibre-gl-worker.mjs");
      try {
        map = new lib.Map({
          container: containerRef.current,
          style: STYLE_URL,
          center: [-92, 41],
          zoom: 3,
          minZoom: 2,
          maxZoom: 16,
          dragRotate: false,
          pitchWithRotate: false,
          touchPitch: false,
          renderWorldCopies: false,
          attributionControl: { compact: true },
        });
      } catch {
        setFailed(true);
        return;
      }
      map.touchZoomRotate.disableRotation();
      map.keyboard.disableRotation();
      // Airbnb's look is flat: drop Liberty's shaded-relief backdrop, use Google-map water.
      map.once("load", () => {
        if (map?.getLayer("natural_earth")) map.setLayoutProperty("natural_earth", "visibility", "none");
        if (map?.getLayer("water")) map.setPaintProperty("water", "fill-color", "#aadaff");
      });
      libRef.current = lib;
      mapRef.current = map;
      setReady(true);
    });
    return () => {
      cancelled = true;
      markers.forEach(({ marker }) => marker.remove());
      markers.clear();
      map?.remove();
      mapRef.current = null;
    };
  }, []);

  // Keep the canvas matched to its box when the layout changes (expand, sidebar, window).
  React.useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => mapRef.current?.resize());
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Expanding changes the box in this same commit; resize now rather than wait on the observer.
  React.useEffect(() => {
    mapRef.current?.resize();
  }, [expanded]);

  // Sync pins with the visible schools, then frame them.
  React.useEffect(() => {
    const map = mapRef.current;
    const lib = libRef.current;
    if (!ready || !map || !lib) return;

    const markers = markersRef.current;
    const ids = new Set(schools.map((s) => s.id));
    markers.forEach(({ marker }, id) => {
      if (!ids.has(id)) {
        marker.remove();
        markers.delete(id);
      }
    });
    for (const s of schools) {
      if (markers.has(s.id)) continue;
      const el = document.createElement("button");
      el.type = "button";
      el.className = PIN;
      el.textContent = s.costAfterAid;
      el.setAttribute("aria-label", `${s.name}, ${s.costAfterAid} average cost after aid`);
      el.addEventListener("mouseenter", () => handlers.current.onHover(s.id));
      el.addEventListener("mouseleave", () => handlers.current.onHover(null));
      el.addEventListener("click", (e) => {
        e.stopPropagation();
        handlers.current.onOpen(s);
      });
      const marker = new lib.Marker({ element: el, anchor: "center" }).setLngLat([s.lon, s.lat]).addTo(map);
      markers.set(s.id, { marker, el });
    }

    if (schools.length === 0) return;
    const bounds = new lib.LngLatBounds();
    schools.forEach((s) => bounds.extend([s.lon, s.lat]));
    // First frame jumps; later ones (search, tab changes) glide.
    map.fitBounds(bounds, { padding: 72, maxZoom: 10, duration: fittedRef.current ? 700 : 0 });
    fittedRef.current = true;
  }, [ready, schools]);

  // The hovered card's pin turns dark and rises above its neighbours.
  React.useEffect(() => {
    markersRef.current.forEach(({ el }, id) => {
      const on = id === activeId;
      el.dataset.active = String(on);
      el.style.zIndex = on ? "2" : "";
    });
  }, [activeId, ready, schools]);

  return (
    <div className={cn("relative overflow-hidden rounded-card border bg-[#e8eef3]", className)}>
      {/* size-full, not absolute: MapLibre's unlayered CSS forces `position: relative` on this node. */}
      <div ref={containerRef} className="size-full dark:[&_canvas]:brightness-[0.85]" />

      {failed ? (
        <p className="absolute inset-0 grid place-items-center px-6 text-center text-[12.5px] text-[#555]">
          This browser can&rsquo;t draw the map. The list has everything the map shows.
        </p>
      ) : null}

      <div className="absolute right-3 top-3 flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={onToggleExpand}
          aria-label={expanded ? "Show the list" : "Expand map"}
          title={expanded ? "Show the list" : "Expand map"}
          className={cn(CONTROL, "size-9 rounded-full shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.16)]")}
        >
          {expanded ? <Minimize2 className="size-4" /> : <Maximize2 className="size-4" />}
        </button>
        <div className="flex flex-col overflow-hidden rounded-lg shadow-[0_1px_2px_rgba(0,0,0,0.08),0_2px_8px_rgba(0,0,0,0.16)]">
          <button type="button" onClick={() => mapRef.current?.zoomIn()} aria-label="Zoom in" className={cn(CONTROL, "size-9")}>
            <Plus className="size-4" />
          </button>
          <span className="h-px bg-[#e5e5e5]" aria-hidden />
          <button type="button" onClick={() => mapRef.current?.zoomOut()} aria-label="Zoom out" className={cn(CONTROL, "size-9")}>
            <Minus className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
