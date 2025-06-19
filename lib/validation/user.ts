import { z } from 'zod';

// Import the shared type
export type { ServerActionResult } from '@/lib/server-action-utils';

// Avatar validation schema - supports both URLs and base64 data URIs
const avatarSchema = z.string().refine(
    (value) => {
        // Check if it's a valid URL
        try {
            new URL(value);
            return true;
        } catch {
            // Check if it's a valid base64 data URI
            return value.startsWith('data:image/') && value.includes('base64,');
        }
    },
    {
        message: 'Avatar must be a valid URL or base64 image data URI'
    }
).optional();

// Base user validation schema
export const userSchema = z.object({
    email: z.string().email('Invalid email address').max(255, 'Email too long'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    avatar: avatarSchema,
    bio: z.string().max(500, 'Bio too long').optional(),
    role: z.enum(['STUDENT', 'ALUMNI', 'INSTRUCTOR', 'ADMIN']).default('STUDENT'),
    status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED']).default('ACTIVE'),
    cohort: z.string().max(100, 'Cohort name too long').optional(),
    graduationDate: z.date().optional(),
    linkedinUrl: z.string().url('Invalid LinkedIn URL').optional(),
    githubUrl: z.string().url('Invalid GitHub URL').optional(),
    portfolioUrl: z.string().url('Invalid portfolio URL').optional(),
    currentJob: z.string().max(100, 'Job title too long').optional(),
    currentCompany: z.string().max(100, 'Company name too long').optional(),
});

// Create user schema - required fields for creation
export const createUserSchema = z.object({
    email: z.string().email('Invalid email address').max(255, 'Email too long'),
    name: z.string().min(1, 'Name is required').max(100, 'Name too long').optional(),
    role: z.enum(['STUDENT', 'ALUMNI', 'INSTRUCTOR', 'ADMIN']),
    status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED']),
});

// Update user schema - all fields optional except id
export const updateUserSchema = userSchema.partial().extend({
    id: z.string().cuid('Invalid user ID'),
});

// Delete user schema
export const deleteUserSchema = z.object({
    id: z.string().cuid('Invalid user ID'),
});

// Get user schema
export const getUserSchema = z.object({
    id: z.string().cuid('Invalid user ID'),
});

// Get users with filters schema
export const getUsersSchema = z.object({
    role: z.enum(['STUDENT', 'ALUMNI', 'INSTRUCTOR', 'ADMIN']).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED']).optional(),
    cohort: z.string().optional(),
    limit: z.number().min(1).max(100).default(20),
    offset: z.number().min(0).default(0),
    search: z.string().max(100).optional(),
});

// Change user role schema (admin only)
export const changeUserRoleSchema = z.object({
    id: z.string().cuid('Invalid user ID'),
    role: z.enum(['STUDENT', 'ALUMNI', 'INSTRUCTOR', 'ADMIN']),
});

// Change user status schema
export const changeUserStatusSchema = z.object({
    id: z.string().cuid('Invalid user ID'),
    status: z.enum(['ACTIVE', 'INACTIVE', 'GRADUATED']),
});

// Bulk operations schemas
export const bulkDeleteUsersSchema = z.object({
    ids: z.array(z.string().cuid()).min(1, 'At least one user ID is required'),
});

// Profile update schema (for user's own profile)
export const updateProfileSchema = userSchema
    .omit({ role: true, status: true })
    .partial()
    .extend({
        id: z.string().cuid('Invalid user ID'),
    });

// Inferred types for type safety
export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type DeleteUserInput = z.infer<typeof deleteUserSchema>;
export type GetUserInput = z.infer<typeof getUserSchema>;
export type GetUsersInput = z.infer<typeof getUsersSchema>;
export type ChangeUserRoleInput = z.infer<typeof changeUserRoleSchema>;
export type ChangeUserStatusInput = z.infer<typeof changeUserStatusSchema>;
export type BulkDeleteUsersInput = z.infer<typeof bulkDeleteUsersSchema>;
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>; 