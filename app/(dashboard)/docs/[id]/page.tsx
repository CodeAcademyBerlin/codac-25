import { Value } from "platejs";

import { SimplifiedUnifiedEditor } from "@/components/editor/simplified-unified-editor";
import { getDoc } from "@/data/docs/docs";

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDoc(id);

  return (
    <div className="h-full w-full">
      <SimplifiedUnifiedEditor
        contentId={id}
        contentType="document"
        initialValue={doc?.content as Value}
        showStatusBar={true}
        canEdit={true}
      />
    </div>
  );
}

