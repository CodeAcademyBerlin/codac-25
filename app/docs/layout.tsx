import { ThemePicker } from '@/components/theme-picker';
import { getDocs } from '@/data/docs/docs';
import { getDocsHierarchy } from '@/data/docs/docs-hierarchy';

import { DndWrapper } from './components/dnd-wrapper';
import { DocSidebarContent } from './components/doc-sidebar-content';
import { DocsNavbar } from './components/docs-navbar';

export default async function DocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get hierarchical docs for sidebar
  const nodes = await getDocsHierarchy();
  // Get flat docs for navbar (compatibility)
  const docs = await getDocs();

  return (
    <DndWrapper>
      <div className="flex items-center gap-4" >
        <DocsNavbar docs={docs} />
        <div className="ml-auto pr-4">
          <ThemePicker variant="dropdown" align="end" />
        </div>
      </div>
      <div className="flex h-full w-full">
        <DocSidebarContent nodes={nodes} />
        {children}
      </div>
    </DndWrapper>
  );
}
