"use client";

import { useEffect, useState } from "react";
import { GraduationCap } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  getMentors,
  UserWithMentorCounts,
} from "@/actions/mentorship/get-mentors";
import { MentorBookingDialog } from "@/components/mentorship/mentor-booking-dialog";

export default function FindMentorPage() {
  const [mentors, setMentors] = useState<UserWithMentorCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedMentor, setSelectedMentor] =
    useState<UserWithMentorCounts | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  useEffect(() => {
    async function loadMentors() {
      try {
        setLoading(true);
        const response = await getMentors({
          limit: 50,
          offset: 0,
        });

        if (response.success && response.data) {
          setMentors(response.data.mentors);
        } else {
          setError(response.error || "Failed to load mentors");
        }
      } catch (err) {
        setError("An unexpected error occurred");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadMentors();
  }, []);

  const handleBookMentor = (mentor: UserWithMentorCounts) => {
    setSelectedMentor(mentor);
    setDialogOpen(true);
  };

  return (
    <div className="container py-8 max-w-6xl">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Find a Mentor</h1>
          <p className="text-muted-foreground mt-2">
            Book a 1:1 session with one of our mentors to get personalized
            guidance on your learning journey.
          </p>
        </div>

        {loading && (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            {error}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="overflow-hidden">
              <CardHeader className="pb-4">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage
                      src={mentor.avatar || undefined}
                      alt={mentor.name || "Mentor"}
                    />
                    <AvatarFallback>
                      {mentor.name
                        ?.split(" ")
                        .map((n: string) => n[0])
                        .join("") || "M"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-xl">{mentor.name}</CardTitle>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <GraduationCap className="h-3.5 w-3.5" />
                      <span>Mentor</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <div className="space-y-3">
                  <p className="text-sm line-clamp-3">
                    {mentor.bio || "No bio available."}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {mentor.specialty && (
                      <Badge variant="secondary">{mentor.specialty}</Badge>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="border-t pt-4 bg-muted/50">
                <Button
                  className="w-full"
                  onClick={() => handleBookMentor(mentor)}
                >
                  Book a Session
                </Button>
              </CardFooter>
            </Card>
          ))}

          {mentors.length === 0 && !loading && (
            <div className="col-span-full text-center py-12">
              <h3 className="text-lg font-medium">No mentors available</h3>
              <p className="text-muted-foreground mt-1">
                Please check back later or contact support.
              </p>
            </div>
          )}
        </div>
      </div>

      {selectedMentor && (
        <MentorBookingDialog
          mentor={selectedMentor}
          open={dialogOpen}
          onOpenChange={setDialogOpen}
        />
      )}
    </div>
  );
}
