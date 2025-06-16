import { ThemePicker } from "@/components/theme-picker"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

interface DashboardHeaderProps {
    title?: string
    breadcrumbItems?: Array<{
        label: string
        href?: string
    }>
}

export function DashboardHeader({
    title: _title = "Overview",
    breadcrumbItems = [
        { label: "Dashboard", href: "/dashboard" },
        { label: "Overview" }
    ]
}: DashboardHeaderProps) {
    return (
        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
                orientation="vertical"
                className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
                <BreadcrumbList>
                    {breadcrumbItems.map((item, index) => (
                        <div key={item.label} className="flex items-center">
                            {index > 0 && <BreadcrumbSeparator className="hidden md:block" />}
                            <BreadcrumbItem className={index === 0 ? "hidden md:block" : ""}>
                                {item.href ? (
                                    <BreadcrumbLink href={item.href}>
                                        {item.label}
                                    </BreadcrumbLink>
                                ) : (
                                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                                )}
                            </BreadcrumbItem>
                        </div>
                    ))}
                </BreadcrumbList>
            </Breadcrumb>
            <div className="ml-auto">
                <ThemePicker variant="dropdown" align="end" />
            </div>
        </header>
    )
} 