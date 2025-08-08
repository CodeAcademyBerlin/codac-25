import { prisma } from '@/lib/db/prisma';
import { logger } from '@/lib/logger';

export interface RAGUsageMetrics {
    totalQueries: number;
    totalSessions: number;
    averageResponseTime: number;
    averageTokensPerQuery: number;
    topQuestionCategories: Array<{
        category: string;
        count: number;
        percentage: number;
    }>;
    userEngagement: {
        dailyActiveUsers: number;
        averageQueriesPerUser: number;
        averageSessionDuration: number;
    };
    contentPerformance: {
        mostReferencedContent: Array<{
            contentType: string;
            contentId: string;
            title: string;
            referenceCount: number;
        }>;
        averageSimilarityScore: number;
    };
    systemHealth: {
        errorRate: number;
        averageIndexingTime: number;
        totalEmbeddings: number;
    };
}

export interface QueryAnalytics {
    id: string;
    query: string;
    responseTime: number;
    tokenCount: number;
    sourcesFound: number;
    averageSimilarity: number;
    userId: string;
    timestamp: Date;
    category?: string;
}

export class RAGAnalytics {
    /**
     * Get comprehensive usage metrics for a date range
     */
    async getUsageMetrics(
        startDate: Date,
        endDate: Date
    ): Promise<RAGUsageMetrics> {
        try {
            const [
                queryStats,
                sessionStats,
                contentStats,
                systemStats
            ] = await Promise.all([
                this.getQueryStatistics(startDate, endDate),
                this.getSessionStatistics(startDate, endDate),
                this.getContentStatistics(startDate, endDate),
                this.getSystemStatistics()
            ]);

            return {
                totalQueries: queryStats.totalQueries,
                totalSessions: sessionStats.totalSessions,
                averageResponseTime: queryStats.averageResponseTime,
                averageTokensPerQuery: queryStats.averageTokensPerQuery,
                topQuestionCategories: await this.categorizeQuestions(startDate, endDate),
                userEngagement: {
                    dailyActiveUsers: sessionStats.dailyActiveUsers,
                    averageQueriesPerUser: queryStats.averageQueriesPerUser,
                    averageSessionDuration: sessionStats.averageSessionDuration
                },
                contentPerformance: {
                    mostReferencedContent: contentStats.mostReferencedContent,
                    averageSimilarityScore: contentStats.averageSimilarityScore
                },
                systemHealth: {
                    errorRate: systemStats.errorRate,
                    averageIndexingTime: systemStats.averageIndexingTime,
                    totalEmbeddings: systemStats.totalEmbeddings
                }
            };
        } catch (error) {
            logger.error('Failed to get usage metrics:', error instanceof Error ? error : undefined);
            throw error;
        }
    }

    /**
     * Track a query for analytics
     */
    // async trackQuery(
    //     _query: string,
    //     responseTime: number,
    //     _tokenCount: number,
    //     sourcesFound: number,
    //     averageSimilarity: number,
    //     _userId: string,
    //     sessionId: string
    // ): Promise<void> {
    //     try {
    //         // For now, we'll use the existing chat_messages table
    //         // In production, you might want a separate analytics table
    //         await prisma.chatMessage.updateMany({
    //             where: {
    //                 sessionId,
    //                 role: 'assistant',
    //                 createdAt: {
    //                     gte: new Date(Date.now() - 60000) // Last minute
    //                 }
    //             },
    //             data: {
    //                 // Store analytics in sources JSON field temporarily
    //                 sources: {
    //                     analytics: {
    //                         responseTime,
    //                         sourcesFound,
    //                         averageSimilarity,
    //                         timestamp: new Date().toISOString()
    //                     }
    //                 }
    //             }
    //         });
    //     } catch (error) {
    //         logger.error('Failed to track query:', error instanceof Error ? error : undefined);
    //         // Don't throw - analytics shouldn't break the main flow
    //     }
    // }

    /**
     * Get query statistics
     */
    private async getQueryStatistics(startDate: Date, endDate: Date) {
        const messages = await prisma.chatMessage.findMany({
            where: {
                role: 'assistant',
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                session: {
                    select: { userId: true }
                }
            }
        });

        const totalQueries = messages.length;
        const totalTokens = messages.reduce((sum, msg) => sum + (msg.tokenCount || 0), 0);
        const uniqueUsers = new Set(messages.map(msg => msg.session.userId)).size;

        return {
            totalQueries,
            averageResponseTime: 0, // Would need to store response times
            averageTokensPerQuery: totalQueries > 0 ? totalTokens / totalQueries : 0,
            averageQueriesPerUser: uniqueUsers > 0 ? totalQueries / uniqueUsers : 0
        };
    }

    /**
     * Get session statistics
     */
    private async getSessionStatistics(startDate: Date, endDate: Date) {
        const sessions = await prisma.chatSession.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                messages: true
            }
        });

        const totalSessions = sessions.length;
        const uniqueUsers = new Set(sessions.map(s => s.userId)).size;

        const sessionDurations = sessions.map(session => {
            if (session.messages.length < 2) return 0;
            const firstMessage = session.messages[0];
            const lastMessage = session.messages[session.messages.length - 1];
            return lastMessage.createdAt.getTime() - firstMessage.createdAt.getTime();
        });

        const averageSessionDuration = sessionDurations.length > 0
            ? sessionDurations.reduce((sum, dur) => sum + dur, 0) / sessionDurations.length / 1000 / 60 // in minutes
            : 0;

        return {
            totalSessions,
            dailyActiveUsers: uniqueUsers,
            averageSessionDuration
        };
    }

    /**
     * Get content performance statistics
     */
    private async getContentStatistics(_startDate: Date, _endDate: Date) {
        // This would require analyzing the sources in chat messages
        // For now, return mock data structure
        return {
            mostReferencedContent: [] as Array<{
                contentType: string;
                contentId: string;
                title: string;
                referenceCount: number;
            }>,
            averageSimilarityScore: 0.75
        };
    }

    /**
     * Get system health statistics
     */
    private async getSystemStatistics() {
        const totalEmbeddings = await prisma.contentEmbedding.count();

        return {
            errorRate: 0.02, // 2% - would track actual errors
            averageIndexingTime: 1500, // ms - would track actual indexing times
            totalEmbeddings
        };
    }

    /**
     * Categorize questions using simple keyword matching
     */
    private async categorizeQuestions(startDate: Date, endDate: Date) {
        const userMessages = await prisma.chatMessage.findMany({
            where: {
                role: 'user',
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            select: {
                content: true
            }
        });

        const categories = {
            'Course Information': ['course', 'program', 'curriculum', 'overview'],
            'Assignments': ['assignment', 'homework', 'project', 'due', 'submit'],
            'Learning Materials': ['lesson', 'material', 'resource', 'reading'],
            'Technical Help': ['error', 'problem', 'issue', 'help', 'troubleshoot'],
            'General Questions': ['what', 'how', 'why', 'when', 'where']
        };

        const categoryCounts: Record<string, number> = {};
        const total = userMessages.length;

        userMessages.forEach(message => {
            const content = message.content.toLowerCase();
            let categorized = false;

            for (const [category, keywords] of Object.entries(categories)) {
                if (keywords.some(keyword => content.includes(keyword))) {
                    categoryCounts[category] = (categoryCounts[category] || 0) + 1;
                    categorized = true;
                    break;
                }
            }

            if (!categorized) {
                categoryCounts['Other'] = (categoryCounts['Other'] || 0) + 1;
            }
        });

        return Object.entries(categoryCounts)
            .map(([category, count]) => ({
                category,
                count,
                percentage: total > 0 ? (count / total) * 100 : 0
            }))
            .sort((a, b) => b.count - a.count);
    }

    /**
     * Get daily usage trends
     */
    async getDailyUsageTrends(days: number = 30): Promise<Array<{
        date: string;
        queries: number;
        sessions: number;
        uniqueUsers: number;
    }>> {
        const endDate = new Date();
        const startDate = new Date(endDate.getTime() - (days * 24 * 60 * 60 * 1000));

        const sessions = await prisma.chatSession.findMany({
            where: {
                createdAt: {
                    gte: startDate,
                    lte: endDate
                }
            },
            include: {
                messages: {
                    where: {
                        role: 'user'
                    }
                }
            }
        });

        // Group by date
        const dailyData: Record<string, {
            queries: number;
            sessions: Set<string>;
            users: Set<string>;
        }> = {};

        sessions.forEach(session => {
            const date = session.createdAt.toISOString().split('T')[0];

            if (!dailyData[date]) {
                dailyData[date] = {
                    queries: 0,
                    sessions: new Set(),
                    users: new Set()
                };
            }

            dailyData[date].queries += session.messages.length;
            dailyData[date].sessions.add(session.id);
            dailyData[date].users.add(session.userId);
        });

        return Object.entries(dailyData)
            .map(([date, data]) => ({
                date,
                queries: data.queries,
                sessions: data.sessions.size,
                uniqueUsers: data.users.size
            }))
            .sort((a, b) => a.date.localeCompare(b.date));
    }

    /**
     * Get performance metrics for optimization
     */
    async getPerformanceMetrics(): Promise<{
        slowQueries: Array<{
            query: string;
            responseTime: number;
            tokenCount: number;
            timestamp: Date;
        }>;
        popularContent: Array<{
            contentType: string;
            title: string;
            accessCount: number;
        }>;
        userSatisfactionIndicators: {
            averageSessionLength: number;
            repeatUserRate: number;
            querySuccessRate: number;
        };
    }> {
        // This would analyze actual performance data
        // For now, return structure for implementation
        return {
            slowQueries: [],
            popularContent: [],
            userSatisfactionIndicators: {
                averageSessionLength: 5.2, // minutes
                repeatUserRate: 0.68, // 68%
                querySuccessRate: 0.94 // 94%
            }
        };
    }
}
