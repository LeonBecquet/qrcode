export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <article className="prose prose-neutral dark:prose-invert container mx-auto max-w-3xl px-4 py-12">
      {children}
    </article>
  );
}
