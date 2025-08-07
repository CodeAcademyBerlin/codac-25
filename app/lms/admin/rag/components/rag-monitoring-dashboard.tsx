'use client';

import { useState, useEffect } from 'react';
import {
    Activity,
    Users,
    MessageSquare,
    Clock,
    Server,
    Database,
    Zap,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
} from 'recharts';

// Mock data - in real implementation, this would come from the analytics service
const mockUsageData = [
    { date: '2025-01-10', queries: 45, sessions: 12, users: 8 },
    { date: '2025-01-11', queries: 52, sessions: 15, users: 11 },
    { date: '2025-01-12', queries: 38, sessions: 10, users: 7 },
    { date: '2025-01-13', queries: 67, sessions: 18, users: 13 },
    { date: '2025-01-14', queries: 71, sessions: 20, users: 15 },
    { date: '2025-01-15', queries: 89, sessions: 25, users: 18 },
    { date: '2025-01-16', queries: 94, sessions: 28, users: 21 }
];

const mockCategoryData = [
    { category: 'Course Information', count: 156, percentage: 35 },
    { category: 'Assignments', count: 98, percentage: 22 },
    { category: 'Learning Materials', count: 87, percentage: 20 },
    { category: 'Technical Help', count: 65, percentage: 15 },
    { category: 'General Questions', count: 34, percentage: 8 }
];

const mockPerformanceData = [
    { time: '00:00', responseTime: 1200, queries: 5 },
    { time: '04:00', responseTime: 980, queries: 2 },
    { time: '08:00', responseTime: 1400, queries: 15 },
    { time: '12:00', responseTime: 1800, queries: 25 },
    { time: '16:00', responseTime: 1600, queries: 20 },
    { time: '20:00', responseTime: 1300, queries: 12 }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

export function RAGMonitoringDashboard() {
    const [isLoading, setIsLoading] = useState(false);
    const [systemHealth] = useState({
        status: 'healthy',
        uptime: '99.8%',
        errorRate: '0.2%',
        avgResponseTime: '1.2s',
        cacheHitRate: '78%'
    });

    const [realTimeStats, setRealTimeStats] = useState({
        activeUsers: 12,
        queriesLastHour: 34,
        avgTokensPerQuery: 245,
        totalEmbeddings: 2847
    });

    // Simulate real-time updates
    useEffect(() => {
        const interval = setInterval(() => {
            setRealTimeStats(prev => ({
                ...prev,
                activeUsers: Math.max(1, prev.activeUsers + Math.floor(Math.random() * 3) - 1),
                queriesLastHour: prev.queriesLastHour + Math.floor(Math.random() * 2)
            }));
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const handleRefreshMetrics = async () => {
        setIsLoading(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setIsLoading(false);
    };

    return (
        <div className="space-y-6">
            {/* System Health Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">System Status</CardTitle>
                        <CheckCircle className="h-4 w-4 text-green-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">Healthy</div>
                        <p className="text-xs text-muted-foreground">
                            Uptime: {systemHealth.uptime}
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{realTimeStats.activeUsers}</div>
                        <p className="text-xs text-muted-foreground">
                            Currently online
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Queries/Hour</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{realTimeStats.queriesLastHour}</div>
                        <p className="text-xs text-muted-foreground">
                            Last 60 minutes
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Avg Response</CardTitle>
                        <Clock className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemHealth.avgResponseTime}</div>
                        <p className="text-xs text-muted-foreground">
                            Response time
                        </p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                        <Zap className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{systemHealth.cacheHitRate}</div>
                        <p className="text-xs text-muted-foreground">
                            Cache efficiency
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Main Dashboard */}
            <Tabs defaultValue="usage" className="space-y-6">
                <div className="flex items-center justify-between">
                    <TabsList>
                        <TabsTrigger value="usage">Usage Analytics</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="content">Content Analytics</TabsTrigger>
                        <TabsTrigger value="system">System Health</TabsTrigger>
                    </TabsList>

                    <Button
                        onClick={handleRefreshMetrics}
                        disabled={isLoading}
                        variant="outline"
                        size="sm"
                    >
                        {isLoading ? 'Refreshing...' : 'Refresh Metrics'}
                    </Button>
                </div>

                <TabsContent value="usage" className="space-y-6">
                    {/* Usage Trends */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Usage Trends (Last 7 Days)</CardTitle>
                            <CardDescription>
                                Daily queries, sessions, and unique users
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={mockUsageData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis
                                            dataKey="date"
                                            tickFormatter={(value) => new Date(value).toLocaleDateString()}
                                        />
                                        <YAxis />
                                        <Tooltip
                                            labelFormatter={(value) => new Date(value).toLocaleDateString()}
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="queries"
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                            name="Queries"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="sessions"
                                            stroke="#82ca9d"
                                            strokeWidth={2}
                                            name="Sessions"
                                        />
                                        <Line
                                            type="monotone"
                                            dataKey="users"
                                            stroke="#ffc658"
                                            strokeWidth={2}
                                            name="Users"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Question Categories */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Question Categories</CardTitle>
                                <CardDescription>
                                    Distribution of question types
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={mockCategoryData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={100}
                                                paddingAngle={5}
                                                dataKey="count"
                                            >
                                                {mockCategoryData.map((_entry, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Category Breakdown</CardTitle>
                                <CardDescription>
                                    Detailed question category statistics
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {mockCategoryData.map((category, index) => (
                                        <div key={category.category} className="flex items-center justify-between">
                                            <div className="flex items-center space-x-2">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                                                />
                                                <span className="text-sm font-medium">{category.category}</span>
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <span className="text-sm text-muted-foreground">{category.count}</span>
                                                <div className="w-16">
                                                    <Progress value={category.percentage} className="h-2" />
                                                </div>
                                                <span className="text-xs text-muted-foreground w-8">
                                                    {category.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="performance" className="space-y-6">
                    {/* Performance Metrics */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Response Time Trends</CardTitle>
                            <CardDescription>
                                Average response times throughout the day
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <LineChart data={mockPerformanceData}>
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis dataKey="time" />
                                        <YAxis />
                                        <Tooltip />
                                        <Line
                                            type="monotone"
                                            dataKey="responseTime"
                                            stroke="#8884d8"
                                            strokeWidth={2}
                                            name="Response Time (ms)"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Performance Stats */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">P95 Response Time</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">2.1s</div>
                                <p className="text-xs text-muted-foreground">
                                    95th percentile
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">0.2%</div>
                                <p className="text-xs text-muted-foreground">
                                    Last 24 hours
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium">Throughput</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">45 req/min</div>
                                <p className="text-xs text-muted-foreground">
                                    Current rate
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6">
                    {/* Content Performance */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Most Referenced Content</CardTitle>
                                <CardDescription>
                                    Content with highest citation rates
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-3">
                                    {[
                                        { title: 'Introduction to Data Science', type: 'Lesson', refs: 45 },
                                        { title: 'Python Fundamentals', type: 'Course', refs: 38 },
                                        { title: 'Machine Learning Basics', type: 'Assignment', refs: 32 },
                                        { title: 'Web Development Overview', type: 'Project', refs: 28 },
                                        { title: 'Career Planning Guide', type: 'Resource', refs: 24 }
                                    ].map((content, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 rounded border">
                                            <div>
                                                <div className="font-medium text-sm">{content.title}</div>
                                                <div className="text-xs text-muted-foreground">{content.type}</div>
                                            </div>
                                            <Badge variant="secondary">{content.refs} refs</Badge>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Content Coverage</CardTitle>
                                <CardDescription>
                                    How well different content types are being utilized
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    {[
                                        { type: 'Lessons', coverage: 85, total: 52 },
                                        { type: 'Assignments', coverage: 72, total: 34 },
                                        { type: 'Projects', coverage: 68, total: 18 },
                                        { type: 'Courses', coverage: 90, total: 9 },
                                        { type: 'Resources', coverage: 45, total: 28 }
                                    ].map((item) => (
                                        <div key={item.type} className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span>{item.type}</span>
                                                <span>{item.coverage}% ({Math.floor(item.total * item.coverage / 100)}/{item.total})</span>
                                            </div>
                                            <Progress value={item.coverage} className="h-2" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </TabsContent>

                <TabsContent value="system" className="space-y-6">
                    {/* System Resources */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Memory Usage</CardTitle>
                                <Server className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">2.4 GB</div>
                                <Progress value={60} className="mt-2 h-2" />
                                <p className="text-xs text-muted-foreground mt-1">
                                    60% of 4GB allocated
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Database Size</CardTitle>
                                <Database className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1.2 GB</div>
                                <p className="text-xs text-muted-foreground">
                                    2,847 embeddings stored
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">API Calls</CardTitle>
                                <Activity className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">1,245</div>
                                <p className="text-xs text-muted-foreground">
                                    Today
                                </p>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">Alerts</CardTitle>
                                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">2</div>
                                <p className="text-xs text-muted-foreground">
                                    Active warnings
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Recent Alerts */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent System Events</CardTitle>
                            <CardDescription>
                                Latest alerts and system notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {[
                                    {
                                        type: 'warning',
                                        message: 'High memory usage detected (85%)',
                                        time: '2 minutes ago',
                                        severity: 'medium'
                                    },
                                    {
                                        type: 'info',
                                        message: 'Cache cleared successfully',
                                        time: '15 minutes ago',
                                        severity: 'low'
                                    },
                                    {
                                        type: 'warning',
                                        message: 'Response time exceeded threshold (>3s)',
                                        time: '1 hour ago',
                                        severity: 'medium'
                                    },
                                    {
                                        type: 'success',
                                        message: 'Content reindexing completed',
                                        time: '2 hours ago',
                                        severity: 'low'
                                    }
                                ].map((alert, index) => (
                                    <div key={index} className="flex items-center space-x-3 p-3 rounded border">
                                        <div className={`w-2 h-2 rounded-full ${alert.type === 'warning' ? 'bg-yellow-500' :
                                            alert.type === 'success' ? 'bg-green-500' :
                                                'bg-blue-500'
                                            }`} />
                                        <div className="flex-1">
                                            <div className="text-sm font-medium">{alert.message}</div>
                                            <div className="text-xs text-muted-foreground">{alert.time}</div>
                                        </div>
                                        <Badge variant={
                                            alert.severity === 'medium' ? 'destructive' :
                                                alert.severity === 'low' ? 'secondary' : 'default'
                                        }>
                                            {alert.severity}
                                        </Badge>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
