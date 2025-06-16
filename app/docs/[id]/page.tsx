import { SimpleAutoSaveEditor } from "@/components/editor/simple-auto-save-editor";
import { getDoc } from "@/data/docs";
import { notFound } from "next/navigation";
import { type Value } from 'platejs';


interface DocPageProps {
  params: { id: string };
}



export default async function DocPage({ params }: DocPageProps) {
  const { id } = params;

  console.log('DocPage - Document ID:', { id, type: typeof id, length: id?.length });

  const doc = await getDoc(id)

  if (!doc) {
    notFound();
  }

  // const { markdown, plainText, value } = await getServerEditor()
  // console.log(markdown, plainText, value)

  console.log('DocPage - Rendering with:', {
    documentId: id,
    hasDoc: !!doc,
    docId: doc?.id
  });

  return (
    <div className="h-full flex flex-col">
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">{doc.title}</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Last updated {new Date(doc.updatedAt).toLocaleDateString()}
        </p>
      </div>
      <div className="">
        <SimpleAutoSaveEditor
          documentId={id}
          initialValue={doc.content as Value}
        />
      </div>
    </div>
  );
}

