'use client'

import { Search, Grid, List } from 'lucide-react'
import { useState, useMemo } from 'react'
import type { ProjectStatus } from '@prisma/client'

import { Grid as LayoutGrid, Section } from '@/components/layout'
import { ProjectCard } from '@/components/projects/project-card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { PROJECT_STATUSES, SKILL_CATEGORIES, type ProjectShowcaseWithStats } from '@/types/portfolio'
import { Filter } from 'lucide-react'

interface ProjectsClientProps {
  initialProjects: ProjectShowcaseWithStats[]
}

export function ProjectsClient({ initialProjects }: ProjectsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTech, setSelectedTech] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<ProjectStatus[]>([])
  const [showFeaturedOnly, setShowFeaturedOnly] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  const filteredProjects = useMemo(() => {
    return initialProjects.filter((project) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch = 
          project.title.toLowerCase().includes(query) ||
          project.description?.toLowerCase().includes(query) ||
          project.shortDesc?.toLowerCase().includes(query)
        
        if (!matchesSearch) return false
      }

      // Tech stack filter
      if (selectedTech.length > 0) {
        const projectTech = project.techStack as string[]
        const hasMatchingTech = selectedTech.some(tech => 
          projectTech.some(pt => pt.toLowerCase().includes(tech.toLowerCase()))
        )
        if (!hasMatchingTech) return false
      }

      // Status filter
      if (selectedStatus.length > 0) {
        if (!selectedStatus.includes(project.status)) return false
      }

      // Featured filter
      if (showFeaturedOnly && !project.isFeatured) return false

      return true
    })
  }, [initialProjects, searchQuery, selectedTech, selectedStatus, showFeaturedOnly])

  const clearAllFilters = () => {
    setSearchQuery('')
    setSelectedTech([])
    setSelectedStatus([])
    setShowFeaturedOnly(false)
  }

  const hasActiveFilters = searchQuery || selectedTech.length > 0 || selectedStatus.length > 0 || showFeaturedOnly
  const activeFilterCount = selectedTech.length + selectedStatus.length + (showFeaturedOnly ? 1 : 0)

  return (
    <>
      <Section>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search projects..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* Filter Popover */}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="relative">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="end">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Filters</h4>
                    {hasActiveFilters && (
                      <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                        Clear All
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {/* Featured Projects */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Featured</h5>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="featured"
                        checked={showFeaturedOnly}
                        onCheckedChange={(checked) => setShowFeaturedOnly(!!checked)}
                      />
                      <label htmlFor="featured" className="text-sm">
                        Show only featured projects
                      </label>
                    </div>
                  </div>

                  <Separator />

                  {/* Project Status */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Status</h5>
                    <div className="grid grid-cols-2 gap-2">
                      {PROJECT_STATUSES.map((status) => (
                        <div key={status.value} className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status.value}`}
                            checked={selectedStatus.includes(status.value)}
                            onCheckedChange={(checked) => {
                              const newStatus = checked
                                ? [...selectedStatus, status.value]
                                : selectedStatus.filter(s => s !== status.value)
                              setSelectedStatus(newStatus)
                            }}
                          />
                          <label htmlFor={`status-${status.value}`} className="text-sm">
                            {status.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Technology Categories */}
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium">Technology</h5>
                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
                      {SKILL_CATEGORIES.map((category) => (
                        <div key={category} className="flex items-center space-x-2">
                          <Checkbox
                            id={`tech-${category}`}
                            checked={selectedTech.includes(category)}
                            onCheckedChange={(checked) => {
                              const newTech = checked
                                ? [...selectedTech, category]
                                : selectedTech.filter(t => t !== category)
                              setSelectedTech(newTech)
                            }}
                          />
                          <label htmlFor={`tech-${category}`} className="text-sm">
                            {category}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className="flex items-center rounded-md border p-1">
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <Grid className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mt-4">
            {searchQuery && (
              <Badge variant="secondary" className="gap-1">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery('')}
                  className="ml-1 text-xs hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedTech.map((tech) => (
              <Badge key={tech} variant="secondary" className="gap-1">
                {tech}
                <button
                  onClick={() => setSelectedTech(prev => prev.filter(t => t !== tech))}
                  className="ml-1 text-xs hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            {selectedStatus.map((status) => (
              <Badge key={status} variant="secondary" className="gap-1">
                {PROJECT_STATUSES.find(s => s.value === status)?.label || status}
                <button
                  onClick={() => setSelectedStatus(prev => prev.filter(s => s !== status))}
                  className="ml-1 text-xs hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            ))}
            {showFeaturedOnly && (
              <Badge variant="secondary" className="gap-1">
                Featured Only
                <button
                  onClick={() => setShowFeaturedOnly(false)}
                  className="ml-1 text-xs hover:text-destructive"
                >
                  ×
                </button>
              </Badge>
            )}
          </div>
        )}
      </Section>

      <Section>
        {filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground text-lg mb-4">No projects found</div>
            <p className="text-muted-foreground">
              {hasActiveFilters
                ? "Try adjusting your filters to see more results"
                : "Be the first to share a project with the community!"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters} className="mt-4">
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className="mb-4 text-sm text-muted-foreground">
              Showing {filteredProjects.length} of {initialProjects.length} projects
            </div>
            <LayoutGrid cols="3">
              {filteredProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </LayoutGrid>
          </>
        )}
      </Section>
    </>
  )
}