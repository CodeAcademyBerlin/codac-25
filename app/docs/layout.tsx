import { ThemePicker } from '@/components/theme-picker';
import { getDocs } from '@/data/docs';

import { DocSidebarContent } from './components/doc-sidebar-content';
import { DocsNavbar } from './components/docs-navbar';

export default async function DocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get all docs for sidebar
  const docs = await getDocs();
  
  return (
    <>
    <div className="flex items-center gap-4" >
        <DocsNavbar docs={docs} />
        <div className="ml-auto pr-4">
        <ThemePicker variant="dropdown" align="end" />
        </div>
      </div>
      <div className="flex h-full w-full divide-x">
      <DocSidebarContent docs={docs} />
        {children}
      </div>
     
      </>
  );
}
