"use client";

import * as React from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  Bell,
  ChevronDown,
  BookOpen,
  CalendarDays,
  FileText,
  FolderClosed,
  GraduationCap,
  HandCoins,
  LayoutGrid,
  LogOut,
  Menu,
  MessagesSquare,
  Mic,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button, Dropdown, DropdownItem, DropdownSeparator, Meter, Segmented, StickerArt, useToast } from "@/components/ui/kit";
import { student, type Notice } from "./data";
import { markAllRead, markRead, useNotices } from "./notifications";
import { useMode, type Mode } from "./state";
import { THEMES, setTheme, useTheme } from "./theme";

/* `tone` is the item's sticker colour: the dot behind its icon when it is the
   current page, and the tile beside the page title in the top bar. */
type Item = { href: string; label: string; icon: React.ElementType; tone: string };

const GROUPS: { label?: string; items: Item[] }[] = [
  {
    items: [
      { href: "/home", label: "Home", icon: LayoutGrid, tone: "bg-sky" },
      { href: "/files", label: "My files", icon: FolderClosed, tone: "bg-sun" },
      { href: "/community", label: "Community", icon: MessagesSquare, tone: "bg-pink" },
    ],
  },
  {
    label: "Discover",
    items: [
      { href: "/colleges", label: "Colleges", icon: GraduationCap, tone: "bg-mint" },
      { href: "/scholarships", label: "Scholarships", icon: HandCoins, tone: "bg-sun" },
    ],
  },
  {
    label: "Apply",
    items: [
      { href: "/applications", label: "Applications", icon: BookOpen, tone: "bg-lilac" },
    ],
  },
  {
    label: "Prepare",
    items: [
      { href: "/documents", label: "Writing coach", icon: FileText, tone: "bg-coral" },
      { href: "/prep", label: "Interview prep", icon: Mic, tone: "bg-sky" },
      { href: "/calendar", label: "Calendar", icon: CalendarDays, tone: "bg-mint" },
    ],
  },
];

/* The heading's icon is the one the page wears in the sidebar, so the two
   always agree. Settings has no nav item of its own, hence the extra entry.
   Home is the exception: it keeps the greeting's emoji. */
const HEADING_ICONS: Item[] = [...GROUPS.flatMap((g) => g.items).filter((i) => i.href !== "/home"), { href: "/settings", label: "Settings", icon: Settings, tone: "bg-lilac" }];

/** Default · Light · Dark. Rendered in menus only, so it reads the live theme. */
function ThemeSwitch({ className }: { className?: string }) {
  const theme = useTheme();
  return <Segmented label="Theme" stretch options={THEMES} value={theme} onChange={setTheme} className={className} />;
}

function setPlanCardHidden(hidden: boolean) {
  document.documentElement.classList.toggle("plan-card-hidden", hidden);
  try {
    if (hidden) localStorage.setItem("su-plan-card", "hidden");
    else localStorage.removeItem("su-plan-card");
  } catch {}
}

/**
 * Desktop: minimises the sidebar to an icon rail (⌘/Ctrl+B too). The state is a
 * class on <html>, written before first paint like the theme, so every page's
 * Shell agrees on it without a flash. Below lg the same action opens the drawer.
 */
function useSidebarToggle(openDrawer: () => void) {
  const toggle = React.useCallback(() => {
    if (!matchMedia("(min-width: 64rem)").matches) return openDrawer();
    const next = !document.documentElement.classList.contains("nav-rail");
    document.documentElement.classList.toggle("nav-rail", next);
    try {
      localStorage.setItem("su-nav", next ? "rail" : "full");
    } catch {}
  }, [openDrawer]);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && !e.altKey && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggle();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggle]);

  return toggle;
}

const MODES: { value: Mode; label: string }[] = [
  { value: "new", label: "First run" },
  { value: "loading", label: "Loading" },
  { value: "active", label: "In progress" },
];

function ModeSwitch({ className }: { className?: string }) {
  const { mode, setMode } = useMode();
  return <Segmented label="Demo state" stretch options={MODES} value={mode} onChange={setMode} className={className} />;
}

/* The account, now in the top bar: the avatar alone, with everything that used
   to sit beside it — name, theme, demo state, settings — inside the menu. */
function AccountMenu({ pathname, onNavigate, onSignOut }: { pathname: string; onNavigate: () => void; onSignOut: () => void }) {
  return (
    <Dropdown
      side="bottom"
      align="end"
      width={264}
      label="Account"
      triggerClassName="rounded-full"
      trigger={
        <span className="flex items-center gap-0.5 rounded-full pr-0.5 transition-opacity hover:opacity-90">
          <span
            className={cn(
              "grid size-8 shrink-0 place-items-center overflow-hidden rounded-full bg-sun text-[11.5px] font-semibold text-[#17161c] ring-2 ring-surface",
              pathname === "/settings" && "ring-2 ring-inset ring-[var(--primary-ink)]/40",
            )}
          >
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="size-full object-cover" />
            ) : (
              student.initials
            )}
          </span>
          <ChevronDown className="size-3.5 shrink-0 text-ink-3" />
        </span>
      }
    >
      {/* Stops propagation so switching state keeps the menu open. */}
      <div className="px-2.5 py-2" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2.5">
          <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-full bg-sun text-[12px] font-semibold text-[#17161c]">
            {student.avatar ? (
              <img src={student.avatar} alt={student.name} className="size-full object-cover" />
            ) : (
              student.initials
            )}
          </span>
          <div className="min-w-0 flex-1">
            <p className="su-display truncate text-[15px]">{student.name}</p>
            <p className="truncate text-[12px] text-ink-3">{student.email}</p>
          </div>
        </div>
        <p className="mt-3 text-[11.5px] text-ink-3">Theme</p>
        <ThemeSwitch className="mt-1.5 w-full" />
        <p className="mt-3 text-[11.5px] text-ink-3">Demo state</p>
        <ModeSwitch className="mt-1.5 w-full" />
      </div>
      <DropdownSeparator />
      <Link
        href="/settings"
        role="menuitem"
        onClick={onNavigate}
        className="flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] text-ink-2 transition-colors hover:bg-hover hover:text-ink [&_svg]:size-[15px] [&_svg]:shrink-0"
      >
        <Settings className="text-ink-3" /> Profile &amp; settings
      </Link>
      <DropdownSeparator />
      <DropdownItem danger onClick={onSignOut}>
        <LogOut /> Sign out
      </DropdownItem>
    </Dropdown>
  );
}

/* Notifications open as a panel beside the sidebar rather than a page of their
   own: a student checking "anything new?" shouldn't lose the screen they're on.
   The panel groups by day, files into tabs, and reveals the older entries in
   place. In the rail the trigger keeps only the bell and its dot. */
const GROUPS_ORDER = ["Today", "This week", "Earlier"] as const;

const NO_NOTICES: Notice[] = [];

function NotificationsMenu({ onNavigate, compact }: { onNavigate: () => void; compact?: boolean }) {
  const { mode } = useMode();
  const seeded = useNotices();
  // First run: the account is new, so nothing has happened on it yet.
  const items = mode === "new" ? NO_NOTICES : seeded;
  const [open, setOpen] = React.useState(false);
  const unread = items.filter((n) => n.unread).length;
  const ref = React.useRef<HTMLDivElement>(null);
  const panelRef = React.useRef<HTMLDivElement>(null);

  // Same dismissal contract as the kit's menus: a click outside or Escape.
  React.useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const target = e.target as Node;
      if (ref.current?.contains(target) || panelRef.current?.contains(target)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-label={unread ? `Notifications, ${unread} unread` : "Notifications"}
        title="Notifications"
        className={cn(
          "group relative flex items-center gap-2 rounded-full text-[14px] text-ink transition-colors duration-150",
          compact ? "size-9 justify-center" : "h-9 w-full px-3",
          open ? "bg-active" : "hover:bg-hover",
        )}
      >
        <span className="relative shrink-0">
          <Bell className={cn("size-4", open ? "text-ink" : "text-ink-2 group-hover:text-ink")} strokeWidth={1.75} />
          {unread ? <span className="absolute -right-0.5 -top-0.5 size-2 rounded-full bg-coral ring-2 ring-ground" /> : null}
        </span>
        {compact ? null : (
          <>
            <span className="flex-1 truncate text-left">Notifications</span>
            {unread ? (
              <span className="shrink-0 rounded-full bg-primary-soft px-1.5 font-mono text-[11px] leading-[17px] text-accent">{unread}</span>
            ) : null}
          </>
        )}
      </button>

      {/* Portalled to the body so the panel is drawn on the app's light surface
          rather than inheriting the sidebar's dark chrome tokens. */}
      {open
        ? createPortal(
            <NotificationsPanel panelRef={panelRef} items={items} unread={unread} onClose={() => setOpen(false)} onNavigate={onNavigate} />,
            document.body,
          )
        : null}
    </div>
  );
}

/* One list, grouped by when it happened. No tabs, no icon tiles and no paging:
   there is never enough here to need filing, and a student opening this wants
   to read three lines and get back to what they were doing. */
function NotificationsPanel({
  panelRef,
  items,
  unread,
  onClose,
  onNavigate,
}: {
  panelRef: React.RefObject<HTMLDivElement | null>;
  items: Notice[];
  unread: number;
  onClose: () => void;
  onNavigate: () => void;
}) {
  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      /* Hangs from the bell that opened it, in the top-right corner, down the
         right edge of the sheet. */
      className="su-pop fixed inset-3 z-50 flex flex-col overflow-hidden rounded-card border bg-surface text-ink shadow-e4 lg:bottom-3 lg:left-auto lg:right-3 lg:top-14 lg:w-[400px]"
    >
      <div className="flex items-center gap-3 border-b p-5">
        <p className="su-display flex-1 text-[19px]">Notifications</p>
        {unread ? (
          <button onClick={markAllRead} className="text-[13px] font-medium text-accent transition-colors hover:underline">
            Mark all read
          </button>
        ) : items.length ? (
          <p className="text-[13px] text-ink-3">All caught up</p>
        ) : null}
        <button
          onClick={onClose}
          aria-label="Close notifications"
          className="-mr-1.5 grid size-8 shrink-0 place-items-center rounded-full text-ink-3 transition-colors hover:bg-hover hover:text-ink"
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {items.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center p-5 text-center">
            <StickerArt src="/images/stickers/notification.webp" className="size-40" />
            <p className="su-display mt-2 text-[19px]">Nothing here yet</p>
            <p className="mt-1.5 max-w-[34ch] text-[13px] leading-relaxed text-ink-2">
              Save a school or start a draft, and updates about deadlines, references and coach reviews land here.
            </p>
          </div>
        ) : (
          GROUPS_ORDER.map((group) => {
            const rows = items.filter((n) => n.group === group);
            if (!rows.length) return null;
            return (
              <section key={group}>
                <p className="px-5 pb-1.5 pt-5 text-[12.5px] font-medium text-ink-3">{group}</p>
                {rows.map((n) => (
                  <NoticeRow key={n.id} notice={n} onNavigate={onNavigate} />
                ))}
              </section>
            );
          })
        )}
      </div>
    </div>
  );
}

function NoticeRow({ notice, onNavigate }: { notice: Notice; onNavigate: () => void }) {
  return (
    <button
      onClick={() => {
        markRead(notice.id);
        onNavigate();
      }}
      className="flex w-full items-start gap-3 border-b border-line-soft p-5 text-left transition-colors last:border-b-0 hover:bg-hover"
    >
      {/* The one mark on the row: unread or not. */}
      <span
        aria-hidden
        className={cn("mt-[6px] size-2.5 shrink-0 rounded-full", notice.unread ? "bg-coral" : "bg-transparent")}
      />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline gap-3">
          <span className={cn("min-w-0 flex-1 text-[13.5px] leading-snug", notice.unread ? "font-medium text-ink" : "text-ink")}>
            {notice.title}
          </span>
          <span className="shrink-0 text-[12px] text-ink-3">{notice.ago}</span>
        </span>
        <span className="mt-1 block text-[13px] leading-snug text-ink-2">{notice.detail}</span>
      </span>
    </button>
  );
}

function NavLink({ item, active, onNavigate }: { item: Item; active: boolean; onNavigate: () => void }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      title={item.label}
      className={cn(
        // A pill, like the landing page's nav links. The current page is a white
        // pill lifted off the paper, its icon sitting on a dot of its colour.
        "group relative flex h-9 items-center gap-2.5 rounded-full pl-1.5 pr-3 text-[14px] text-ink transition-[background-color,box-shadow] duration-200 rail:size-10 rail:justify-center rail:self-center rail:p-0",
        // In the Default theme the dark sidebar's current page is a white pill, as bright as the sheet beside it.
        active
          ? "bg-active font-medium shadow-e2 ring-1 ring-[var(--line)] mode-default:bg-white mode-default:text-[#17161c] mode-default:ring-transparent"
          : "hover:bg-hover",
      )}
    >
      <span
        aria-hidden
        className={cn(
          "grid size-6.5 shrink-0 place-items-center rounded-full transition-[background-color,color,transform] duration-300 ease-[var(--ease-spring)]",
          active ? cn(item.tone, "text-[#17161c]") : "text-ink-2 group-hover:-rotate-6 group-hover:scale-110 group-hover:text-ink",
        )}
      >
        <Icon className="size-[15px]" strokeWidth={active ? 2.1 : 1.75} />
      </span>
      <span className="truncate rail:sr-only">{item.label}</span>
    </Link>
  );
}

export function Shell({
  title,
  back,
  icon,
  emoji,
  bare,
  crumb,
  crumbHref,
  description,
  actions,
  children,
}: {
  title: React.ReactNode;
  /** The list this page sits inside, linked above the title. */
  back?: { href: string; label: string };
  /** Overrides the nav icon — a school's brand mark, say. */
  icon?: React.ReactNode;
  emoji?: string;
  /** The page brings its own chrome (e.g. the editor): no heading block, no width cap. */
  bare?: boolean;
  crumb?: string;
  crumbHref?: string;
  description?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [navOpen, setNavOpen] = React.useState(false);
  const toast = useToast();
  const closeNav = React.useCallback(() => setNavOpen(false), []);
  const openNav = React.useCallback(() => setNavOpen(true), []);
  const toggleSidebar = useSidebarToggle(openNav);
  const panelRef = React.useRef<HTMLDivElement>(null);
  const headingItem = HEADING_ICONS.find((i) => pathname === i.href || pathname.startsWith(`${i.href}/`));

  const resolvedCrumbHref = crumbHref ?? back?.href ?? (crumb === "Colleges" ? "/colleges" : crumb === "Writing coach" ? "/documents" : crumb === "Account" ? "/settings" : undefined);

  // The bar names the section ("Home"), not the page's own headline (a greeting).
  const label = GROUPS.flatMap((g) => g.items).find((i) => i.href === pathname)?.label ?? (typeof title === "string" ? title : null);

  return (
    <div className="su-paper min-h-dvh bg-ground">
      {/* ------------------------------------------------------------ Sidebar
          Sits straight on the ground — no border of its own. The edge you see
          is the main panel's. */}
      {/* data-chrome: the region the Default theme draws dark (see globals.css). */}
      <aside
        data-chrome
        className={cn(
          "su-paper fixed inset-y-0 left-0 z-40 flex w-[228px] flex-col bg-ground text-ink transition-[translate,width] duration-200 ease-out lg:translate-x-0 rail:w-[64px]",
          "max-lg:border-r max-lg:shadow-e4",
          navOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-12 shrink-0 items-center gap-1 pl-5 pr-3 rail:justify-center rail:gap-1.5 rail:px-0">
          {/* Both marks render; CSS picks one, so the logo never flashes on load.
              The rail has no room for a wordmark, and a cropped one reads as a
              stray letter — so it steps aside and leaves the toggle. */}
          <span className="flex overflow-hidden rail:hidden">
            <img src="/images/logos/logo_black.svg" alt="SchoolUp" className="h-[19px] w-auto max-w-none dark:hidden" />
            <img src="/images/logos/logo_white.svg" alt="" aria-hidden className="hidden h-[19px] w-auto max-w-none dark:block" />
          </span>
          <button
            onClick={toggleSidebar}
            aria-label="Collapse sidebar"
            title="Collapse sidebar (⌘B)"
            className="ml-auto hidden size-8 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-hover hover:text-ink lg:grid rail:ml-0"
          >
            <PanelLeftClose className="size-4 rail:hidden" strokeWidth={1.75} />
            <PanelLeftOpen className="hidden size-4 rail:block" strokeWidth={1.75} />
          </button>
          <button
            onClick={closeNav}
            className="ml-auto grid size-8 place-items-center rounded-full text-ink-2 transition-colors hover:bg-hover hover:text-ink lg:hidden"
            aria-label="Close menu"
          >
            <X className="size-4" />
          </button>
        </div>

        <nav className="mt-3 flex flex-1 flex-col gap-5 overflow-y-auto px-3 pb-4 no-scrollbar rail:gap-3 rail:px-3" aria-label="Main">
          {GROUPS.map((group, i) => (
            <div key={i} className="flex flex-col gap-1">
              {/* Hidden on the rail, where there is no room for a word above icons. */}
              {group.label ? <p className="px-3 pb-1 text-[12px] font-medium text-ink-3 rail:hidden">{group.label}</p> : null}
              {group.items.map((item) => (
                <NavLink key={item.href} item={item} active={pathname === item.href || pathname.startsWith(`${item.href}/`)} onNavigate={closeNav} />
              ))}
            </div>
          ))}
        </nav>

        {/* Dismissal is a class on <html> set before first paint, so the card never flashes back.
            A sun-yellow card on the landing page's dot grid, with a sticker peeking in. */}
        <div className="su-pat-dots relative mx-3 mb-3 overflow-hidden rounded-[20px] bg-sun-soft p-3.5 text-ink [--pc:rgba(255,196,0,0.3)] dark:[--pc:rgba(255,210,63,0.1)] rail:hidden in-[.plan-card-hidden]:hidden">
          <div className="flex items-center gap-2">
            <p className="su-display flex-1 text-[15px]">Mock interviews</p>
            <p className="font-mono text-[11.5px] tabular-nums text-ink-2">2/3</p>
            <button
              onClick={() => {
                setPlanCardHidden(true);
                toast({ message: "Hidden. Upgrade any time from Profile & settings.", action: { label: "Undo", onClick: () => setPlanCardHidden(false) } });
              }}
              aria-label="Dismiss"
              title="Dismiss"
              className="-mr-1 grid size-6 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-black/5 hover:text-ink dark:hover:bg-white/10"
            >
              <X className="size-3.5" />
            </button>
          </div>
          <Meter className="mt-2.5 bg-white/70 dark:bg-white/10" value={(2 / 3) * 100} tone="accent" />
          <p className="mt-2 max-w-[17ch] text-[12px] leading-relaxed text-ink-2">Resets Monday. Unlimited on Plus.</p>
          <Button size="sm" variant="ink" className="mt-3">
            Upgrade
          </Button>
          {/* eslint-disable-next-line @next/next/no-img-element -- a fixed local sticker, not content */}
          <img
            src="/images/stickers/interview.webp"
            alt=""
            aria-hidden
            className="pointer-events-none absolute -bottom-3 -right-3 w-[84px] rotate-6 drop-shadow-[0_8px_10px_rgba(23,22,28,0.18)]"
          />
        </div>

      </aside>

      {navOpen ? <div className="fixed inset-0 z-30 bg-black/30 backdrop-blur-[2px] lg:hidden" onClick={closeNav} /> : null}

      {/* ------------------------------------------------------- Main panel
          Desktop: one white sheet inset 8px from the viewport, scrolling on its
          own so its rounded frame never moves. Mobile: full bleed. */}
      <div className="flex min-h-dvh flex-col transition-[padding] duration-200 ease-out lg:h-dvh lg:min-h-0 lg:pb-2 lg:pl-[228px] lg:pr-2 rail:pl-[64px]">
        {/* On the ground rather than in the sheet: where you are on the left,
            who you are and what is new on the right. */}
        <div data-chrome className="flex h-12 shrink-0 items-center gap-2.5 px-4 text-ink sm:px-5 lg:px-0">
          <button
            onClick={openNav}
            className="-ml-1.5 grid size-8 shrink-0 place-items-center rounded-full text-ink-2 transition-colors hover:bg-hover hover:text-ink lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="size-4" />
          </button>
          {icon ? (
            <span aria-hidden className="shrink-0">
              {icon}
            </span>
          ) : headingItem ? (
            /* The page's sticker dot, the same one its nav item wears. */
            <span aria-hidden className={cn("grid size-7 shrink-0 place-items-center rounded-full text-[#17161c]", headingItem.tone)}>
              <headingItem.icon className="size-[15px]" strokeWidth={2} />
            </span>
          ) : emoji ? (
            <span aria-hidden className="shrink-0 text-[18px] leading-none">{emoji}</span>
          ) : null}
          {/* The page's standfirst survives as the tooltip rather than a line
              of copy the bar has no room for. */}
          <p className="su-display min-w-0 truncate text-[17px]" title={typeof description === "string" ? description : undefined}>
            {crumb ? (
              <span className="font-sans text-[14px] font-normal tracking-normal text-ink-3">
                {resolvedCrumbHref ? (
                  <Link href={resolvedCrumbHref} className="transition-colors hover:text-ink hover:underline">
                    {crumb}
                  </Link>
                ) : (
                  crumb
                )}{" "}
                /{" "}
              </span>
            ) : null}
            {label}
          </p>

          <div className="ml-auto flex shrink-0 items-center gap-1.5">
            {actions ? (
              <>
                <div className="flex items-center gap-2">{actions}</div>
                <span aria-hidden className="mx-1.5 h-5 w-px bg-[var(--line)]" />
              </>
            ) : null}
            <NotificationsMenu onNavigate={closeNav} compact />
            <AccountMenu pathname={pathname} onNavigate={closeNav} onSignOut={() => toast({ message: "Signed out" })} />
          </div>
        </div>

        <div
          ref={panelRef}
          className="thin-scrollbar flex min-h-0 flex-1 flex-col bg-surface lg:overflow-y-auto lg:rounded-[28px] lg:border lg:shadow-e2"
        >
          {/* The bar overhead names the page and holds its actions, so the sheet
              opens straight onto the work with no heading band above it. */}
          {bare ? (
            <main className="flex min-h-0 flex-1 flex-col">{children}</main>
          ) : (
          /* No min-h-0 here: in the sheet's scrolling column it would let main
             shrink to the viewport, and its bottom padding would then sit
             mid-page while the content ran on to the sheet's edge. */
          <main className="mx-auto flex w-full max-w-[1160px] flex-1 flex-col px-4 pb-12 pt-6 sm:px-7 has-[[data-empty]]:pb-6">
            {back ? (
              <Link
                href={back.href}
                className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full text-[12.5px] text-ink-3 transition-colors hover:text-ink"
              >
                <ArrowLeft className="size-3.5" /> {back.label}
              </Link>
            ) : null}
            {children}
          </main>
          )}
        </div>
      </div>
    </div>
  );
}
