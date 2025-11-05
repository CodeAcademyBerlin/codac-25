'use client';

import { ProjectStatus, SkillLevel } from '@prisma/client';
import { Filter, Grid, List, Search } from 'lucide-react';
import { use, useState } from 'react';

import { Grid as LayoutGrid, Section } from '@/components/layout';
import { ProjectCard } from '@/components/projects/project-card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { ProjectDTO } from '@/data/projects/get-projects';
import { useUrlFilters, type FilterState } from '@/lib/utils/url-utils';

interface ProjectsListProps {
  _projectsPromise: Promise<ProjectDTO[]>;
  initialFilters: FilterState;
}

export function ProjectsList({
  _projectsPromise,
  // initialFilters,
}: ProjectsListProps) {
  const { updateFilters, clearAllFilters, getCurrentFilters } = useUrlFilters();
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const projects = use(_projectsPromise);
  // Get current filter state from URL
  const currentFilters = getCurrentFilters();
  const {
    search: searchQuery,
    tech: selectedTech,
    status: selectedStatus,
    featured: showFeaturedOnly,
    view: viewMode,
  } = currentFilters;

  // Projects are already filtered on the server side, so we use them directly
  const filteredProjects = projects;

  const hasActiveFilters =
    searchQuery ||
    selectedTech.length > 0 ||
    selectedStatus.length > 0 ||
    showFeaturedOnly;
  const activeFilterCount =
    selectedTech.length + selectedStatus.length + (showFeaturedOnly ? 1 : 0);

  return (
    <>
      <Section>
        <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
          <div className='flex-1 max-w-md'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder='Search projects...'
                className='pl-10'
                value={searchQuery}
                onChange={e => updateFilters({ search: e.target.value })}
              />
            </div>
          </div>
          <div className='flex items-center gap-2'>
            {/* Filter Popover */}
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant='outline' size='sm' className='relative'>
                  <Filter className='h-4 w-4 mr-2' />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge
                      variant='destructive'
                      className='absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs'
                    >
                      {activeFilterCount}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className='w-80' align='end'>
                <div className='space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium'>Filters</h4>
                    {hasActiveFilters && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={clearAllFilters}
                      >
                        Clear All
                      </Button>
                    )}
                  </div>

                  <Separator />

                  {/* Featured Projects */}
                  <div className='space-y-2'>
                    <h5 className='text-sm font-medium'>Featured</h5>
                    <div className='flex items-center space-x-2'>
                      <Checkbox
                        id='featured'
                        checked={showFeaturedOnly}
                        onCheckedChange={checked =>
                          updateFilters({ featured: !!checked })
                        }
                      />
                      <label htmlFor='featured' className='text-sm'>
                        Show only featured projects
                      </label>
                    </div>
                  </div>

                  <Separator />

                  {/* Project Status */}
                  <div className='space-y-2'>
                    <h5 className='text-sm font-medium'>Status</h5>
                    <div className='grid grid-cols-2 gap-2'>
                      {Object.values(ProjectStatus).map(status => (
                        <div
                          key={status}
                          className='flex items-center space-x-2'
                        >
                          <Checkbox
                            id={`status-${status}`}
                            checked={selectedStatus.includes(status)}
                            onCheckedChange={checked => {
                              const newStatus = checked
                                ? [...selectedStatus, status]
                                : selectedStatus.filter(s => s !== status);
                              updateFilters({ status: newStatus });
                            }}
                          />
                          <label
                            htmlFor={`status-${status}`}
                            className='text-sm'
                          >
                            {status}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Technology Categories */}
                  <div className='space-y-2'>
                    <h5 className='text-sm font-medium'>Technology</h5>
                    <div className='grid grid-cols-2 gap-2 max-h-48 overflow-y-auto'>
                      {Object.values(SkillLevel).map(skillLevel => (
                        <div
                          key={skillLevel}
                          className='flex items-center space-x-2'
                        >
                          <Checkbox
                            id={`tech-${skillLevel}`}
                            checked={selectedTech.includes(skillLevel)}
                            onCheckedChange={checked => {
                              const newTech = checked
                                ? [...selectedTech, skillLevel]
                                : selectedTech.filter(t => t !== skillLevel);
                              updateFilters({ tech: newTech });
                            }}
                          />
                          <label
                            htmlFor={`tech-${skillLevel}`}
                            className='text-sm'
                          >
                            {skillLevel}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </PopoverContent>
            </Popover>

            <div className='flex items-center rounded-md border p-1'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                className='h-7 w-7 p-0'
                onClick={() => updateFilters({ view: 'grid' })}
              >
                <Grid className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                className='h-7 w-7 p-0'
                onClick={() => updateFilters({ view: 'list' })}
              >
                <List className='h-4 w-4' />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className='flex flex-wrap gap-2 mt-4'>
            {searchQuery && (
              <Badge variant='secondary' className='gap-1'>
                Search: &quot;{searchQuery}&quot;
                <button
                  onClick={() => updateFilters({ search: '' })}
                  className='ml-1 text-xs hover:text-destructive'
                >
                  ×
                </button>
              </Badge>
            )}
            {selectedTech.map(tech => (
              <Badge key={tech} variant='secondary' className='gap-1'>
                {tech}
                <button
                  onClick={() =>
                    updateFilters({
                      tech: selectedTech.filter(t => t !== tech),
                    })
                  }
                  className='ml-1 text-xs hover:text-destructive'
                >
                  ×
                </button>
              </Badge>
            ))}
            {selectedStatus.map(status => (
              <Badge key={status} variant='secondary' className='gap-1'>
                {/* {Object.values(ProjectStatus).find(s => s === status)?.label ||
                  status} */}
                <button
                  onClick={() =>
                    updateFilters({
                      status: selectedStatus.filter(s => s !== status),
                    })
                  }
                  className='ml-1 text-xs hover:text-destructive'
                >
                  ×
                </button>
              </Badge>
            ))}
            {showFeaturedOnly && (
              <Badge variant='secondary' className='gap-1'>
                Featured Only
                <button
                  onClick={() => updateFilters({ featured: false })}
                  className='ml-1 text-xs hover:text-destructive'
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
          <div className='text-center py-12'>
            <div className='text-muted-foreground text-lg mb-4'>
              No projects found
            </div>
            <p className='text-muted-foreground'>
              {hasActiveFilters
                ? 'Try adjusting your filters to see more results'
                : 'Be the first to share a project with the community!'}
            </p>
            {hasActiveFilters && (
              <Button
                variant='outline'
                onClick={clearAllFilters}
                className='mt-4'
              >
                Clear All Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            <div className='mb-4 text-sm text-muted-foreground'>
              Showing {filteredProjects.length} of {projects.length} projects
            </div>
            {viewMode === 'grid' ? (
              <LayoutGrid cols={3}>
                {filteredProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    variant='card'
                  />
                ))}
              </LayoutGrid>
            ) : (
              <div className='space-y-4'>
                {filteredProjects.map(project => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    variant='list'
                  />
                ))}
              </div>
            )}
          </>
        )}
      </Section>
    </>
  );
}
