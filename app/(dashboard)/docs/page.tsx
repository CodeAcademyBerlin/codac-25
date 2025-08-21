import { getDocs } from '@/data/docs/docs';

import { DocsGrid } from './components/docs-grid';

export default async function DocsPage({
    searchParams,
}: {
    searchParams: Promise<{ type?: string }>;
}) {
    const params = await searchParams;
    const selectedType = params.type;
    const docs = await getDocs(selectedType);

    return <DocsGrid docs={docs} selectedType={selectedType} />;
}
