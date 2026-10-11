export default function PolicyPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="container-page py-14">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-4xl font-extrabold tracking-tight text-ink-900">{title}</h1>
        {updated && <p className="mt-2 text-sm text-ink-500">Last updated: {updated}</p>}
        <div className="prose prose-lg mt-10 max-w-none">{children}</div>
      </div>
    </div>
  );
}
