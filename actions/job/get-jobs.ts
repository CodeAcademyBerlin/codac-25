'use server'

import { JobType, JobLevel } from '@prisma/client'

import { prisma } from '@/lib/db/prisma'

interface GetJobsParams {
    search?: string
    type?: string
    level?: string
    remote?: string
    company?: string
}

export async function getJobs(params: GetJobsParams = {}) {
    const { search, type, level, remote, company } = params

    try {
        const jobs = await prisma.job.findMany({
            where: {
                isActive: true,
                AND: [
                    search
                        ? {
                            OR: [
                                { title: { contains: search, mode: 'insensitive' } },
                                { description: { contains: search, mode: 'insensitive' } },
                                { company: { contains: search, mode: 'insensitive' } },
                            ],
                        }
                        : {},
                    type && type !== 'all' ? { type: type as JobType } : {},
                    level && level !== 'all' ? { level: level as JobLevel } : {},
                    remote === 'true' ? { remote: true } : {},
                    company ? { company: { contains: company, mode: 'insensitive' } } : {},
                ],
            },
            include: {
                postedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                _count: {
                    select: {
                        applications: true,
                    },
                },
            },
            orderBy: [
                { featured: 'desc' },
                { createdAt: 'desc' },
            ],
        })

        return jobs
    } catch (error) {
        console.error('Error fetching jobs:', error)
        return []
    }
}

export async function getJobById(id: string) {
    try {
        const job = await prisma.job.findUnique({
            where: { id },
            include: {
                postedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        image: true,
                    },
                },
                applications: {
                    select: {
                        id: true,
                        status: true,
                        appliedAt: true,
                        user: {
                            select: {
                                id: true,
                                name: true,
                                email: true,
                                image: true,
                            },
                        },
                    },
                },
            },
        })

        return job
    } catch (error) {
        console.error('Error fetching job:', error)
        return null
    }
} 