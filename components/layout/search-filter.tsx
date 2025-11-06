'use client';

import { Filter, Grid, List, Search } from 'lucide-react';
import { useState } from 'react';

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
import { cn } from '@/lib/utils';

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface FilterGroup {
  title: string;
  options: FilterOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  multiColumn?: boolean;
}

interface SearchFilterProps {
  searchValue?: string;
  searchPlaceholder?: string;
  onSearchChange?: (value: string) => void;
  filterGroups?: FilterGroup[];
  showViewToggle?: boolean;
  viewMode?: 'grid' | 'list';
  onViewModeChange?: (mode: 'grid' | 'list') => void;
  onClearAll?: () => void;
  className?: string;
  activeFilters?: Array<{ label: string; onRemove: () => void }>;
}

export function SearchFilter({
  searchValue = '',
  searchPlaceholder = 'Search...',
  onSearchChange,
  filterGroups = [],
  showViewToggle = false,
  viewMode = 'grid',
  onViewModeChange,
  onClearAll,
  className,
  activeFilters = [],
}: SearchFilterProps) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const activeFilterCount = filterGroups.reduce(
    (acc, group) => acc + group.selected.length,
    0
  );
  const hasActiveFilters = activeFilterCount > 0 || searchValue;

  return (
    <div className={cn('space-y-4', className)}>
      <div className='flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between'>
        {/* Search Input */}
        {onSearchChange && (
          <div className='flex-1 max-w-md'>
            <div className='relative'>
              <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
              <Input
                placeholder={searchPlaceholder}
                className='pl-10'
                value={searchValue}
                onChange={e => onSearchChange(e.target.value)}
              />
            </div>
          </div>
        )}

        {/* Filter and View Controls */}
        <div className='flex items-center gap-2'>
          {/* Filter Popover */}
          {filterGroups.length > 0 && (
            <Popover open={isFilterOpen} onOpenChange={setIsFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant='outline' size='sm' className='relative'>
                  <Filter className='h-4 w-4 mr-2' />
                  Filters
                  {activeFilterCount > 0 && (
                    <Badge
                      variant='destructive'
                      className='absolute -top-2 -right-2 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center'
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
                    {hasActiveFilters && onClearAll && (
                      <Button variant='ghost' size='sm' onClick={onClearAll}>
                        Clear All
                      </Button>
                    )}
                  </div>

                  {filterGroups.map((group, index) => (
                    <div key={group.title}>
                      {index > 0 && <Separator />}
                      <div className='space-y-2'>
                        <h5 className='text-sm font-medium'>{group.title}</h5>
                        <div
                          className={cn(
                            'gap-2',
                            group.multiColumn
                              ? 'grid grid-cols-2'
                              : 'flex flex-col space-y-2'
                          )}
                        >
                          {group.options.map(option => (
                            <div
                              key={option.id}
                              className='flex items-center space-x-2'
                            >
                              <Checkbox
                                id={option.id}
                                checked={group.selected.includes(option.value)}
                                onCheckedChange={checked => {
                                  const newSelected = checked
                                    ? [...group.selected, option.value]
                                    : group.selected.filter(
                                        v => v !== option.value
                                      );
                                  group.onChange(newSelected);
                                }}
                              />
                              <label
                                htmlFor={option.id}
                                className='text-sm cursor-pointer'
                              >
                                {option.label}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          )}

          {/* View Toggle */}
          {showViewToggle && onViewModeChange && (
            <div className='flex items-center rounded-md border p-1'>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size='sm'
                className='h-7 w-7 p-0'
                onClick={() => onViewModeChange('grid')}
                aria-label='Grid view'
              >
                <Grid className='h-4 w-4' />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size='sm'
                className='h-7 w-7 p-0'
                onClick={() => onViewModeChange('list')}
                aria-label='List view'
              >
                <List className='h-4 w-4' />
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Active Filters Display */}
      {activeFilters.length > 0 && (
        <div className='flex flex-wrap gap-2'>
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant='secondary' className='gap-1'>
              {filter.label}
              <button
                onClick={filter.onRemove}
                className='ml-1 text-xs hover:text-destructive'
                aria-label={`Remove ${filter.label} filter`}
              >
                ×
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

