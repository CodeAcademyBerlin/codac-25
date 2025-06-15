import { DocSidebar } from './doc-sidebar';

export default function DocLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className="flex">
      <DocSidebar />
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}
