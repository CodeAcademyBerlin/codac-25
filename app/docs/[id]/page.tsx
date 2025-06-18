import { Value } from "platejs";

import { PlateAutoSaveEditor } from "@/components/editor/plate-provider";
import { getDoc } from "@/data/docs";

export default async function DocPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const doc = await getDoc(id)

  return (
    <div className="h-full w-full">
      <PlateAutoSaveEditor docId={id} initialValue={doc?.content as Value} />
    </div>
  );


  // const editor = usePlateEditor({
  //   plugins: EditorKit
  // });

  // return (

  //   <Plate editor={editor}>
  //     {/* {children} */}
  //     <EditorContainer>
  //       <Editor variant="none" />
  //     </EditorContainer>
  //   </Plate>

  // )
  {/*  return (
    <>
      <div className="flex-shrink-0 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="px-4 py-3 sm:px-6">
          <h1 className="text-xl font-semibold leading-tight tracking-tight">
            {doc.title}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Last updated {new Date(doc.updatedAt).toLocaleDateString()}
          </p>
        </div>
      </div> 
      <SimpleAutoSaveEditor
        documentId={id}
        initialValue={doc.content as Value}
      /> 
      <PlateEditor />
    </>
  );*/}
}

