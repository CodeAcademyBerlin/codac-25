"use client"
import { Value } from "platejs";
import { PlateController, useEditorRef, useEditorSelector, useEditorState } from "platejs/react";
import { PlateEditor } from "./plate-editor";


export default function PlateProvider({ children }: { children: React.ReactNode }) {


    return (
        <PlateController>
            {children}
        </PlateController>
    )
}

export const PlateRefEditor = ({ docId, initialValue }: { docId: string, initialValue: Value }) => {
    return (
        <PlateController>
            <PlateEditor initialValue={initialValue} >
                <PlateStateUpdater />
            </PlateEditor>
        </PlateController>
    )
}

const PlateStateUpdater = (props: any) => {
    console.log(props)
    const editor = useEditorRef();
    const hasSelection = useEditorSelector((editor) => !!editor?.selection, []);
    const editorState = useEditorState();
    console.log(editorState)
    // console.log(editor)
    // console.log(hasSelection)
    return (
        <div>
            <h1>Plate State Updater</h1>
        </div>
    )
}