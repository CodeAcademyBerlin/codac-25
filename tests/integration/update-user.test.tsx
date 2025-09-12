import { screen, waitFor } from "@testing-library/react"
import { describe, beforeEach, test, expect } from "vitest"

import { ProfileHeader } from "@/components/profile/profile-header"
import { type UserProfile } from "@/data/user/get-user"

import { DatabaseHelpers } from "../utils/database-helpers"
import { createMockUser } from "../utils/fixtures"
import { render } from "../utils/test-utils"

describe('Update User Integration Test', () => {
    beforeEach(() => {
        DatabaseHelpers.resetMocks()
        DatabaseHelpers.setupCommonMocks()
    })

    test('should render profile header component with user data', async () => {
        // Arrange
        const mockUserData = createMockUser({
            name: 'Test User',
            email: 'test@example.com',
            bio: 'This is a test bio for the user profile'
        })

        // Convert to UserProfile type structure
        const userProfile: UserProfile = {
            ...mockUserData,
            cohort: null,
            _count: {
                enrollments: 2,
                posts: 10,
                comments: 15,
                achievements: 3,
            }
        }

        const userHelpers = DatabaseHelpers.mockUserOperations()
        userHelpers.mockFindUserById(userProfile.id, userProfile)

        // Act - Render the ProfileHeader component
        render(<ProfileHeader user={userProfile} />)

        // Assert
        await waitFor(() => {
            expect(screen.getByText('Test User')).toBeInTheDocument()
        })

        // Additional assertions for profile header
        expect(screen.getByText('test@example.com')).toBeInTheDocument()
        expect(screen.getByText('STUDENT')).toBeInTheDocument()
        expect(screen.getByText('ACTIVE')).toBeInTheDocument()
        expect(screen.getByText('This is a test bio for the user profile')).toBeInTheDocument()
        expect(screen.getByText('Edit Profile')).toBeInTheDocument()
    })
})