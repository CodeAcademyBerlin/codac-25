"use client";

import { format } from "date-fns";
import { CalendarIcon, CheckCircle, Clock, XCircle } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { getMentorSessions } from "@/actions/mentorship/get-mentor-sessions";
import { updateMentorSession } from "@/actions/mentorship/update-session";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MentorSession, MentorSessionStatus } from "@/types/mentorship";


export default function MentorSessionsPage() {
  const [upcomingSessions, setUpcomingSessions] = useState<MentorSession[]>([]);
  const [pastSessions, setPastSessions] = useState<MentorSession[]>([]);
  const [stats, setStats] = useState({
    pendingSessionsCount: 0,
    completedSessionsCount: 0,
    cancelledSessionsCount: 0,
    declinedSessionsCount: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Get the current user session
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  // For session status update
  const [sessionToUpdate, setSessionToUpdate] = useState<{
    session: MentorSession;
    status: MentorSessionStatus;
  } | null>(null);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to load sessions data
  async function loadSessions() {
    try {
      setLoading(true);
      const response = await getMentorSessions();

      if (response.success && response.data) {
        setUpcomingSessions(response.data.upcomingSessions);
        setPastSessions(response.data.pastSessions);
        setStats({
          pendingSessionsCount: response.data.pendingSessionsCount,
          completedSessionsCount: response.data.completedSessionsCount,
          cancelledSessionsCount: response.data.cancelledSessionsCount,
          declinedSessionsCount: response.data.declinedSessionsCount,
        });
      } else {
        setError(response.error || "Failed to load sessions");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  // Function to handle session status update
  const handleConfirmStatusUpdate = async () => {
    if (!sessionToUpdate) return;

    try {
      setIsSubmitting(true);

      const result = await updateMentorSession({
        sessionId: sessionToUpdate.session.id,
        status: sessionToUpdate.status,
      });

      if (result.success) {
        // Remove toast notifications and just close the dialog
        loadSessions();
      } else {
        // Only show error toasts
        toast.error(result.error || "Failed to update session");
      }
    } catch (err) {
      toast.error("An error occurred while updating the session");
      console.error(err);
    } finally {
      setConfirmDialogOpen(false);
      setSessionToUpdate(null);
      setIsSubmitting(false);
    }
  };

  // Function to open confirmation dialog
  const confirmStatusChange = (
    session: MentorSession,
    newStatus: MentorSessionStatus
  ) => {
    setSessionToUpdate({ session, status: newStatus });
    setConfirmDialogOpen(true);
  };

  // Function to get status badge color - update to make cancelled and declined less alarming
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return (
          <Badge
            variant="outline"
            className="bg-green-50 text-green-700 border-green-200"
          >
            Confirmed
          </Badge>
        );
      case "COMPLETED":
        return (
          <Badge
            variant="outline"
            className="bg-blue-50 text-blue-700 border-blue-200"
          >
            Completed
          </Badge>
        );
      case "CANCELLED":
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-muted-foreground"
          >
            Cancelled
          </Badge>
        );
      case "DECLINED":
        return (
          <Badge
            variant="outline"
            className="bg-muted text-muted-foreground border-muted-foreground"
          >
            Declined
          </Badge>
        );
      default:
        return <Badge>Pending</Badge>;
    }
  };

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Sessions</h1>
          <p className="text-muted-foreground mt-2">
            View and manage your upcoming and past mentorship sessions
          </p>
        </div>

        {/* Statistics cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Pending Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.pendingSessionsCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Completed Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.completedSessionsCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Cancelled Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.cancelledSessionsCount}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Declined Sessions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.declinedSessionsCount}
              </div>
            </CardContent>
          </Card>
        </div>

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="upcoming">Upcoming Sessions</TabsTrigger>
              <TabsTrigger value="declined">Declined Requests</TabsTrigger>
              <TabsTrigger value="past">Past Sessions</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              <div className="flex flex-col gap-4">
                {upcomingSessions.filter(
                  (session) => session.status !== "DECLINED"
                ).length > 0 ? (
                  upcomingSessions
                    .filter((session) => session.status !== "DECLINED")
                    .map((session) => (
                      <Card key={session.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>Upcoming Session</CardTitle>
                            {getStatusBadge(session.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 pb-4">
                            {session.mentorship?.mentee && (
                              <>
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={
                                      session.mentorship.mentee.avatar ||
                                      undefined
                                    }
                                    alt={
                                      session.mentorship.mentee.name || "Mentee"
                                    }
                                  />
                                  <AvatarFallback>
                                    {session.mentorship.mentee.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("") || "S"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {session.mentorship.mentee.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.mentorship.mentee.cohort?.name ||
                                      "Student"}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(session.scheduledFor),
                                  "EEEE, MMMM d, yyyy"
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(session.scheduledFor),
                                  "h:mm a"
                                )}
                              </span>
                            </div>
                            {session.status === "PENDING" && (
                              <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded-md text-yellow-800">
                                <p className="text-sm font-medium">
                                  Session Needs Confirmation
                                </p>
                                <p className="text-xs">
                                  {new Date(session.updatedAt) >
                                  new Date(session.createdAt)
                                    ? "This session was rescheduled by the student and needs your confirmation."
                                    : "This session needs your confirmation."}
                                </p>
                              </div>
                            )}
                            {session.notes && (
                              <div className="mt-2 p-2 bg-muted rounded-md">
                                <p className="text-sm font-medium">Notes:</p>
                                <p className="text-sm">{session.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4 bg-muted/50 gap-4">
                          {session.status === "PENDING" ? (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() =>
                                  confirmStatusChange(
                                    session,
                                    MentorSessionStatus.CONFIRMED
                                  )
                                }
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Confirm
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() =>
                                  confirmStatusChange(
                                    session,
                                    MentorSessionStatus.DECLINED
                                  )
                                }
                              >
                                <XCircle className="h-4 w-4 mr-2" />
                                Decline
                              </Button>
                            </>
                          ) : session.status === "CONFIRMED" ? (
                            <Button
                              className="flex-1"
                              onClick={() =>
                                confirmStatusChange(
                                  session,
                                  MentorSessionStatus.COMPLETED
                                )
                              }
                            >
                              <CheckCircle className="h-4 w-4 mr-2" />
                              Mark as Completed
                            </Button>
                          ) : null}
                        </CardFooter>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No upcoming sessions to show. Check your declined requests
                    tab for any declined session requests.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="declined">
              <div className="flex flex-col gap-4">
                {upcomingSessions.filter(
                  (session) => session.status === "DECLINED"
                ).length > 0 ? (
                  upcomingSessions
                    .filter((session) => session.status === "DECLINED")
                    .map((session) => (
                      <Card key={session.id} className="border-red-200">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>Declined Request</CardTitle>
                            {getStatusBadge(session.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 pb-4">
                            {session.mentorship?.mentee && (
                              <>
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={
                                      session.mentorship.mentee.avatar ||
                                      undefined
                                    }
                                    alt={
                                      session.mentorship.mentee.name || "Mentee"
                                    }
                                  />
                                  <AvatarFallback>
                                    {session.mentorship.mentee.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("") || "S"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {session.mentorship.mentee.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.mentorship.mentee.cohort?.name ||
                                      "Student"}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(session.scheduledFor),
                                  "EEEE, MMMM d, yyyy"
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(session.scheduledFor),
                                  "h:mm a"
                                )}
                              </span>
                            </div>
                            {session.notes && (
                              <div className="mt-2 p-2 bg-muted rounded-md">
                                <p className="text-sm font-medium">Notes:</p>
                                <p className="text-sm">{session.notes}</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No declined session requests.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="past">
              <div className="flex flex-col gap-4">
                {pastSessions.filter((session) => session.status !== "DECLINED")
                  .length > 0 ? (
                  pastSessions
                    .filter((session) => session.status !== "DECLINED")
                    .map((session) => (
                      <Card key={session.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>Past Session</CardTitle>
                            {getStatusBadge(session.status)}
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 pb-4">
                            {session.mentorship?.mentee && (
                              <>
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={
                                      session.mentorship.mentee.avatar ||
                                      undefined
                                    }
                                    alt={
                                      session.mentorship.mentee.name || "Mentee"
                                    }
                                  />
                                  <AvatarFallback>
                                    {session.mentorship.mentee.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("") || "S"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {session.mentorship.mentee.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.mentorship.mentee.cohort?.name ||
                                      "Student"}
                                  </p>
                                </div>
                              </>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 text-sm">
                            <div className="flex items-center gap-2">
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(session.scheduledFor),
                                  "EEEE, MMMM d, yyyy"
                                )}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(session.scheduledFor),
                                  "h:mm a"
                                )}
                              </span>
                            </div>
                            {session.status === "CANCELLED" && (
                              <div className="mt-2 p-2 bg-muted rounded-md border border-muted">
                                <p className="text-sm">
                                  <XCircle className="h-4 w-4 inline mr-1" />
                                  {session.mentorship?.mentorId ===
                                  currentUserId
                                    ? "You cancelled this session"
                                    : session.mentorship?.menteeId &&
                                      session.mentorship.menteeId !==
                                        currentUserId
                                    ? `This session was cancelled by the student`
                                    : "This session was cancelled"}
                                </p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No previous sessions found.
                  </div>
                )}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </div>

      {/* Status update confirmation dialog */}
      <AlertDialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {sessionToUpdate?.status === "CONFIRMED" && "Confirm Session"}
              {sessionToUpdate?.status === "COMPLETED" && "Complete Session"}
              {sessionToUpdate?.status === "CANCELLED" && "Cancel Session"}
              {sessionToUpdate?.status === "DECLINED" && "Decline Session"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {sessionToUpdate?.status === "CONFIRMED" &&
                "Are you sure you want to confirm this session? This will notify the student that you've accepted their booking request."}
              {sessionToUpdate?.status === "COMPLETED" &&
                "Are you sure you want to mark this session as completed?"}
              {sessionToUpdate?.status === "CANCELLED" &&
                "Are you sure you want to cancel this session? This will notify the student that the session is cancelled."}
              {sessionToUpdate?.status === "DECLINED" &&
                "Are you sure you want to decline this session request? This will notify the student that you're unavailable for this time slot."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmStatusUpdate}
              disabled={isSubmitting}
              className={
                sessionToUpdate?.status === "CANCELLED" ||
                sessionToUpdate?.status === "DECLINED"
                  ? "bg-destructive text-destructive-foreground"
                  : ""
              }
            >
              {isSubmitting ? "Processing..." : "Yes, Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
