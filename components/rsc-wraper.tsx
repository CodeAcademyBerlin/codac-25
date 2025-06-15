"use client"
import React, { use } from 'react'
import { PlateEditor } from './editor/plate-editor'
import { Document } from '@prisma/client'

export default function RscWraper({ doc }: { doc: Document }) {
    return <PlateEditor initialValue={doc.content as any} />;
}
export const DocEditor = ({ value }: { value: any }) => {
    return <PlateEditor initialValue={value} />
}