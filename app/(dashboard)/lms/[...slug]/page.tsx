import { notFound, redirect } from 'next/navigation';

import { DocumentStaticViewer } from '@/components/editor/document-static-viewer';
import { PageContainer } from '@/components/layout';
import {
  checkLMSDocumentAccess,
  getLMSDocumentBySlug,
  getRelatedLMSDocuments,
} from '@/data/lms/get-lms-documents';
import { requireServerAuth } from '@/lib/auth/auth-server';
interface LMSContentPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateStaticParams() {
  // Generate static params for all LMS documents
  const { getLMSNavigation } = await import('@/data/lms/get-lms-documents');
  const navigation = await getLMSNavigation();
  console.log('navigation', navigation);
  const params: { slug: string[] }[] = [];

  function extractSlugs(
    items: {
      slug?: string;
      children?: { slug?: string; children?: unknown[] }[];
    }[]
  ): void {
    for (const item of items) {
      if (item.slug) {
        params.push({
          slug: item.slug.split('/'),
        });
      }
      if (item.children) {
        extractSlugs(
          item.children as {
            slug?: string;
            children?: { slug?: string; children?: unknown[] }[];
          }[]
        );
      }
    }
  }

  extractSlugs(navigation);
  return params;
}

export async function generateMetadata({ params }: LMSContentPageProps) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug.join('/');
    const document = await getLMSDocumentBySlug(slug);
    console.log('document', document);
    if (!document) {
      return {
        title: 'Content Not Found',
      };
    }

    return {
      title: document.metaTitle ?? document.title ?? 'LMS Content',
      description: document.metaDescription ?? document.description,
    };
  } catch {
    return {
      title: 'Content Not Found',
    };
  }
}

export default async function LMSContentPage({ params }: LMSContentPageProps) {
  const user = await requireServerAuth();
  const resolvedParams = await params;
  const slug = resolvedParams.slug.join('/');

  try {
    const document = await getLMSDocumentBySlug(slug);

    if (!document) {
      notFound();
    }

    // Check access permissions
    const userRole = user.role ?? 'STUDENT';
    const hasAccess = checkLMSDocumentAccess(
      document.access ?? 'public',
      userRole
    );

    if (!hasAccess) {
      redirect('/lms');
    }

    // Get related documents for navigation
    const { prev, next } = await getRelatedLMSDocuments(slug);

    return (
      <PageContainer>
        <div className='space-y-6'>
          {/* Document header */}
          <div className='space-y-2'>
            <h1 className='text-4xl font-bold'>{document.title}</h1>
            {document.description && (
              <p className='text-lg text-muted-foreground'>
                {document.description}
              </p>
            )}
            <div className='flex items-center gap-4 text-sm text-muted-foreground'>
              <span>LMS Content</span>
              <span>
                created: {new Date(document.createdAt).toLocaleDateString()}
              </span>
              <span>
                updated: {new Date(document.updatedAt).toLocaleDateString()}
              </span>
            </div>
          </div>

          {/* Document content rendered statically */}
          <div className='border rounded-lg'>
            <div className='p-6'>
              <DocumentStaticViewer
                document={document}
                className='prose max-w-none'
                variant='server'
              />
            </div>
          </div>

          {/* Navigation */}
          {(prev || next) && (
            <div className='flex justify-between pt-6 border-t'>
              {prev ? (
                <a
                  href={`/lms/${prev.slug}`}
                  className='inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                >
                  ← {prev.title ?? 'Previous'}
                </a>
              ) : (
                <div />
              )}
              {next ? (
                <a
                  href={`/lms/${next.slug}`}
                  className='inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50'
                >
                  {next.title ?? 'Next'} →
                </a>
              ) : (
                <div />
              )}
            </div>
          )}
        </div>
      </PageContainer>
    );
  } catch (error) {
    // Log error in development only
    if (process.env.NODE_ENV === 'development') {
      console.error('Error loading LMS content:', error);
    }
    notFound();
  }
}
