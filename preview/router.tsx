"use client";
/* Minimal stand-ins for next/link and next/navigation so the whole app can be
   bundled into one static HTML file for preview. */
import * as React from "react";

const Ctx = React.createContext<{ path: string; push: (p: string) => void }>({ path: "/", push: () => {} });

export function PreviewRouter({ children }: { children: React.ReactNode }) {
  const [path, setPath] = React.useState("/");
  const push = React.useCallback((p: string) => {
    setPath(p);
    window.scrollTo({ top: 0 });
  }, []);
  return <Ctx.Provider value={{ path, push }}>{children}</Ctx.Provider>;
}

export function usePathname() {
  return React.useContext(Ctx).path;
}

export function useRouter() {
  const { push } = React.useContext(Ctx);
  return { push, replace: push, back: () => {}, forward: () => {}, refresh: () => {}, prefetch: () => {} };
}

type LinkProps = React.ComponentProps<"a"> & { href: string };

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(function Link({ href, onClick, ...rest }, ref) {
  const { push } = React.useContext(Ctx);
  return (
    <a
      ref={ref}
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(e);
        push(href);
      }}
      {...rest}
    />
  );
});

export default Link;
