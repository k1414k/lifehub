import AppShell from "@/components/layout/AppShell";

export default function MemosLayout({ children }: { children: React.ReactNode }) {
  return <AppShell mainClassName="lg:flex lg:min-h-0 lg:overflow-hidden">{children}</AppShell>;
}
