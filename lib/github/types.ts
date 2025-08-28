/**
 * GitHub API types and interfaces for repository import functionality
 */

export type GitHubRepository = {
  id: number
  name: string
  full_name: string
  description: string | null
  html_url: string
  clone_url: string
  homepage: string | null
  language: string | null
  languages_url: string
  topics: string[]
  created_at: string
  updated_at: string
  pushed_at: string
  size: number
  stargazers_count: number
  watchers_count: number
  forks_count: number
  open_issues_count: number
  default_branch: string
  private: boolean
  archived: boolean
  disabled: boolean
  owner: {
    login: string
    avatar_url: string
    html_url: string
  }
}

export type GitHubLanguages = {
  [language: string]: number
}

export type GitHubFileContent = {
  name: string
  path: string
  sha: string
  size: number
  url: string
  html_url: string
  git_url: string
  download_url: string
  type: 'file' | 'dir'
  content?: string
  encoding?: string
}

export type GitHubTreeItem = {
  path: string
  mode: string
  type: 'blob' | 'tree'
  sha: string
  size?: number
  url: string
}

export type GitHubTree = {
  sha: string
  url: string
  tree: GitHubTreeItem[]
  truncated: boolean
}

export type PackageJsonData = {
  name?: string
  description?: string
  version?: string
  keywords?: string[]
  dependencies?: Record<string, string>
  devDependencies?: Record<string, string>
  scripts?: Record<string, string>
  main?: string
  type?: string
  engines?: Record<string, string>
  repository?: {
    type: string
    url: string
  }
  author?: string | {
    name: string
    email?: string
    url?: string
  }
  license?: string
}

export type ImportableProjectData = {
  title: string
  description: string
  shortDesc?: string
  githubUrl: string
  demoUrl?: string
  techStack: string[]
  features?: string[]
  language?: string
  languages?: GitHubLanguages
  topics?: string[]
  readme?: string
  readmeSummary?: any // Plate.js format converted from README
  packageJson?: PackageJsonData
  createdAt: Date
  lastUpdated: Date
  stars: number
  forks: number
  size: number
  isPrivate: boolean
  isArchived: boolean
}

export type GitHubImportError = {
  type: 'INVALID_URL' | 'REPOSITORY_NOT_FOUND' | 'PRIVATE_REPOSITORY' | 'API_RATE_LIMIT' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR'
  message: string
  details?: string
}

export type GitHubImportResult = {
  success: true
  data: ImportableProjectData
} | {
  success: false
  error: GitHubImportError
}

export type TechStackDetectionResult = {
  technologies: string[]
  frameworks: string[]
  languages: string[]
  tools: string[]
  confidence: number // 0-1 score
}