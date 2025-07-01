import {
    Calendar,
    Trophy,
    Users,
    MessageSquare,
    BookOpen,
    TrendingUp,
    Palette,
    Info,
    CheckCircle,
    XCircle
} from "lucide-react"

import { ThemePicker } from "@/components/theme-picker"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import {
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

export default function ThemeDemoPage() {
    return (
        <>
    
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/">
                                    Dashboard
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator className="hidden md:block" />
                            <BreadcrumbItem>
                                <BreadcrumbPage>Theme Demo</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto">
                        <ThemePicker variant="dropdown" align="end" />
                    </div>
                </header>

                <div className="flex flex-1 flex-col gap-6 p-6">
                    {/* Header */}
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
                                <Palette className="h-8 w-8 text-primary" />
                                Theme Customization Demo
                            </h1>
                            <p className="text-muted-foreground">
                                Experience different themes and color schemes for CODAC
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary">
                                Interactive Demo
                            </Badge>
                        </div>
                    </div>

                    {/* Theme Picker Section */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Theme Controls
                            </CardTitle>
                            <CardDescription>
                                Try different theme modes and color schemes to customize your CODAC experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Theme Picker (Dropdown)</Label>
                                    <p className="text-sm text-muted-foreground">Click to see all theme options</p>
                                </div>
                                <ThemePicker variant="dropdown" align="end" />
                            </div>

                            <Separator />

                            <div className="flex items-center justify-between">
                                <div>
                                    <Label className="text-base font-medium">Theme Picker (Popover)</Label>
                                    <p className="text-sm text-muted-foreground">Enhanced theme customization panel</p>
                                </div>
                                <ThemePicker variant="popover" align="end" />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Component Showcase */}
                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Buttons & Badges */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Buttons & Badges</CardTitle>
                                <CardDescription>See how buttons look in different themes</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex flex-wrap gap-2">
                                    <Button>Primary Button</Button>
                                    <Button variant="secondary">Secondary</Button>
                                    <Button variant="outline">Outline</Button>
                                    <Button variant="ghost">Ghost</Button>
                                    <Button variant="destructive">Destructive</Button>
                                </div>

                                <div className="flex flex-wrap gap-2">
                                    <Badge>Default Badge</Badge>
                                    <Badge variant="secondary">Secondary</Badge>
                                    <Badge variant="destructive">Destructive</Badge>
                                    <Badge variant="outline">Outline</Badge>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progress & Stats */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Progress & Statistics</CardTitle>
                                <CardDescription>Progress bars and metrics</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Course Progress</span>
                                        <span>75%</span>
                                    </div>
                                    <Progress value={75} className="h-2" />
                                </div>

                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Weekly Goal</span>
                                        <span>60%</span>
                                    </div>
                                    <Progress value={60} className="h-2" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 pt-2">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-primary">89%</div>
                                        <div className="text-xs text-muted-foreground">Completion</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold">14</div>
                                        <div className="text-xs text-muted-foreground">Day Streak</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Alerts & Forms */}
                    <div className="grid gap-6 md:grid-cols-2">
                        <Card>
                            <CardHeader>
                                <CardTitle>Alerts & Notifications</CardTitle>
                                <CardDescription>Different alert styles and states</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Alert>
                                    <Info className="h-4 w-4" />
                                    <AlertTitle>Information</AlertTitle>
                                    <AlertDescription>
                                        This is an informational alert message.
                                    </AlertDescription>
                                </Alert>

                                <Alert className="border-green-200 bg-green-50 text-green-800 dark:border-green-800 dark:bg-green-950 dark:text-green-400">
                                    <CheckCircle className="h-4 w-4" />
                                    <AlertTitle>Success</AlertTitle>
                                    <AlertDescription>
                                        Your changes have been saved successfully.
                                    </AlertDescription>
                                </Alert>

                                <Alert variant="destructive">
                                    <XCircle className="h-4 w-4" />
                                    <AlertTitle>Error</AlertTitle>
                                    <AlertDescription>
                                        Something went wrong. Please try again.
                                    </AlertDescription>
                                </Alert>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Form Components</CardTitle>
                                <CardDescription>Input fields and form elements</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="demo-input">Email Address</Label>
                                    <Input id="demo-input" placeholder="Enter your email" />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="demo-textarea">Message</Label>
                                    <Textarea id="demo-textarea" placeholder="Type your message..." />
                                </div>

                                <div className="flex items-center space-x-2">
                                    <Switch id="demo-switch" />
                                    <Label htmlFor="demo-switch">Enable notifications</Label>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Tabs & Lists */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Tabs & Navigation</CardTitle>
                            <CardDescription>Tabbed content and navigation elements</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="overview" className="w-full">
                                <TabsList className="grid w-full grid-cols-4">
                                    <TabsTrigger value="overview">Overview</TabsTrigger>
                                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                                    <TabsTrigger value="reports">Reports</TabsTrigger>
                                    <TabsTrigger value="settings">Settings</TabsTrigger>
                                </TabsList>

                                <TabsContent value="overview" className="mt-4">
                                    <div className="grid gap-4 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Learning Progress</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Track your course completion and study time across all subjects.
                                            </p>
                                        </div>
                                        <div className="space-y-2">
                                            <h4 className="font-medium">Community Activity</h4>
                                            <p className="text-sm text-muted-foreground">
                                                Stay connected with fellow students and participate in discussions.
                                            </p>
                                        </div>
                                    </div>
                                </TabsContent>

                                <TabsContent value="analytics" className="mt-4">
                                    <div className="text-center py-8">
                                        <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h4 className="font-medium">Analytics Dashboard</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Detailed insights and performance metrics would appear here.
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="reports" className="mt-4">
                                    <div className="text-center py-8">
                                        <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                                        <h4 className="font-medium">Progress Reports</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Generate and download detailed learning reports.
                                        </p>
                                    </div>
                                </TabsContent>

                                <TabsContent value="settings" className="mt-4">
                                    <div className="text-center py-8">
                                        <ThemePicker variant="popover" align="center" />
                                        <h4 className="font-medium mt-4">Theme Settings</h4>
                                        <p className="text-sm text-muted-foreground">
                                            Customize your CODAC experience with different themes.
                                        </p>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    {/* Community Activity Demo */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                Community Activity
                            </CardTitle>
                            <CardDescription>Sample community posts and interactions</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatars/sarah.jpg" />
                                    <AvatarFallback>SM</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm">
                                        <span className="font-medium">Sarah Miller</span> completed the React Hooks lesson
                                    </p>
                                    <p className="text-xs text-muted-foreground">2 hours ago</p>
                                </div>
                                <Badge variant="secondary">
                                    <Trophy className="h-3 w-3 mr-1" />
                                    Achievement
                                </Badge>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatars/tom.jpg" />
                                    <AvatarFallback>TK</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm">
                                        <span className="font-medium">Tom König</span> started a discussion about TypeScript
                                    </p>
                                    <p className="text-xs text-muted-foreground">4 hours ago</p>
                                </div>
                                <Badge variant="outline">
                                    <MessageSquare className="h-3 w-3 mr-1" />
                                    Discussion
                                </Badge>
                            </div>

                            <div className="flex items-start space-x-3">
                                <Avatar className="h-8 w-8">
                                    <AvatarImage src="/avatars/lisa.jpg" />
                                    <AvatarFallback>LW</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm">
                                        <span className="font-medium">Lisa Weber</span> shared a job opportunity
                                    </p>
                                    <p className="text-xs text-muted-foreground">1 day ago</p>
                                </div>
                                <Badge className="bg-green-100 text-green-800 hover:bg-green-200">
                                    <Calendar className="h-3 w-3 mr-1" />
                                    Job Board
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </div>
       
        </>
    )
} 