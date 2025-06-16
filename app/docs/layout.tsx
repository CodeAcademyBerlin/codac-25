import { getDocs } from '@/data/docs';
import { DocSidebarContent } from './doc-sidebar-content';
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { ThemePicker } from "@/components/theme-picker";
import { DocsBreadcrumb } from './docs-breadcrumb';

export default async function DocLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Get all docs for sidebar (we'll filter in the breadcrumb client-side)
  const docs = await getDocs();

  return (
    <div className="h-full w-full">
      <header className="flex h-16 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mr-2 data-[orientation=vertical]:h-4"
        />
        <DocsBreadcrumb docs={docs} />
        <div className="ml-auto">
          <ThemePicker variant="dropdown" align="end" />
        </div>
      </header>

      <div className="">
        <DocSidebarContent docs={docs} />
        <main className="">
          <div className="p-4">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
  // return (
  //   <div className="flex flex-col h-full w-full">
  //     <header className="flex-shrink-0 flex h-16 items-center gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
  //       <SidebarTrigger className="-ml-1" />
  //       <Separator
  //         orientation="vertical"
  //         className="mr-2 data-[orientation=vertical]:h-4"
  //       />
  //       <Breadcrumb>
  //         <BreadcrumbList>
  //           <BreadcrumbItem className="hidden md:block">
  //             <BreadcrumbLink href="/">
  //               Dashboard
  //             </BreadcrumbLink>
  //           </BreadcrumbItem>
  //           <BreadcrumbSeparator className="hidden md:block" />
  //           <BreadcrumbItem>
  //             <BreadcrumbPage>Documents</BreadcrumbPage>
  //           </BreadcrumbItem>
  //         </BreadcrumbList>
  //       </Breadcrumb>
  //       <div className="ml-auto">
  //         <ThemePicker variant="dropdown" align="end" />
  //       </div>
  //     </header>

  //     <div className="flex flex-1">
  //       <DocSidebarContent docs={docs} />
  //       <main className="w-full mr-3">
  //         {children}
  //       </main>
  //     </div>
  //   </div>
  // );
}
