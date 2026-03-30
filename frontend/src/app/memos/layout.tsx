import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";

export default function MemosLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-surface-muted">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden p-6">{children}</main>
      </div>
    </div>
  );
}
