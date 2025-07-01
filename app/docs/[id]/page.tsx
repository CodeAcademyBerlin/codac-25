import { Value } from "platejs";

import { UnifiedEditor } from "@/components/editor/unified-editor";
import { getDoc } from "@/data/docs/docs";

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDoc(id);

  return (
    <div className="h-full w-full">
      <UnifiedEditor
        contentId={id}
        contentType="document"
        initialValue={doc?.content as Value}
        showStatusBar={true}
        canEdit={true}
      />
    </div>
  );
}

