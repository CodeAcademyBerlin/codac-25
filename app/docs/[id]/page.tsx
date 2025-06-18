import { Value } from "platejs";

import { PlateAutoSaveEditor } from "@/components/editor/plate-provider";
import { getDoc } from "@/data/docs";

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const doc = await getDoc(id);

  return (
    <div className="h-full w-full">
      <PlateAutoSaveEditor docId={id} initialValue={doc?.content as Value} />
    </div>
  );
}

