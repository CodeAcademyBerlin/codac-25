'use server'

import { cache } from 'react'

import { prisma } from '@/lib/db/prisma'
import { logger } from '@/lib/logger'

/**
 * Options for fetching chat messages
 */
export interface GetChatMessagesOptions {
    limit?: number
    offset?: number
    orderBy?: 'asc' | 'desc'
}

/**
 * Fetches chat messages for a specific room with pagination and ordering
 */
export const getChatMessages = async (roomName: string, options: GetChatMessagesOptions = {}) => {
    const { limit = 100, offset = 0, orderBy = 'asc' } = options

    try {
        // Only log on first call or if there's an error
        if (offset === 0) {
            logger.info('Fetching chat messages', {
                metadata: {
                    roomName,
                    limit,
                    offset,
                },
            })
        }

        // Build where clause
        const where = {
            roomName,
        }

        // Fetch messages with count
        const [messages, total] = await Promise.all([
            prisma.chatMessage.findMany({
                where,
                select: {
                    id: true,
                    content: true,
                    roomName: true,
                    userName: true,
                    userId: true,
                    createdAt: true,
                },
                orderBy: {
                    createdAt: orderBy,
                },
                skip: offset,
                take: limit,
            }),
            prisma.chatMessage.count({ where }),
        ])

        logger.info('Chat messages fetched successfully', {
            metadata: {
                roomName,
                messageCount: messages.length,
                total,
            },
        })

        return {
            messages,
            pagination: {
                total,
                pageSize: limit,
                offset,
            },
        }
    } catch (error) {
        logger.error('Error fetching chat messages', error instanceof Error ? error : new Error(String(error)), {
            metadata: { roomName, options }
        })
        throw new Error('Failed to fetch chat messages')
    }
}

/**
 * Fetches recent messages across all rooms (for dashboard/overview)
 */
export const getRecentMessages = cache(async (limit = 20) => {
    try {
        logger.info('Fetching recent messages across all rooms', {
            metadata: { limit },
        })

        const messages = await prisma.chatMessage.findMany({
            select: {
                id: true,
                content: true,
                roomName: true,
                userName: true,
                createdAt: true,
            },
            orderBy: {
                createdAt: 'desc',
            },
            take: limit,
        })

        logger.info('Recent messages fetched successfully', {
            metadata: { messageCount: messages.length },
        })

        return messages
    } catch (error) {
        logger.error('Error fetching recent messages', error instanceof Error ? error : new Error(String(error)))
        throw new Error('Failed to fetch recent messages')
    }
})

/**
 * Gets chat rooms with their latest message
 */
export const getChatRooms = cache(async () => {
    try {
        logger.info('Fetching chat rooms with latest messages')

        // Get distinct room names with their latest message
        const rooms = await prisma.chatMessage.groupBy({
            by: ['roomName'],
            _max: {
                createdAt: true,
            },
            _count: {
                id: true,
            },
        })

        // Get the actual latest messages for each room
        const roomsWithLatestMessage = await Promise.all(
            rooms.map(async (room) => {
                const latestMessage = await prisma.chatMessage.findFirst({
                    where: {
                        roomName: room.roomName,
                        ...(room._max.createdAt && { createdAt: room._max.createdAt }),
                    },
                    select: {
                        id: true,
                        content: true,
                        userName: true,
                        createdAt: true,
                    },
                })

                return {
                    roomName: room.roomName,
                    messageCount: room._count.id,
                    latestMessage,
                    lastActivity: room._max.createdAt,
                }
            })
        )

        // Sort by latest activity
        roomsWithLatestMessage.sort((a, b) => {
            if (!a.lastActivity || !b.lastActivity) return 0
            return new Date(b.lastActivity).getTime() - new Date(a.lastActivity).getTime()
        })

        logger.info('Chat rooms fetched successfully', {
            metadata: { roomCount: roomsWithLatestMessage.length },
        })

        return roomsWithLatestMessage
    } catch (error) {
        logger.error('Error fetching chat rooms', error instanceof Error ? error : new Error(String(error)))
        throw new Error('Failed to fetch chat rooms')
    }
})
