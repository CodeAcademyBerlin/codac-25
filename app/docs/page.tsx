import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Book, Code, Database, Globe, Server, Terminal } from "lucide-react"

const topics = [
    {
        title: "Web Development Fundamentals",
        description: "Learn the basics of HTML, CSS, and JavaScript",
        icon: Globe,
        progress: 85,
        lessons: 12,
        category: "Frontend"
    },
    {
        title: "React & Next.js",
        description: "Build modern web applications with React and Next.js",
        icon: Code,
        progress: 65,
        lessons: 15,
        category: "Frontend"
    },
    {
        title: "Backend Development",
        description: "Master server-side programming and APIs",
        icon: Server,
        progress: 45,
        lessons: 10,
        category: "Backend"
    },
    {
        title: "Database Design",
        description: "Learn database modeling and SQL",
        icon: Database,
        progress: 30,
        lessons: 8,
        category: "Backend"
    },
    {
        title: "Command Line",
        description: "Essential terminal commands and tools",
        icon: Terminal,
        progress: 90,
        lessons: 6,
        category: "Tools"
    },
    {
        title: "Version Control",
        description: "Git and GitHub workflow mastery",
        icon: Book,
        progress: 75,
        lessons: 7,
        category: "Tools"
    }
]

export default function DocsPage() {
    return (
        <div className="p-6">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight">Documentation & Resources</h1>
                <p className="text-muted-foreground mt-2">
                    Explore our comprehensive learning materials and documentation
                </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {topics.map((topic) => (
                    <Card key={topic.title} className="hover:shadow-lg transition-shadow">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-xl">{topic.title}</CardTitle>
                                <topic.icon className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <CardDescription>{topic.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <Badge variant="secondary">{topic.category}</Badge>
                                    <span className="text-sm text-muted-foreground">
                                        {topic.lessons} lessons
                                    </span>
                                </div>
                                <div className="space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span>Progress</span>
                                        <span>{topic.progress}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-secondary rounded-full">
                                        <div
                                            className="h-2 bg-primary rounded-full transition-all"
                                            style={{ width: `${topic.progress}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
