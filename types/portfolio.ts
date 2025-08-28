import type { 
  ProjectProfile, 
  ProjectShowcase, 
  Skill, 
  ProjectSkill, 
  Experience, 
  ProjectComment, 
  ProjectLike, 
  ProjectCollaborator, 
  User,
  ProjectStatus,
  SkillLevel,
  ExperienceType
} from '@prisma/client'

// Extended types for project data with relations
export type ProjectProfileWithDetails = ProjectProfile & {
  user: Pick<User, 'id' | 'name' | 'email' | 'avatar' | 'githubUrl' | 'linkedinUrl'>
  projects: ProjectShowcaseWithStats[]
  skills: (ProjectSkill & {
    skill: Skill
  })[]
  experiences: Experience[]
  _count: {
    projects: number
  }
}

export type ProjectShowcaseWithStats = ProjectShowcase & {
  projectProfile: ProjectProfile & {
    user: Pick<User, 'id' | 'name' | 'avatar'>
  }
  _count: {
    comments: number
    projectLikes: number
    collaborators: number
  }
}

export type ProjectShowcaseWithDetails = ProjectShowcase & {
  projectProfile: ProjectProfile & {
    user: Pick<User, 'id' | 'name' | 'avatar' | 'githubUrl' | 'linkedinUrl'>
  }
  comments: (ProjectComment & {
    author: Pick<User, 'id' | 'name' | 'avatar'>
    replies?: (ProjectComment & {
      author: Pick<User, 'id' | 'name' | 'avatar'>
    })[]
  })[]
  projectLikes: (ProjectLike & {
    user: Pick<User, 'id' | 'name' | 'avatar'>
  })[]
  collaborators: (ProjectCollaborator & {
    user: Pick<User, 'id' | 'name' | 'avatar'>
  })[]
  _count: {
    comments: number
    projectLikes: number
    collaborators: number
  }
}

export type StudentProfile = Pick<User, 
  'id' | 'name' | 'email' | 'avatar' | 'bio' | 'location' | 'githubUrl' | 
  'linkedinUrl' | 'portfolioUrl' | 'currentJob' | 'currentCompany' | 
  'expertise' | 'yearsExp' | 'status' | 'createdAt'
> & {
  projectProfile?: ProjectProfileWithDetails
  _count: {
    posts: number
    comments: number
    projectLikes: number
  }
}

// Form types for creating/editing
export type CreateProjectProfileData = {
  bio?: string
  headline?: string
  location?: string
  website?: string
  resume?: string
  theme?: string
  isPublic?: boolean
}

export type CreateProjectData = {
  title: string
  description: string
  summary?: any // Plate.js editor content (Value type)
  shortDesc?: string
  images?: string[]
  demoUrl?: string
  githubUrl?: string
  techStack: string[]
  features?: string[]
  challenges?: string
  solutions?: string
  status?: ProjectStatus
  startDate?: Date
  endDate?: Date
  isPublic?: boolean
  // GitHub import metadata (optional)
  githubImportData?: {
    importedAt: Date
    stars: number
    forks: number
    size: number
    language?: string
    topics?: string[]
    lastUpdated: Date
  }
}

export type AddSkillData = {
  skillId: string
  proficiency: SkillLevel
  yearsExp?: number
  isHighlight?: boolean
}

export type AddExperienceData = {
  type: ExperienceType
  title: string
  company: string
  location?: string
  description?: string
  startDate: Date
  endDate?: Date
  isCurrent?: boolean
}

// Filter and search types
export type ProjectFilter = {
  techStack?: string[]
  status?: ProjectStatus[]
  featured?: boolean
  search?: string
}

export type StudentFilter = {
  skills?: string[]
  location?: string
  experience?: number // minimum years
  availability?: boolean
  search?: string
}

// Stats types
export type ProjectProfileStats = {
  totalViews: number
  totalLikes: number
  totalComments: number
  featuredProjects: number
  skillsCount: number
  experienceYears?: number
}

export type PlatformStats = {
  totalStudents: number
  totalProjects: number
  totalSkills: number
  featuredProjects: number
  activeStudents: number
  newThisMonth: number
}

// Constants
export const PROJECT_STATUSES = [
  { value: 'PLANNING', label: 'Planning', color: 'blue' },
  { value: 'IN_PROGRESS', label: 'In Progress', color: 'yellow' },
  { value: 'COMPLETED', label: 'Completed', color: 'green' },
  { value: 'PAUSED', label: 'Paused', color: 'orange' },
  { value: 'ARCHIVED', label: 'Archived', color: 'gray' },
] as const

export const SKILL_LEVELS = [
  { value: 'BEGINNER', label: 'Beginner', color: 'blue' },
  { value: 'INTERMEDIATE', label: 'Intermediate', color: 'green' },
  { value: 'ADVANCED', label: 'Advanced', color: 'orange' },
  { value: 'EXPERT', label: 'Expert', color: 'red' },
] as const

export const EXPERIENCE_TYPES = [
  { value: 'WORK', label: 'Work Experience', icon: 'briefcase' },
  { value: 'EDUCATION', label: 'Education', icon: 'graduation-cap' },
  { value: 'VOLUNTEER', label: 'Volunteer Work', icon: 'heart' },
  { value: 'PROJECT', label: 'Personal Project', icon: 'code' },
  { value: 'INTERNSHIP', label: 'Internship', icon: 'user-check' },
] as const

export const SKILL_CATEGORIES = [
  'Frontend',
  'Backend', 
  'Mobile',
  'Database',
  'DevOps',
  'Cloud',
  'Testing',
  'Design',
  'Data Science',
  'Machine Learning',
  'Tools',
  'Other'
] as const

export const PROJECT_THEMES = [
  { value: 'default', label: 'Default', preview: '/themes/default.jpg' },
  { value: 'minimal', label: 'Minimal', preview: '/themes/minimal.jpg' },
  { value: 'dark', label: 'Dark', preview: '/themes/dark.jpg' },
  { value: 'creative', label: 'Creative', preview: '/themes/creative.jpg' },
  { value: 'professional', label: 'Professional', preview: '/themes/professional.jpg' },
] as const

// Project Summary Templates
export const PROJECT_SUMMARY_TEMPLATES = [
  {
    id: 'blank',
    name: 'Blank Template',
    description: 'Start with a clean slate',
    icon: 'file-text',
    content: [
      {
        type: 'p',
        children: [{ text: 'Tell your project story...' }],
      },
    ]
  },
  {
    id: 'tech-project',
    name: 'Tech Project',
    description: 'For web apps, mobile apps, and software projects',
    icon: 'code',
    content: [
      {
        type: 'h2',
        children: [{ text: '🚀 Project Overview' }],
      },
      {
        type: 'p',
        children: [{ text: 'Brief description of what the project does and why it exists.' }],
      },
      {
        type: 'h2',
        children: [{ text: '🛠️ Tech Stack' }],
      },
      {
        type: 'p',
        children: [{ text: 'List the main technologies, frameworks, and tools used.' }],
      },
      {
        type: 'h2',
        children: [{ text: '✨ Key Features' }],
      },
      {
        type: 'ul',
        children: [
          {
            type: 'li',
            children: [{ text: 'Feature 1' }],
          },
          {
            type: 'li', 
            children: [{ text: 'Feature 2' }],
          },
        ],
      },
      {
        type: 'h2',
        children: [{ text: '🎯 Challenges & Solutions' }],
      },
      {
        type: 'p',
        children: [{ text: 'Describe the main challenges faced and how you solved them.' }],
      },
      {
        type: 'h2',
        children: [{ text: '📈 Results & Impact' }],
      },
      {
        type: 'p',
        children: [{ text: 'What did you achieve? Any metrics, user feedback, or lessons learned?' }],
      },
    ]
  },
  {
    id: 'creative-project',
    name: 'Creative Project', 
    description: 'For design, art, and creative work',
    icon: 'palette',
    content: [
      {
        type: 'h2',
        children: [{ text: '💡 Inspiration' }],
      },
      {
        type: 'p',
        children: [{ text: 'What inspired this project? What was your creative vision?' }],
      },
      {
        type: 'h2',
        children: [{ text: '🎨 Creative Process' }],
      },
      {
        type: 'p',
        children: [{ text: 'Walk through your creative process and methodology.' }],
      },
      {
        type: 'h2',
        children: [{ text: '🧩 Challenges' }],
      },
      {
        type: 'p',
        children: [{ text: 'What creative or technical challenges did you face?' }],
      },
      {
        type: 'h2',
        children: [{ text: '🏆 Final Outcome' }],
      },
      {
        type: 'p',
        children: [{ text: 'Present the final result and what you learned.' }],
      },
    ]
  },
  {
    id: 'research-project',
    name: 'Research Project',
    description: 'For academic, data analysis, and research work',
    icon: 'search',
    content: [
      {
        type: 'h2',
        children: [{ text: '❓ Research Question' }],
      },
      {
        type: 'p',
        children: [{ text: 'What question were you trying to answer?' }],
      },
      {
        type: 'h2',
        children: [{ text: '🔬 Methodology' }],
      },
      {
        type: 'p',
        children: [{ text: 'Describe your research approach and methods used.' }],
      },
      {
        type: 'h2',
        children: [{ text: '📊 Key Findings' }],
      },
      {
        type: 'p',
        children: [{ text: 'What did you discover? Include data, charts, or key insights.' }],
      },
      {
        type: 'h2',
        children: [{ text: '💫 Impact & Applications' }],
      },
      {
        type: 'p',
        children: [{ text: 'How can these findings be applied? What\'s the broader impact?' }],
      },
    ]
  },
] as const

export type ProjectSummaryTemplate = (typeof PROJECT_SUMMARY_TEMPLATES)[number]

// GitHub import types
export type ProjectCreationMode = 'manual' | 'github-import'

export type GitHubImportPreview = {
  title: string
  description: string
  shortDesc?: string
  githubUrl: string
  demoUrl?: string
  techStack: string[]
  features?: string[]
  stars: number
  forks: number
  size: number
  language?: string
  topics?: string[]
  lastUpdated: Date
  isPrivate: boolean
  isArchived: boolean
  hasReadme: boolean
  readmeSummary?: any // Plate.js format
}

export type GitHubImportOptions = {
  importTitle: boolean
  importDescription: boolean
  importTechStack: boolean
  importFeatures: boolean
  importDemoUrl: boolean
  importReadmeSummary: boolean
}