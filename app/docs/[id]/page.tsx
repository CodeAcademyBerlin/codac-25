import { PlateEditor } from "@/components/editor/plate-editor";
import { getDoc } from "@/data/docs";
import { notFound } from "next/navigation";
import { type Value } from 'platejs';


interface DocPageProps {
  params: { id: string };
}



export default async function DocPage({ params }: DocPageProps) {
  const { id } = params;

  const doc = await getDoc(id)

  if (!doc) {
    notFound();
  }

  // const { markdown, plainText, value } = await getServerEditor()
  // console.log(markdown, plainText, value)

  return (

    <PlateEditor initialValue={doc.content as Value} />
  );
}

