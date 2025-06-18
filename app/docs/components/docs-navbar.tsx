import { SidebarTrigger } from '@/components/ui/sidebar';

import { DocsBreadcrumb, DocsBreadcrumbProps } from './docs-breadcrumb';
// import { DocsSearch } from './docs-search';

export const DocsNavbar = ({ docs }: DocsBreadcrumbProps) => (
  <div className="flex shrink-0 items-center justify-between gap-8 border-b px-4 py-2.5">
    <div className="flex items-center gap-4">
      <SidebarTrigger className="text-muted-foreground" />
      <DocsBreadcrumb docs={docs} />
      {/* <DocsSearch docs={docs} /> */}
     
    </div>
  </div>
);
