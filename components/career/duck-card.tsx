import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { deleteDuck } from "@/actions/duck/delete-duck";
import { getDucks } from "@/actions/duck/get-ducks";

type DuckForCard = Awaited<ReturnType<typeof getDucks>>[number];

interface DuckCardProps {
  duck: DuckForCard;
}

export function DuckCard({ duck }: DuckCardProps) {
  const uploaderName = duck.user?.name || "a secret admirer";

  return (
    <Card>
      <CardHeader>
        <CardTitle>{duck.title}</CardTitle>
        <p className="text-sm text-muted-foreground">
          Posted {formatDistanceToNow(new Date(duck.createdAt))} ago by{" "}
          {uploaderName}
        </p>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center p-6">
        <p className="text-lg font-semibold mb-4">🦆</p>
        <Button asChild>
          <Link href={`/career/ducks/${duck.id}`}>
            Open for a quacktastic thing
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
