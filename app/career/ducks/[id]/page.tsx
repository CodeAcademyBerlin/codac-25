import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { getDuckById } from "@/actions/duck/get-duck-by-id";
import { DeleteDuckButton } from "@/components/career/delete-duck-button";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";

interface DuckPageProps {
  params: {
    id: string;
  };
}

export default async function DuckPage({ params }: DuckPageProps) {
  const [duck, session] = await Promise.all([getDuckById(params.id), auth()]);

  if (!duck) {
    notFound();
  }

  const user = session?.user;
  const canDelete =
    user &&
    (user.role === "ADMIN" ||
      user.role === "MENTOR" ||
      user.id === duck.userId);

  return (
    <div className="container mx-auto py-8">
      <Button asChild variant="ghost" className="mb-4">
        <Link href="/career/jobs">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Job Board
        </Link>
      </Button>
      <div className="flex justify-center">
        <Card className="w-full max-w-3xl">
          <CardHeader>
            <CardTitle className="text-3xl">{duck.title}</CardTitle>
            <CardDescription>
              A truly quacktastic sight to behold.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="relative aspect-video w-full overflow-hidden rounded-lg">
              <Image
                src={duck.imageUrl}
                alt={duck.title}
                fill
                className="object-contain"
              />
            </div>
          </CardContent>
          {canDelete && (
            <CardFooter className="flex justify-end">
              <DeleteDuckButton duckId={duck.id} />
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}
