import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  Aperture,
  AudioLines,
  Bell,
  ChevronDown,
  CircleHelp,
  Clapperboard,
  Command,
  Disc3,
  LayoutDashboard,
  LogOut,
  Menu,
  RadioTower,
  Settings2,
  Video,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

const navigation = [
  { label: "Overview", to: "/dashboard", icon: LayoutDashboard },
  { label: "Productions", to: "/sessions", icon: Clapperboard },
  { label: "Camera inputs", to: "/cameras", icon: Video },
  { label: "Production studio", to: "/studio", icon: Aperture },
  { label: "Livestreams", to: "/livestream", icon: RadioTower },
  { label: "Recordings", to: "/recordings", icon: Disc3 },
] as const;

export function WorkspaceShell({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [profileName, setProfileName] = useState("");
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (active) setEmail(data.user?.email ?? "");
    });
    void supabase
      .from("profiles")
      .select("display_name")
      .maybeSingle()
      .then(({ data }) => {
        if (active) setProfileName(data?.display_name ?? "");
      });
    return () => {
      active = false;
    };
  }, [location.pathname]);

  async function signOut() {
    await supabase.auth.signOut();
    await navigate({ to: "/auth", replace: true });
  }

  const currentName = profileName || email.split("@")[0] || "Creator";
  const sidebar = (
    <>
      <div className="flex h-[76px] items-center gap-3 border-b border-border px-5">
        <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Command className="size-5" />
        </div>
        <div>
          <p className="font-display text-sm font-semibold tracking-wide">NXpay</p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.12em] text-muted-foreground">Production suite</p>
        </div>
        <button type="button" className="ml-auto grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-accent lg:hidden" onClick={() => setMobileOpen(false)} aria-label="Close menu">
          <X className="size-4" />
        </button>
      </div>
      <nav className="space-y-1 px-3 py-5" aria-label="Main navigation">
        <p className="px-3 pb-2 text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">Workspace</p>
        {navigation.map(({ label, to, icon: Icon }) => {
          const active = location.pathname === to || (to === "/studio" && location.pathname.startsWith("/sessions/"));
          return (
            <Link
              key={to}
              to={to}
              onClick={() => setMobileOpen(false)}
              className={`flex h-10 items-center gap-3 rounded-md px-3 text-[13px] transition-colors ${active ? "bg-accent text-foreground" : "text-muted-foreground hover:bg-accent/70 hover:text-foreground"}`}
            >
              <Icon className={`size-4 ${active ? "text-primary" : ""}`} />
              <span>{label}</span>
              {label === "Livestreams" && <span className="ml-auto rounded-sm border border-border px-1.5 py-0.5 text-[9px] uppercase tracking-wide text-muted-foreground">Soon</span>}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto border-t border-border p-3">
        <div className="mb-3 flex items-center gap-3 rounded-md p-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground">{currentName.slice(0, 1).toUpperCase()}</div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium">{currentName}</p>
            <p className="truncate text-[10px] text-muted-foreground">{email}</p>
          </div>
          <ChevronDown className="size-3.5 text-muted-foreground" />
        </div>
        <Link to="/settings" onClick={() => setMobileOpen(false)} className="flex h-9 items-center gap-3 rounded-md px-3 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"><Settings2 className="size-4" />Account settings</Link>
        <button type="button" onClick={() => void signOut()} className="flex h-9 w-full items-center gap-3 rounded-md px-3 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"><LogOut className="size-4" />Sign out</button>
        <div className="mt-3 flex items-center justify-between border-t border-border pt-3 px-2 text-[10px] text-muted-foreground"><span>NX Studio · Foundation</span><CircleHelp className="size-3.5" /></div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[248px] flex-col border-r border-border bg-sidebar lg:flex">{sidebar}</aside>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-scrim lg:hidden" onClick={() => setMobileOpen(false)}><aside className="flex h-full w-[280px] flex-col border-r border-border bg-sidebar" onClick={(event) => event.stopPropagation()}>{sidebar}</aside></div>}
      <div className="lg:pl-[248px]">
        <header className="sticky top-0 z-20 flex h-[76px] items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur sm:px-7">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu" onClick={() => setMobileOpen(true)}><Menu /></Button>
            <div className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex"><span>Workspace</span><span className="text-border">/</span><span className="text-foreground">{navigation.find((item) => location.pathname === item.to)?.label ?? (location.pathname.startsWith("/sessions/") ? "Production studio" : location.pathname === "/settings" ? "Account settings" : "Overview")}</span></div>
            <p className="text-xs font-medium sm:hidden">NXpay <span className="text-muted-foreground">/ Studio</span></p>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden items-center gap-2 rounded-sm border border-border px-2.5 py-1.5 text-[10px] font-medium text-muted-foreground sm:flex"><span className="size-1.5 rounded-full bg-status-idle" />STUDIO OFFLINE</span>
            <Button variant="ghost" size="icon" aria-label="Notifications" disabled title="No new notifications"><Bell /></Button>
            <div className="grid size-8 place-items-center rounded-full border border-border bg-secondary text-xs font-semibold text-secondary-foreground">{currentName.slice(0, 1).toUpperCase()}</div>
          </div>
        </header>
        <main className="mx-auto min-h-[calc(100vh-76px)] w-full max-w-[1480px] px-4 py-7 sm:px-7 sm:py-9 lg:px-10">{children}</main>
      </div>
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary">{children}</p>;
}

export function PageHeading({ eyebrow, title, description, actions }: { eyebrow: string; title: string; description: string; actions?: ReactNode }) {
  return <div className="mb-8 flex flex-col justify-between gap-5 border-b border-border pb-6 sm:flex-row sm:items-end"><div><Eyebrow>{eyebrow}</Eyebrow><h1 className="font-display text-2xl font-semibold tracking-tight sm:text-[28px]">{title}</h1><p className="mt-2 max-w-2xl text-sm text-muted-foreground">{description}</p></div>{actions}</div>;
}

export function StatusTag({ children, kind = "idle" }: { children: ReactNode; kind?: "idle" | "ready" | "warning" }) {
  return <span className={`inline-flex items-center gap-2 rounded-sm border px-2 py-1 text-[10px] font-medium uppercase tracking-[0.08em] ${kind === "ready" ? "border-status-ready/30 bg-status-ready/10 text-status-ready" : kind === "warning" ? "border-status-warning/30 bg-status-warning/10 text-status-warning" : "border-border bg-secondary text-muted-foreground"}`}><span className={`size-1.5 rounded-full ${kind === "ready" ? "bg-status-ready" : kind === "warning" ? "bg-status-warning" : "bg-status-idle"}`} />{children}</span>;
}

export function EmptyState({ icon: Icon, title, detail }: { icon: typeof AudioLines; title: string; detail: string }) {
  return <div className="flex min-h-48 flex-col items-center justify-center border border-dashed border-border px-6 text-center"><Icon className="mb-4 size-7 text-muted-foreground" /><p className="text-sm font-medium">{title}</p><p className="mt-1 max-w-sm text-xs leading-5 text-muted-foreground">{detail}</p></div>;
}