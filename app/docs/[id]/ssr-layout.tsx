import { Value } from "platejs"
import { usePlateEditor, Plate } from "platejs/react"

import { EditorKit } from "@/components/editor/editor-kit"
import { PlateEditor } from "@/components/editor/plate-editor"
import { EditorContainer, Editor } from "@/components/ui/editor"
import { getDoc } from "@/data/docs"

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