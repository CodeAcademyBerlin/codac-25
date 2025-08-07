'use client';

import { useState, useEffect } from 'react';
import { RefreshCw, Database, MessageCircle, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { indexAllContent, getIndexingStats } from '@/actions/rag/index-content';
import { testRAG as testRAGAction } from '@/actions/rag/test-rag';
import { RAGMonitoringDashboard } from './rag-monitoring-dashboard';

export function RAGAdminPanel() {
    const [isIndexing, setIsIndexing] = useState(false);
    const [isTesting, setIsTesting] = useState(false);
    const [indexingProgress, setIndexingProgress] = useState<{
        indexed: number;
        errors: string[];
        duration: number;
    } | null>(null);
    const [stats, setStats] = useState<{
        totalEmbeddings: number;
        byContentType: Record<string, number>;
        averageChunksPerContent: number;
        lastIndexed?: Date;
    } | null>(null);
    const [testResult, setTestResult] = useState<any>(null);

    const handleIndexContent = async () => {
        setIsIndexing(true);
        setIndexingProgress(null);

        try {
            toast.info('Starting content indexing...');
            const result = await indexAllContent();

            if (result.success) {
                setIndexingProgress(result.data);
                toast.success(`Successfully indexed ${result.data.indexed} content chunks`);

                if (result.data.errors.length > 0) {
                    toast.warning(`${result.data.errors.length} errors occurred during indexing`);
                }

                // Refresh stats
                await loadStats();
            } else {
                toast.error(typeof result.error === 'string' ? result.error : 'Failed to index content');
            }
        } catch (error) {
            console.error('Indexing error:', error);
            toast.error('Failed to index content');
        } finally {
            setIsIndexing(false);
        }
    };

    const handleTestRAG = async () => {
        setIsTesting(true);
        setTestResult(null);

        try {
            const result = await testRAGAction("What courses are available in this program?");

            if (result.success) {
                setTestResult(result.data);
                toast.success('RAG test completed successfully');
            } else {
                toast.error(typeof result.error === 'string' ? result.error : 'RAG test failed');
            }
        } catch (error) {
            console.error('RAG test error:', error);
            toast.error('Failed to test RAG system');
        } finally {
            setIsTesting(false);
        }
    };

    const loadStats = async () => {
        try {
            const result = await getIndexingStats();
            if (result.success) {
                setStats(result.data);
            }
        } catch (error) {
            console.error('Failed to load stats:', error);
        }
    };

    // Load stats on component mount
    useEffect(() => {
        loadStats();
    }, []);

    return (
        <Tabs defaultValue="overview" className="space-y-6">
            <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="indexing">Content Indexing</TabsTrigger>
                <TabsTrigger value="testing">System Testing</TabsTrigger>
                <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Embeddings</CardTitle>
                            <Database className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.totalEmbeddings ?? 'Loading...'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Indexed content chunks
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Avg. Chunks</CardTitle>
                            <BarChart3 className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.averageChunksPerContent?.toFixed(1) ?? 'Loading...'}
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Per content item
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Last Indexed</CardTitle>
                            <RefreshCw className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {stats?.lastIndexed
                                    ? new Date(stats.lastIndexed).toLocaleDateString()
                                    : 'Never'
                                }
                            </div>
                            <p className="text-xs text-muted-foreground">
                                Content last updated
                            </p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">System Status</CardTitle>
                            <MessageCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">Online</div>
                            <p className="text-xs text-muted-foreground">
                                RAG system operational
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Content Breakdown */}
                {stats && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Content Breakdown</CardTitle>
                            <CardDescription>
                                Number of indexed chunks by content type
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {Object.entries(stats.byContentType).map(([type, count]) => (
                                    <div key={type} className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-3 h-3 rounded-full bg-primary" />
                                            <span className="capitalize">{type}</span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <span className="text-sm text-muted-foreground">{count} chunks</span>
                                            <div className="w-20">
                                                <Progress
                                                    value={(count / stats.totalEmbeddings) * 100}
                                                    className="h-2"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </TabsContent>

            <TabsContent value="indexing" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Content Indexing</CardTitle>
                        <CardDescription>
                            Index all LMS content for the RAG system
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-4">
                            <Button
                                onClick={handleIndexContent}
                                disabled={isIndexing}
                                className="flex items-center gap-2"
                            >
                                <RefreshCw className={`h-4 w-4 ${isIndexing ? 'animate-spin' : ''}`} />
                                {isIndexing ? 'Indexing...' : 'Start Full Indexing'}
                            </Button>

                            <Button
                                variant="outline"
                                onClick={loadStats}
                                disabled={isIndexing}
                            >
                                Refresh Stats
                            </Button>
                        </div>

                        {indexingProgress && (
                            <div className="space-y-2">
                                <Separator />
                                <div className="bg-muted/50 p-4 rounded-lg space-y-2">
                                    <h4 className="font-medium">Last Indexing Results</h4>
                                    <div className="grid grid-cols-3 gap-4 text-sm">
                                        <div>
                                            <span className="text-muted-foreground">Indexed:</span>
                                            <div className="font-mono text-lg">{indexingProgress.indexed}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Errors:</span>
                                            <div className="font-mono text-lg">{indexingProgress.errors.length}</div>
                                        </div>
                                        <div>
                                            <span className="text-muted-foreground">Duration:</span>
                                            <div className="font-mono text-lg">{(indexingProgress.duration / 1000).toFixed(2)}s</div>
                                        </div>
                                    </div>

                                    {indexingProgress.errors.length > 0 && (
                                        <details className="mt-2">
                                            <summary className="cursor-pointer text-sm text-destructive">
                                                Show Errors ({indexingProgress.errors.length})
                                            </summary>
                                            <div className="mt-2 text-xs bg-destructive/10 p-2 rounded max-h-32 overflow-y-auto">
                                                {indexingProgress.errors.map((error, index) => (
                                                    <div key={index} className="mb-1">{error}</div>
                                                ))}
                                            </div>
                                        </details>
                                    )}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="testing" className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle>RAG System Testing</CardTitle>
                        <CardDescription>
                            Test the RAG query engine with sample questions
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button
                            onClick={handleTestRAG}
                            disabled={isTesting}
                            className="flex items-center gap-2"
                        >
                            <MessageCircle className={`h-4 w-4 ${isTesting ? 'animate-pulse' : ''}`} />
                            {isTesting ? 'Testing...' : 'Run RAG Test'}
                        </Button>

                        {testResult && (
                            <div className="space-y-4">
                                <Separator />
                                <div className="bg-muted/50 p-4 rounded-lg space-y-4">
                                    <h4 className="font-medium">Test Results</h4>

                                    <div>
                                        <h5 className="text-sm font-medium mb-2">Response:</h5>
                                        <div className="bg-background p-3 rounded border text-sm">
                                            {testResult.response}
                                        </div>
                                    </div>

                                    {testResult.sources && testResult.sources.length > 0 && (
                                        <div>
                                            <h5 className="text-sm font-medium mb-2">
                                                Sources ({testResult.sources.length}):
                                            </h5>
                                            <div className="space-y-2">
                                                {testResult.sources.map((source: any, index: number) => (
                                                    <div key={index} className="bg-background p-3 rounded border text-sm">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <span className="font-medium">{source.contentType}</span>
                                                            <span className="text-xs bg-primary/10 px-2 py-1 rounded">
                                                                {(source.similarity * 100).toFixed(0)}% match
                                                            </span>
                                                        </div>
                                                        <div className="text-muted-foreground text-xs mb-1">
                                                            {source.courseName}
                                                        </div>
                                                        <div className="text-xs">
                                                            {source.excerpt}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <div className="text-xs text-muted-foreground">
                                        Token usage: {testResult.tokenCount}
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-6">
                <RAGMonitoringDashboard />
            </TabsContent>
        </Tabs>
    );
}
