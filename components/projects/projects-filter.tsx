'use client'

import { Filter } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Separator } from '@/components/ui/separator'
import { PROJECT_STATUSES, SKILL_CATEGORIES } from '@/types/portfolio'

export function ProjectsFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)

  const currentTech = searchParams.get('tech')?.split(',') || []
  const currentStatus = searchParams.get('status')?.split(',') || []
  const currentFeatured = searchParams.get('featured') === 'true'

  const updateFilters = (key: string, values: string[] | boolean) => {
    const params = new URLSearchParams(searchParams.toString())
    
    if (key === 'featured') {
      if (values === true) {
        params.set('featured', 'true')
      } else {
        params.delete('featured')
      }
    } else if (Array.isArray(values) && values.length > 0) {
      params.set(key, values.join(','))
    } else {
      params.delete(key)
    }

    router.push('/projects?' + params.toString())
  }

  const clearAllFilters = () => {
    const params = new URLSearchParams(searchParams.toString())
    params.delete('tech')
    params.delete('status')
    params.delete('featured')
    router.push('/projects?' + params.toString())
  }

  const hasActiveFilters = currentTech.length > 0 || currentStatus.length > 0 || currentFeatured

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="relative">
          <Filter className="h-4 w-4 mr-2" />
          Filters
          {hasActiveFilters && (
            <Badge variant="destructive" className="absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs">
              {currentTech.length + currentStatus.length + (currentFeatured ? 1 : 0)}
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
                checked={currentFeatured}
                onCheckedChange={(checked) => updateFilters('featured', !!checked)}
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
                    checked={currentStatus.includes(status.value)}
                    onCheckedChange={(checked) => {
                      const newStatus = checked
                        ? [...currentStatus, status.value]
                        : currentStatus.filter(s => s !== status.value)
                      updateFilters('status', newStatus)
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
                    checked={currentTech.includes(category)}
                    onCheckedChange={(checked) => {
                      const newTech = checked
                        ? [...currentTech, category]
                        : currentTech.filter(t => t !== category)
                      updateFilters('tech', newTech)
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
  )
}