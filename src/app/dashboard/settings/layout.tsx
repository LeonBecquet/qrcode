import { SettingsNav } from "./nav";

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr] md:gap-8">
      <aside className="md:sticky md:top-20 md:self-start">
        <SettingsNav />
      </aside>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
