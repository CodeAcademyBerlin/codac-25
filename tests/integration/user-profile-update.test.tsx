import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import userEvent from '@testing-library/user-event'
import { waitFor } from '@testing-library/react'

import { render, screen } from '@/tests/utils/test-utils'

import { updateUser } from '@/actions/user/update-user'

// Mock the server action
vi.mock('@/actions/user/update-user', () => ({
  updateUser: vi.fn(),
}))

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => '/profile',
}))

// Mock toast notifications
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(),
  },
}))

import { toast } from 'sonner'

// Mock profile form component for integration testing
const MockUserProfileForm = ({
  user,
  onSubmit
}: {
  user: any,
  onSubmit: (data: any) => Promise<void>
}) => {
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const formData = new FormData(e.target as HTMLFormElement)
    const data = {
      id: user.id,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      bio: formData.get('bio') as string,
      currentJob: formData.get('currentJob') as string,
      currentCompany: formData.get('currentCompany') as string,
      linkedinUrl: formData.get('linkedinUrl') as string,
      githubUrl: formData.get('githubUrl') as string,
      portfolioUrl: formData.get('portfolioUrl') as string,
    }
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} data-testid="profile-form">
      <div>
        <label htmlFor="name">Name</label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={user.name}
          required
        />
      </div>

      <div>
        <label htmlFor="email">Email</label>
        <input
          id="email"
          name="email"
          type="email"
          defaultValue={user.email}
          required
        />
      </div>

      <div>
        <label htmlFor="bio">Bio</label>
        <textarea
          id="bio"
          name="bio"
          defaultValue={user.bio || ''}
        />
      </div>

      <div>
        <label htmlFor="currentJob">Current Job</label>
        <input
          id="currentJob"
          name="currentJob"
          type="text"
          defaultValue={user.currentJob || ''}
        />
      </div>

      <div>
        <label htmlFor="currentCompany">Current Company</label>
        <input
          id="currentCompany"
          name="currentCompany"
          type="text"
          defaultValue={user.currentCompany || ''}
        />
      </div>

      <div>
        <label htmlFor="linkedinUrl">LinkedIn URL</label>
        <input
          id="linkedinUrl"
          name="linkedinUrl"
          type="url"
          defaultValue={user.linkedinUrl || ''}
        />
      </div>

      <div>
        <label htmlFor="githubUrl">GitHub URL</label>
        <input
          id="githubUrl"
          name="githubUrl"
          type="url"
          defaultValue={user.githubUrl || ''}
        />
      </div>

      <div>
        <label htmlFor="portfolioUrl">Portfolio URL</label>
        <input
          id="portfolioUrl"
          name="portfolioUrl"
          type="url"
          defaultValue={user.portfolioUrl || ''}
        />
      </div>

      <button type="submit" data-testid="submit-button">
        Update Profile
      </button>
    </form>
  )
}

// Mock complete profile page component
const MockProfilePage = () => {
  const mockUser = {
    id: 'user-123',
    name: 'John Doe',
    email: 'john@example.com',
    bio: 'Software developer and learner',
    currentJob: 'Junior Developer',
    currentCompany: 'Tech Startup',
    linkedinUrl: 'https://linkedin.com/in/johndoe',
    githubUrl: 'https://github.com/johndoe',
    portfolioUrl: 'https://johndoe.dev',
  }

  const handleUpdateProfile = async (data: any) => {
    try {
      toast.loading('Updating profile...', { id: 'update-profile' })

      const result = await updateUser(data)

      if (result.success) {
        toast.success('Profile updated successfully!', { id: 'update-profile' })
      } else {
        toast.error('Failed to update profile')
      }
    } catch (error) {
      toast.error('An unexpected error occurred', { id: 'update-profile' })
    }
  }

  return (
    <div data-testid="profile-page">
      <h1>User Profile</h1>
      <MockUserProfileForm user={mockUser} onSubmit={handleUpdateProfile} />
    </div>
  )
}

describe('User Profile Update Integration', () => {
  const mockUpdatedUser = {
    id: 'user-123',
    name: 'John Smith',
    email: 'john.smith@example.com',
    bio: 'Senior Software Developer with 5 years experience',
    currentJob: 'Senior Developer',
    currentCompany: 'Big Tech Corp',
    linkedinUrl: 'https://linkedin.com/in/johnsmith',
    githubUrl: 'https://github.com/johnsmith',
    portfolioUrl: 'https://johnsmith.dev',
    avatar: null,
    role: 'STUDENT',
    status: 'ACTIVE',
    cohort: null,
    graduationDate: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(updateUser).mockResolvedValue({
      success: true,
      data: mockUpdatedUser as any
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  describe('Successful profile updates', () => {
    it('should complete full profile update workflow', async () => {
      const user = userEvent.setup()

      render(<MockProfilePage />)

      // Verify initial form state
      expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument()
      expect(screen.getByDisplayValue('john@example.com')).toBeInTheDocument()
      expect(screen.getByDisplayValue('Software developer and learner')).toBeInTheDocument()

      // Update form fields
      const nameInput = screen.getByLabelText('Name')
      const emailInput = screen.getByLabelText('Email')
      const bioInput = screen.getByLabelText('Bio')
      const jobInput = screen.getByLabelText('Current Job')
      const companyInput = screen.getByLabelText('Current Company')

      await user.clear(nameInput)
      await user.type(nameInput, 'John Smith')

      await user.clear(emailInput)
      await user.type(emailInput, 'john.smith@example.com')

      await user.clear(bioInput)
      await user.type(bioInput, 'Senior Software Developer with 5 years experience')

      await user.clear(jobInput)
      await user.type(jobInput, 'Senior Developer')

      await user.clear(companyInput)
      await user.type(companyInput, 'Big Tech Corp')

      // Submit the form
      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      // Wait for the async operation to complete
      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith({
          id: 'user-123',
          name: 'John Smith',
          email: 'john.smith@example.com',
          bio: 'Senior Software Developer with 5 years experience',
          currentJob: 'Senior Developer',
          currentCompany: 'Big Tech Corp',
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          githubUrl: 'https://github.com/johndoe',
          portfolioUrl: 'https://johndoe.dev',
        })
      })

      // Verify loading toast was shown
      expect(toast.loading).toHaveBeenCalledWith('Updating profile...', { id: 'update-profile' })

      // Verify success toast was shown
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Profile updated successfully!', { id: 'update-profile' })
      })
    })

    it('should handle social media URL updates', async () => {
      const user = userEvent.setup()

      render(<MockProfilePage />)

      // Update social media URLs
      const linkedinInput = screen.getByLabelText('LinkedIn URL')
      const githubInput = screen.getByLabelText('GitHub URL')
      const portfolioInput = screen.getByLabelText('Portfolio URL')

      await user.clear(linkedinInput)
      await user.type(linkedinInput, 'https://linkedin.com/in/johnsmith')

      await user.clear(githubInput)
      await user.type(githubInput, 'https://github.com/johnsmith')

      await user.clear(portfolioInput)
      await user.type(portfolioInput, 'https://johnsmith.dev')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            linkedinUrl: 'https://linkedin.com/in/johnsmith',
            githubUrl: 'https://github.com/johnsmith',
            portfolioUrl: 'https://johnsmith.dev',
          })
        )
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    })

    it('should handle partial profile updates', async () => {
      const user = userEvent.setup()

      render(<MockProfilePage />)

      // Only update name and leave other fields unchanged
      const nameInput = screen.getByLabelText('Name')
      await user.clear(nameInput)
      await user.type(nameInput, 'John Smith Jr.')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith({
          id: 'user-123',
          name: 'John Smith Jr.',
          email: 'john@example.com', // Original email preserved
          bio: 'Software developer and learner', // Original bio preserved
          currentJob: 'Junior Developer',
          currentCompany: 'Tech Startup',
          linkedinUrl: 'https://linkedin.com/in/johndoe',
          githubUrl: 'https://github.com/johndoe',
          portfolioUrl: 'https://johndoe.dev',
        })
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    })

    it('should handle empty optional fields', async () => {
      const user = userEvent.setup()

      render(<MockProfilePage />)

      // Clear optional fields
      const bioInput = screen.getByLabelText('Bio')
      const jobInput = screen.getByLabelText('Current Job')
      const companyInput = screen.getByLabelText('Current Company')
      const linkedinInput = screen.getByLabelText('LinkedIn URL')

      await user.clear(bioInput)
      await user.clear(jobInput)
      await user.clear(companyInput)
      await user.clear(linkedinInput)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalledWith(
          expect.objectContaining({
            bio: '',
            currentJob: '',
            currentCompany: '',
            linkedinUrl: '',
          })
        )
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    })
  })

  describe('Error handling', () => {
    it('should handle server errors gracefully', async () => {
      vi.mocked(updateUser).mockResolvedValue({
        success: false,
        error: 'A user with this email already exists'
      })

      const user = userEvent.setup()
      render(<MockProfilePage />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('A user with this email already exists', { id: 'update-profile' })
      })
    })

    it('should handle validation errors from server action', async () => {
      vi.mocked(updateUser).mockResolvedValue({
        success: false,
        error: [{ path: ['email'], message: 'Invalid email address', code: 'invalid_string', validation: 'email' }]
      })

      const user = userEvent.setup()
      render(<MockProfilePage />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith([
          { path: ['email'], message: 'Invalid email address' },
          { path: ['name'], message: 'Name is required' }
        ], { id: 'update-profile' })
      })
    })

    it('should handle network errors', async () => {
      vi.mocked(updateUser).mockRejectedValue(new Error('Network error'))

      const user = userEvent.setup()
      render(<MockProfilePage />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('An unexpected error occurred', { id: 'update-profile' })
      })
    })

    it('should handle generic error responses', async () => {
      vi.mocked(updateUser).mockResolvedValue({
        success: false,
        error: "undefined" // No specific error message
      })

      const user = userEvent.setup()
      render(<MockProfilePage />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      await waitFor(() => {
        expect(updateUser).toHaveBeenCalled()
      })

      await waitFor(() => {
        expect(toast.error).toHaveBeenCalledWith('Failed to update profile', { id: 'update-profile' })
      })
    })
  })

  describe('Form validation', () => {
    it('should require name field', async () => {
      const user = userEvent.setup()
      render(<MockProfilePage />)

      const nameInput = screen.getByLabelText('Name')
      await user.clear(nameInput)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      // HTML5 validation should prevent submission
      expect(updateUser).not.toHaveBeenCalled()
    })

    it('should require email field', async () => {
      const user = userEvent.setup()
      render(<MockProfilePage />)

      const emailInput = screen.getByLabelText('Email')
      await user.clear(emailInput)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      // HTML5 validation should prevent submission
      expect(updateUser).not.toHaveBeenCalled()
    })

    it('should validate email format', async () => {
      const user = userEvent.setup()
      render(<MockProfilePage />)

      const emailInput = screen.getByLabelText('Email')
      await user.clear(emailInput)
      await user.type(emailInput, 'invalid-email')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      // HTML5 validation should prevent submission for invalid email
      expect(updateUser).not.toHaveBeenCalled()
    })

    it('should validate URL formats for social media fields', async () => {
      const user = userEvent.setup()
      render(<MockProfilePage />)

      const linkedinInput = screen.getByLabelText('LinkedIn URL')
      await user.clear(linkedinInput)
      await user.type(linkedinInput, 'not-a-url')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      // HTML5 validation should prevent submission for invalid URL
      expect(updateUser).not.toHaveBeenCalled()
    })
  })

  describe('User experience', () => {
    it('should show loading state during update', async () => {
      // Mock slow response to test loading state
      vi.mocked(updateUser).mockImplementation(() =>
        new Promise(resolve =>
          setTimeout(() => resolve({ success: true, data: mockUpdatedUser as any }), 100)
        )
      )

      const user = userEvent.setup()
      render(<MockProfilePage />)

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      // Loading toast should be shown immediately
      expect(toast.loading).toHaveBeenCalledWith('Updating profile...', { id: 'update-profile' })

      // Wait for completion
      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      }, { timeout: 200 })
    })

    it('should maintain form state during submission', async () => {
      const user = userEvent.setup()
      render(<MockProfilePage />)

      const nameInput = screen.getByLabelText('Name')
      await user.clear(nameInput)
      await user.type(nameInput, 'John Smith')

      const submitButton = screen.getByTestId('submit-button')
      await user.click(submitButton)

      // Form should maintain entered values during submission
      expect(nameInput).toHaveValue('John Smith')

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalled()
      })
    })
  })
})