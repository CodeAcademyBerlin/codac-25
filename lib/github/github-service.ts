import { Octokit } from '@octokit/rest'

import { logger } from '@/lib/logger'

import type {
  GitHubRepository,
  GitHubLanguages,
  GitHubFileContent,
  ImportableProjectData,
  GitHubImportResult,
  GitHubImportError,
  PackageJsonData,
  TechStackDetectionResult
} from './types'

/**
 * GitHub service for fetching repository data
 */
class GitHubService {
  private octokit: Octokit

  constructor(authToken?: string) {
    this.octokit = new Octokit({
      auth: authToken,
      userAgent: 'CODAC-Platform/1.0.0',
    })
  }

  /**
   * Parse GitHub URL to extract owner and repo
   */
  private parseGitHubUrl(url: string): { owner: string; repo: string } | null {
    try {
      // Handle various GitHub URL formats
      const patterns = [
        /https?:\/\/github\.com\/([^\/]+)\/([^\/]+)(?:\/|\.git)?(?:\?.*)?(?:#.*)?$/,
        /git@github\.com:([^\/]+)\/([^\/]+)\.git$/,
        /https?:\/\/www\.github\.com\/([^\/]+)\/([^\/]+)(?:\/|\.git)?(?:\?.*)?(?:#.*)?$/
      ]

      for (const pattern of patterns) {
        const match = url.match(pattern)
        if (match) {
          return {
            owner: match[1],
            repo: match[2]
          }
        }
      }

      return null
    } catch (error) {
      logger.warn('Failed to parse GitHub URL', {
        action: 'parse_github_url',
        metadata: { url, error: error instanceof Error ? error.message : String(error) }
      })
      return null
    }
  }

  /**
   * Fetch repository basic information
   */
  private async fetchRepository(owner: string, repo: string): Promise<GitHubRepository> {
    try {
      const { data } = await this.octokit.rest.repos.get({
        owner,
        repo
      })

      return data as GitHubRepository
    } catch (error: unknown) {
      const err = error as { status?: number; message?: string }
      if (err.status === 404) {
        throw new Error('Repository not found')
      } else if (err.status === 403) {
        throw new Error('API rate limit exceeded or repository is private')
      } else {
        throw new Error(`GitHub API error: ${err.message || 'Unknown error'}`)
      }
    }
  }

  /**
   * Fetch repository languages
   */
  private async fetchLanguages(owner: string, repo: string): Promise<GitHubLanguages> {
    try {
      const { data } = await this.octokit.rest.repos.listLanguages({
        owner,
        repo
      })

      return data
    } catch (error) {
      logger.warn('Failed to fetch repository languages', {
        action: 'fetch_languages',
        metadata: { owner, repo, error: error instanceof Error ? error.message : String(error) }
      })
      return {}
    }
  }

  /**
   * Fetch file content from repository
   */
  private async fetchFileContent(owner: string, repo: string, path: string): Promise<string | null> {
    try {
      const { data } = await this.octokit.rest.repos.getContent({
        owner,
        repo,
        path
      }) as { data: GitHubFileContent }

      if (data.type === 'file' && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8')
      }

      return null
    } catch {
      logger.debug('File not found or could not be fetched', {
        action: 'fetch_file_content',
        metadata: { owner, repo, path }
      })
      return null
    }
  }

  /**
   * Parse package.json content
   */
  private parsePackageJson(content: string): PackageJsonData | null {
    try {
      return JSON.parse(content) as PackageJsonData
    } catch (error) {
      logger.warn('Failed to parse package.json', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      })
      return null
    }
  }

  /**
   * Detect tech stack from repository languages and files
   */
  private async detectTechStack(
    owner: string,
    repo: string,
    languages: GitHubLanguages,
    packageJson?: PackageJsonData
  ): Promise<TechStackDetectionResult> {
    const technologies: Set<string> = new Set()
    const frameworks: Set<string> = new Set()
    const languageSet: Set<string> = new Set()
    const tools: Set<string> = new Set()

    // Add languages from GitHub API
    Object.keys(languages).forEach(lang => {
      languageSet.add(lang)
      
      // Map language to common technologies
      switch (lang.toLowerCase()) {
        case 'javascript':
          technologies.add('JavaScript')
          break
        case 'typescript':
          technologies.add('TypeScript')
          break
        case 'python':
          technologies.add('Python')
          break
        case 'java':
          technologies.add('Java')
          break
        case 'c++':
          technologies.add('C++')
          break
        case 'c#':
          technologies.add('C#')
          break
        case 'go':
          technologies.add('Go')
          break
        case 'rust':
          technologies.add('Rust')
          break
        case 'swift':
          technologies.add('Swift')
          break
        case 'kotlin':
          technologies.add('Kotlin')
          break
        case 'php':
          technologies.add('PHP')
          break
        case 'ruby':
          technologies.add('Ruby')
          break
      }
    })

    // Analyze package.json for Node.js/JavaScript projects
    if (packageJson) {
      const deps = { ...packageJson.dependencies, ...packageJson.devDependencies }
      
      // Common frameworks and libraries
      const frameworkMap: Record<string, string[]> = {
        'react': ['React'],
        'vue': ['Vue.js'],
        'angular': ['Angular'],
        'svelte': ['Svelte'],
        'next': ['Next.js'],
        'nuxt': ['Nuxt.js'],
        'gatsby': ['Gatsby'],
        'express': ['Express.js'],
        'fastify': ['Fastify'],
        'koa': ['Koa.js'],
        'nestjs': ['NestJS'],
        'electron': ['Electron'],
        'react-native': ['React Native'],
        'expo': ['Expo'],
        'vite': ['Vite'],
        'webpack': ['Webpack'],
        'rollup': ['Rollup'],
        'parcel': ['Parcel'],
        'jest': ['Jest'],
        'cypress': ['Cypress'],
        'playwright': ['Playwright'],
        'prisma': ['Prisma'],
        'sequelize': ['Sequelize'],
        'mongoose': ['Mongoose'],
        'typeorm': ['TypeORM'],
        'graphql': ['GraphQL'],
        'apollo': ['Apollo GraphQL'],
        'relay': ['Relay'],
        'styled-components': ['Styled Components'],
        'emotion': ['Emotion'],
        'tailwindcss': ['Tailwind CSS'],
        'bootstrap': ['Bootstrap'],
        'material-ui': ['Material-UI'],
        'ant-design': ['Ant Design'],
        'chakra-ui': ['Chakra UI']
      }

      Object.keys(deps).forEach(dep => {
        Object.entries(frameworkMap).forEach(([key, values]) => {
          if (dep.includes(key)) {
            values.forEach(value => {
              if (key.endsWith('ui') || key.includes('css') || key === 'styled-components' || key === 'emotion') {
                frameworks.add(value)
              } else if (key === 'jest' || key === 'cypress' || key === 'playwright') {
                tools.add(value)
              } else {
                frameworks.add(value)
              }
            })
          }
        })
      })

      // Add Node.js for server-side projects
      if (packageJson.scripts?.start || packageJson.main || Object.keys(deps).some(dep => 
        ['express', 'koa', 'fastify', 'nestjs'].some(server => dep.includes(server))
      )) {
        technologies.add('Node.js')
      }
    }

    // Check for common config files to detect technologies
    const configFiles = [
      { path: 'Dockerfile', tech: 'Docker' },
      { path: 'docker-compose.yml', tech: 'Docker Compose' },
      { path: 'requirements.txt', tech: 'Python' },
      { path: 'Pipfile', tech: 'Python' },
      { path: 'pom.xml', tech: 'Maven' },
      { path: 'build.gradle', tech: 'Gradle' },
      { path: 'Cargo.toml', tech: 'Rust' },
      { path: 'go.mod', tech: 'Go' },
      { path: 'composer.json', tech: 'Composer' },
      { path: 'Gemfile', tech: 'Ruby' },
      { path: '.nvmrc', tech: 'Node.js' },
      { path: 'terraform.tf', tech: 'Terraform' },
      { path: 'Makefile', tech: 'Make' },
    ]

    // Note: In production, you might want to batch these requests or use the Git Trees API
    for (const { path, tech } of configFiles.slice(0, 5)) { // Limit to avoid rate limits
      const exists = await this.fetchFileContent(owner, repo, path)
      if (exists !== null) {
        tools.add(tech)
      }
    }

    const allTechs = [
      ...Array.from(technologies),
      ...Array.from(frameworks),
      ...Array.from(languageSet),
      ...Array.from(tools)
    ]

    return {
      technologies: Array.from(technologies),
      frameworks: Array.from(frameworks),
      languages: Array.from(languageSet),
      tools: Array.from(tools),
      confidence: allTechs.length > 0 ? Math.min(allTechs.length / 10, 1) : 0
    }
  }

  /**
   * Convert README markdown to Plate.js format for project summary
   */
  private convertReadmeToPlateFormat(readme: string): any[] {
    try {
      // Basic markdown to Plate.js conversion
      const lines = readme.split('\n')
      const plateElements: any[] = []
      let currentList: any = null
      let inCodeBlock = false
      let codeBlockLanguage = ''
      let codeBlockLines: string[] = []

      for (const line of lines) {
        const trimmedLine = line.trim()

        // Handle code blocks
        if (trimmedLine.startsWith('```')) {
          if (!inCodeBlock) {
            // Start code block
            inCodeBlock = true
            codeBlockLanguage = trimmedLine.slice(3) || 'text'
            codeBlockLines = []
          } else {
            // End code block
            inCodeBlock = false
            if (codeBlockLines.length > 0) {
              plateElements.push({
                type: 'code_block',
                lang: codeBlockLanguage,
                children: [{ text: codeBlockLines.join('\n') }]
              })
            }
            codeBlockLines = []
          }
          continue
        }

        if (inCodeBlock) {
          codeBlockLines.push(line)
          continue
        }

        // Handle headings
        if (trimmedLine.startsWith('#')) {
          if (currentList) {
            plateElements.push(currentList)
            currentList = null
          }
          
          const level = Math.min(trimmedLine.match(/^#+/)?.[0].length || 1, 6)
          const text = trimmedLine.replace(/^#+\s*/, '')
          
          if (text) {
            plateElements.push({
              type: `h${level}`,
              children: [{ text }]
            })
          }
          continue
        }

        // Handle bullet lists
        if (trimmedLine.match(/^[-*+]\s/)) {
          const text = trimmedLine.replace(/^[-*+]\s*/, '')
          
          if (!currentList) {
            currentList = {
              type: 'ul',
              children: []
            }
          }
          
          currentList.children.push({
            type: 'li',
            children: [{ text }]
          })
          continue
        }

        // Handle numbered lists
        if (trimmedLine.match(/^\d+\.\s/)) {
          const text = trimmedLine.replace(/^\d+\.\s*/, '')
          
          if (!currentList || currentList.type !== 'ol') {
            if (currentList) {
              plateElements.push(currentList)
            }
            currentList = {
              type: 'ol',
              children: []
            }
          }
          
          currentList.children.push({
            type: 'li',
            children: [{ text }]
          })
          continue
        }

        // Handle regular paragraphs
        if (trimmedLine) {
          if (currentList) {
            plateElements.push(currentList)
            currentList = null
          }
          
          // Simple inline formatting
          let text = trimmedLine
          const elements: any[] = []
          
          // Handle bold text **text**
          text = text.replace(/\*\*(.*?)\*\*/g, (_, content) => {
            elements.push({ text: content, bold: true })
            return '{{BOLD}}'
          })
          
          // Handle italic text *text*
          text = text.replace(/\*(.*?)\*/g, (_, content) => {
            elements.push({ text: content, italic: true })
            return '{{ITALIC}}'
          })
          
          // Handle inline code `code`
          text = text.replace(/`(.*?)`/g, (_, content) => {
            elements.push({ text: content, code: true })
            return '{{CODE}}'
          })

          // Handle links [text](url)
          text = text.replace(/\[([^\]]*)\]\(([^)]*)\)/g, (_, linkText, url) => {
            elements.push({ text: linkText, url })
            return '{{LINK}}'
          })
          
          if (elements.length > 0) {
            // Complex formatting - need to rebuild text with formatted elements
            const children: any[] = []
            const parts = text.split(/{{(BOLD|ITALIC|CODE|LINK)}}/)
            let elementIndex = 0
            
            for (let i = 0; i < parts.length; i++) {
              if (parts[i] && !parts[i].match(/^(BOLD|ITALIC|CODE|LINK)$/)) {
                children.push({ text: parts[i] })
              } else if (parts[i]?.match(/^(BOLD|ITALIC|CODE|LINK)$/)) {
                if (elementIndex < elements.length) {
                  children.push(elements[elementIndex])
                  elementIndex++
                }
              }
            }
            
            plateElements.push({
              type: 'p',
              children: children.length > 0 ? children : [{ text: trimmedLine }]
            })
          } else {
            plateElements.push({
              type: 'p',
              children: [{ text: trimmedLine }]
            })
          }
        }
      }

      // Add any remaining list
      if (currentList) {
        plateElements.push(currentList)
      }

      // If we have elements, return them, otherwise return a default
      return plateElements.length > 0 ? plateElements : [
        {
          type: 'p',
          children: [{ text: 'Project documentation imported from README.' }]
        }
      ]
    } catch (error) {
      logger.warn('Failed to convert README to Plate format', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      })
      
      // Fallback: return README as plain text
      return [
        {
          type: 'p',
          children: [{ text: readme.substring(0, 1000) + (readme.length > 1000 ? '...' : '') }]
        }
      ]
    }
  }

  /**
   * Generate project features from README content
   */
  private extractFeaturesFromReadme(readme: string): string[] {
    const features: string[] = []
    
    try {
      // Look for common feature section headers
      const featureHeaders = /(?:^|\n)#+\s*(?:Features?|What it does|Functionality|Capabilities)[\s\S]*?(?=\n#+|\n\n|$)/gi
      const matches = readme.match(featureHeaders)
      
      if (matches) {
        matches.forEach(match => {
          // Extract bullet points or numbered lists
          const listItems = match.match(/^\s*[-*•]\s+(.+)$/gm) || match.match(/^\s*\d+\.\s+(.+)$/gm)
          
          if (listItems) {
            listItems.forEach(item => {
              const feature = item.replace(/^\s*[-*•\d.]\s+/, '').trim()
              if (feature && feature.length < 100) {
                features.push(feature)
              }
            })
          }
        })
      }
    } catch (error) {
      logger.warn('Failed to extract features from README', {
        metadata: { error: error instanceof Error ? error.message : String(error) }
      })
    }

    return features.slice(0, 10) // Limit to 10 features
  }

  /**
   * Import repository data
   */
  async importRepository(url: string): Promise<GitHubImportResult> {
    try {
      // Parse GitHub URL
      const parsed = this.parseGitHubUrl(url)
      if (!parsed) {
        return {
          success: false,
          error: {
            type: 'INVALID_URL',
            message: 'Invalid GitHub URL format',
            details: 'Please provide a valid GitHub repository URL'
          }
        }
      }

      const { owner, repo } = parsed

      // Fetch basic repository information
      const repository = await this.fetchRepository(owner, repo)

      // Fetch additional data in parallel
      const [languages, readmeContent, packageJsonContent] = await Promise.all([
        this.fetchLanguages(owner, repo),
        this.fetchFileContent(owner, repo, 'README.md'),
        this.fetchFileContent(owner, repo, 'package.json')
      ])

      const packageJson = packageJsonContent ? this.parsePackageJson(packageJsonContent) : undefined

      // Detect tech stack
      const techStackResult = await this.detectTechStack(owner, repo, languages, packageJson || undefined)

      // Extract features from README
      const features = readmeContent ? this.extractFeaturesFromReadme(readmeContent) : []

      // Convert README to Plate.js format for summary
      const readmeSummary = readmeContent ? this.convertReadmeToPlateFormat(readmeContent) : undefined

      // Combine all detected technologies
      const allTech = [
        ...techStackResult.technologies,
        ...techStackResult.frameworks,
        ...techStackResult.languages,
        ...techStackResult.tools
      ]

      const projectData: ImportableProjectData = {
        title: repository.name.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
        description: repository.description || `A ${repository.language || 'software'} project`,
        shortDesc: repository.description ? 
          (repository.description.length > 150 ? 
            repository.description.substring(0, 147) + '...' : 
            repository.description
          ) : undefined,
        githubUrl: repository.html_url,
        demoUrl: repository.homepage || undefined,
        techStack: [...new Set(allTech)], // Remove duplicates
        features: features.length > 0 ? features : undefined,
        language: repository.language || undefined,
        languages,
        topics: repository.topics || [],
        readme: readmeContent || undefined,
        readmeSummary,
        packageJson: packageJson || undefined,
        createdAt: new Date(repository.created_at),
        lastUpdated: new Date(repository.updated_at),
        stars: repository.stargazers_count,
        forks: repository.forks_count,
        size: repository.size,
        isPrivate: repository.private,
        isArchived: repository.archived
      }

      logger.info('Successfully imported GitHub repository', {
        action: 'import_repository',
        resource: 'github_repository',
        metadata: {
          owner,
          repo,
          techStack: projectData.techStack,
          features: features.length
        }
      })

      return {
        success: true,
        data: projectData
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      
      logger.error('Failed to import GitHub repository', error instanceof Error ? error : new Error(errorMessage), {
        action: 'import_repository',
        resource: 'github_repository',
        metadata: { url }
      })

      let errorType: GitHubImportError['type'] = 'UNKNOWN_ERROR'
      
      if (errorMessage.includes('not found')) {
        errorType = 'REPOSITORY_NOT_FOUND'
      } else if (errorMessage.includes('private') || errorMessage.includes('rate limit')) {
        errorType = 'API_RATE_LIMIT'
      } else if (errorMessage.includes('network') || errorMessage.includes('ENOTFOUND')) {
        errorType = 'NETWORK_ERROR'
      }

      return {
        success: false,
        error: {
          type: errorType,
          message: errorMessage,
          details: error instanceof Error ? error.stack : undefined
        }
      }
    }
  }
}

// Export a singleton instance
export const githubService = new GitHubService()

// Export the class for testing with custom tokens
export { GitHubService }