import { getDocs } from '@/data/docs';

import { DocsNavbar } from './components/navbar';
import { DocSidebarContent } from './doc-sidebar-content';

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
      </div>
      <div className="flex h-full w-full divide-x">
      <DocSidebarContent docs={docs} />
        {children}
      </div>
     
      </>
  );
}
