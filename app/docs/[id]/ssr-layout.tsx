import { getDoc } from "@/data/docs"
import { PlateEditor } from "@/components/editor/plate-editor"
import { Value } from "platejs"
import { EditorKit } from "@/components/editor/editor-kit"
import { EditorContainer, Editor } from "@/components/ui/editor"
import { usePlateEditor, Plate } from "platejs/react"

export default async function DocEditorLayout({
    children, params
}: {
    children: React.ReactNode,
    params: Promise<{ id: string }>
}) {


    const { id } = await params
    const doc = await getDoc(id)
    console.log(doc?.content)


    return (
        <div className="w-full h-full bg-accent">
            <h1>{doc?.title}</h1>
            {children}
        </div>
    )



}