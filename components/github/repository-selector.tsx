'use client';

import {
  Calendar,
  Code,
  ExternalLink,
  GitFork,
  Github,
  Link,
  Loader2,
  Search,
  Star,
} from 'lucide-react';
import { useEffect, useState } from 'react';

import {
  checkGitHubConnection,
  fetchGitHubRepositories,
} from '@/actions/github/github-actions';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import type { GitHubRepository } from '@/lib/github/api';

interface RepositorySelectorProps {
  onRepositorySelect?: (repository: GitHubRepository) => void;
  onCreateProject?: (repository: GitHubRepository) => Promise<void>;
  showCreateButton?: boolean;
  className?: string;
}

export function RepositorySelector({
  onRepositorySelect,
  onCreateProject,
  showCreateButton = true,
  className,
}: RepositorySelectorProps) {
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [filteredRepositories, setFilteredRepositories] = useState<
    GitHubRepository[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedRepository, setSelectedRepository] =
    useState<GitHubRepository | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  // Check GitHub connection and fetch repositories on mount
  useEffect(() => {
    const initializeData = async () => {
      setIsLoading(true);

      try {
        // Check if GitHub is connected
        const connectionResult = await checkGitHubConnection();
        setIsConnected(connectionResult.success && connectionResult.data);

        if (connectionResult.success && connectionResult.data) {
          // Fetch repositories
          const reposResult = await fetchGitHubRepositories();
          if (reposResult.success && reposResult.data) {
            setRepositories(reposResult.data);
            setFilteredRepositories(reposResult.data);
          }
        }
      } catch (error) {
        console.error('Error initializing repository data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeData();
  }, []);

  // Filter repositories based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredRepositories(repositories);
    } else {
      const filtered = repositories.filter(
        repo =>
          repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          repo.language?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredRepositories(filtered);
    }
  }, [searchQuery, repositories]);

  const handleRepositorySelect = (repository: GitHubRepository) => {
    setSelectedRepository(repository);
    onRepositorySelect?.(repository);
  };

  const handleCreateProject = async (repository: GitHubRepository) => {
    if (!onCreateProject) return;

    setIsCreating(true);
    try {
      await onCreateProject(repository);
    } catch (error) {
      console.error('Error creating project:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!isConnected) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className='flex items-center gap-2'>
            <Github className='h-5 w-5' />
            Connect GitHub
          </CardTitle>
          <CardDescription>
            Connect your GitHub account to import repositories as projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild className='w-full'>
            <Link href='/api/sign-in/github'>
              <Github className='h-4 w-4 mr-2' />
              Connect GitHub Account
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className='flex items-center gap-2'>
          <Github className='h-5 w-5' />
          Select GitHub Repository
        </CardTitle>
        <CardDescription>
          Choose a repository to create a project from
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Search Input */}
        <div className='relative'>
          <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search repositories...'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='pl-10'
          />
        </div>

        {/* Repository List */}
        <ScrollArea className='h-[400px]'>
          {isLoading ? (
            <div className='space-y-3'>
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className='h-24 w-full' />
              ))}
            </div>
          ) : filteredRepositories.length === 0 ? (
            <div className='text-center py-8 text-muted-foreground'>
              {searchQuery
                ? 'No repositories found matching your search'
                : 'No repositories found'}
            </div>
          ) : (
            <div className='space-y-3'>
              {filteredRepositories.map(repo => (
                <Card
                  key={repo.id}
                  className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                    selectedRepository?.id === repo.id
                      ? 'ring-2 ring-primary'
                      : ''
                  }`}
                  onClick={() => handleRepositorySelect(repo)}
                >
                  <CardContent className='p-4'>
                    <div className='flex items-start justify-between'>
                      <div className='flex-1 min-w-0'>
                        <div className='flex items-center gap-2 mb-2'>
                          <h4 className='font-semibold text-sm truncate'>
                            {repo.name}
                          </h4>
                          {repo.private && (
                            <Badge variant='secondary' className='text-xs'>
                              Private
                            </Badge>
                          )}
                        </div>

                        {repo.description && (
                          <p className='text-sm text-muted-foreground mb-2 line-clamp-2'>
                            {repo.description}
                          </p>
                        )}

                        <div className='flex items-center gap-4 text-xs text-muted-foreground'>
                          {repo.language && (
                            <div className='flex items-center gap-1'>
                              <Code className='h-3 w-3' />
                              {repo.language}
                            </div>
                          )}
                          <div className='flex items-center gap-1'>
                            <Star className='h-3 w-3' />
                            {repo.stargazers_count}
                          </div>
                          <div className='flex items-center gap-1'>
                            <GitFork className='h-3 w-3' />
                            {repo.forks_count}
                          </div>
                          <div className='flex items-center gap-1'>
                            <Calendar className='h-3 w-3' />
                            {formatDate(repo.updated_at)}
                          </div>
                        </div>
                      </div>

                      <div className='flex flex-col gap-2 ml-4'>
                        <Button
                          variant='outline'
                          size='sm'
                          asChild
                          onClick={e => e.stopPropagation()}
                        >
                          <a
                            href={repo.html_url}
                            target='_blank'
                            rel='noopener noreferrer'
                          >
                            <ExternalLink className='h-3 w-3 mr-1' />
                            View
                          </a>
                        </Button>

                        {showCreateButton && (
                          <Button
                            size='sm'
                            onClick={e => {
                              e.stopPropagation();
                              handleCreateProject(repo);
                            }}
                            disabled={isCreating}
                          >
                            {isCreating ? (
                              <Loader2 className='h-3 w-3 mr-1 animate-spin' />
                            ) : null}
                            Create Project
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </ScrollArea>

        {selectedRepository && (
          <>
            <Separator />
            <div className='text-sm text-muted-foreground'>
              Selected:{' '}
              <span className='font-medium'>
                {selectedRepository.full_name}
              </span>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
