'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

export function JobFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const [search, setSearch] = useState(searchParams.get('search') || '')
  const [type, setType] = useState(searchParams.get('type') || 'all')
  const [level, setLevel] = useState(searchParams.get('level') || 'all')
  const [remote, setRemote] = useState(searchParams.get('remote') === 'true')
  const [company, setCompany] = useState(searchParams.get('company') || '')

  const applyFilters = () => {
    const params = new URLSearchParams()
    
    if (search) params.set('search', search)
    if (type !== 'all') params.set('type', type)
    if (level !== 'all') params.set('level', level)
    if (remote) params.set('remote', 'true')
    if (company) params.set('company', company)

    router.push(`/career/jobs?${params.toString()}`)
  }

  const clearFilters = () => {
    setSearch('')
    setType('all')
    setLevel('all')
    setRemote(false)
    setCompany('')
    router.push('/career/jobs')
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Filter Jobs</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Job title, company, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <Label htmlFor="type">Job Type</Label>
          <Select value={type} onValueChange={setType}>
            <SelectTrigger>
              <SelectValue placeholder="Select job type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="FULL_TIME">Full Time</SelectItem>
              <SelectItem value="PART_TIME">Part Time</SelectItem>
              <SelectItem value="CONTRACT">Contract</SelectItem>
              <SelectItem value="INTERNSHIP">Internship</SelectItem>
              <SelectItem value="FREELANCE">Freelance</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="level">Experience Level</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger>
              <SelectValue placeholder="Select experience level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Levels</SelectItem>
              <SelectItem value="ENTRY">Entry Level</SelectItem>
              <SelectItem value="JUNIOR">Junior</SelectItem>
              <SelectItem value="MID">Mid Level</SelectItem>
              <SelectItem value="SENIOR">Senior</SelectItem>
              <SelectItem value="LEAD">Lead</SelectItem>
              <SelectItem value="EXECUTIVE">Executive</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            placeholder="Company name..."
            value={company}
            onChange={(e) => setCompany(e.target.value)}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="remote"
            checked={remote}
            onCheckedChange={setRemote}
          />
          <Label htmlFor="remote">Remote Only</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={applyFilters} className="flex-1">
            Apply Filters
          </Button>
          <Button variant="outline" onClick={clearFilters}>
            Clear
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 