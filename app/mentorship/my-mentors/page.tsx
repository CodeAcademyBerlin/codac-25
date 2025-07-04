"use client";

import { useEffect, useState } from "react";
import {
  Calendar as CalendarIcon,
  GraduationCap,
  MessageSquare,
  XCircle,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { useLocalStorage } from "@/hooks/use-local-storage";

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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyMentorships } from "@/actions/mentorship/get-my-mentorships";
import {
  MentorSession,
  MentorSessionStatus,
  Mentorship,
} from "@/types/mentorship";
import { UserWithMentorCounts } from "@/actions/mentorship/get-mentors";
import { MentorBookingDialog } from "@/components/mentorship/mentor-booking-dialog";
import { updateMentorSession } from "@/actions/mentorship/update-session";
import { useSession } from "next-auth/react";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

// Available time slots for booking
const TIME_SLOTS = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

// Function to get the appropriate badge variant based on session status
const getSessionBadgeVariant = (status: MentorSessionStatus) => {
  switch (status) {
    case MentorSessionStatus.CONFIRMED:
      return "default" as const;
    case MentorSessionStatus.PENDING:
      return "secondary" as const;
    case MentorSessionStatus.COMPLETED:
      return "outline" as const;
    case MentorSessionStatus.CANCELLED:
      return "destructive" as const;
    case MentorSessionStatus.DECLINED:
      return "destructive" as const;
    default:
      return "outline" as const;
  }
};

export default function MyMentorsPage() {
  const [mentorships, setMentorships] = useState<Mentorship[]>([]);
  const [upcomingSessions, setUpcomingSessions] = useState<MentorSession[]>([]);
  const [pastSessions, setPastSessions] = useState<MentorSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showStatusBanner, setShowStatusBanner] = useState(true);

  // Store the last viewed update timestamp in local storage
  const [lastViewedUpdate, setLastViewedUpdate] = useLocalStorage<string>(
    "lastViewedMentorshipUpdate",
    ""
  );

  // Get current user session
  const { data: session } = useSession();
  const currentUserId = session?.user?.id || "";

  // For the booking dialog
  const [selectedMentor, setSelectedMentor] =
    useState<UserWithMentorCounts | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // For cancel confirmation dialog
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [sessionToCancel, setSessionToCancel] = useState<MentorSession | null>(
    null
  );

  // For reschedule dialog
  const [rescheduleDialogOpen, setRescheduleDialogOpen] = useState(false);
  const [sessionToReschedule, setSessionToReschedule] =
    useState<MentorSession | null>(null);
  const [newDate, setNewDate] = useState<Date | undefined>(undefined);
  const [newTimeSlot, setNewTimeSlot] = useState<string | undefined>(undefined);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Function to load mentorships data
  async function loadMentorships() {
    try {
      setLoading(true);
      const response = await getMyMentorships();

      if (response.success && response.data) {
        setMentorships(response.data.activeMentorships);
        setUpcomingSessions(response.data.upcomingSessions);
        setPastSessions(response.data.pastSessions);
      } else {
        setError(response.error || "Failed to load mentorships");
      }
    } catch (err) {
      setError("An unexpected error occurred");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadMentorships();
  }, []);

  // Check for recently cancelled or declined sessions
  useEffect(() => {
    // Find cancelled sessions in the past 24 hours
    const recentlyCancelledSessions = pastSessions.filter((session) => {
      if (!session.updatedAt) return false;
      const updatedAt =
        session.updatedAt instanceof Date
          ? session.updatedAt
          : new Date(session.updatedAt);

      const isRecent =
        new Date().getTime() - updatedAt.getTime() < 24 * 60 * 60 * 1000;
      return session.status === MentorSessionStatus.CANCELLED && isRecent;
    });

    // Find declined sessions
    const recentlyDeclinedSessions = upcomingSessions.filter((session) => {
      if (!session.updatedAt) return false;
      const updatedAt =
        session.updatedAt instanceof Date
          ? session.updatedAt
          : new Date(session.updatedAt);

      const isRecent =
        new Date().getTime() - updatedAt.getTime() < 24 * 60 * 60 * 1000;
      return session.status === MentorSessionStatus.DECLINED && isRecent;
    });

    // Get the most recent update time from all sessions
    const allSessions = [
      ...recentlyCancelledSessions,
      ...recentlyDeclinedSessions,
    ];
    const mostRecentUpdate = allSessions.reduce((latest, session) => {
      const sessionUpdate = new Date(session.updatedAt!).getTime();
      return sessionUpdate > latest ? sessionUpdate : latest;
    }, 0);

    // Only show banner if there are updates newer than the last viewed
    if (mostRecentUpdate > 0) {
      const currentLastViewed = lastViewedUpdate
        ? new Date(lastViewedUpdate).getTime()
        : 0;
      setShowStatusBanner(mostRecentUpdate > currentLastViewed);

      // Update the last viewed timestamp if we're showing new updates
      if (mostRecentUpdate > currentLastViewed) {
        setLastViewedUpdate(new Date(mostRecentUpdate).toISOString());
      }
    } else {
      setShowStatusBanner(false);
    }
  }, [pastSessions, upcomingSessions, lastViewedUpdate]);

  // Function to handle booking button click
  const handleBookSession = (mentor: UserWithMentorCounts) => {
    setSelectedMentor(mentor);
    setDialogOpen(true);
  };

  // Function to refresh data after booking
  const handleBookingComplete = () => {
    // Reload mentorships data to show new booking
    loadMentorships();
  };

  // Function to handle canceling a session
  const handleCancelSession = async () => {
    if (!sessionToCancel) return;

    try {
      const result = await updateMentorSession({
        sessionId: sessionToCancel.id,
        status: MentorSessionStatus.CANCELLED,
      });

      if (result.success) {
        toast.success("Session cancelled successfully");
        loadMentorships();
      } else {
        toast.error(result.error || "Failed to cancel session");
      }
    } catch (err) {
      toast.error("An error occurred while cancelling the session");
      console.error(err);
    } finally {
      setCancelDialogOpen(false);
      setSessionToCancel(null);
    }
  };

  // Function to open cancel confirmation dialog
  const openCancelDialog = (session: MentorSession) => {
    setSessionToCancel(session);
    setCancelDialogOpen(true);
  };

  // Function to open reschedule dialog
  const openRescheduleDialog = (session: MentorSession) => {
    setSessionToReschedule(session);
    const scheduledFor =
      session.scheduledFor instanceof Date
        ? session.scheduledFor
        : new Date(session.scheduledFor);
    setNewDate(scheduledFor);
    setRescheduleDialogOpen(true);
  };

  // Function to handle rescheduling a session
  const handleRescheduleSession = async () => {
    if (!sessionToReschedule || !newDate || !newTimeSlot) {
      toast.error("Please select both a date and time for your session");
      return;
    }

    try {
      setIsSubmitting(true);

      // Format the booking date and time
      const rescheduledDateTime = new Date(newDate);
      const [hours, minutes, period] = newTimeSlot.split(/[:\s]/);
      let hour = parseInt(hours);
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      rescheduledDateTime.setHours(hour, parseInt(minutes));

      const result = await updateMentorSession({
        sessionId: sessionToReschedule.id,
        scheduledFor: rescheduledDateTime,
      });

      if (result.success) {
        let message = "Session rescheduled successfully";

        // Check if the session status was reset to pending
        if (
          sessionToReschedule.status === MentorSessionStatus.CONFIRMED &&
          result.data?.status === MentorSessionStatus.PENDING
        ) {
          message += ". Your mentor will need to confirm the new time.";
        }

        toast.success(message);
        loadMentorships();
        setRescheduleDialogOpen(false);
        setSessionToReschedule(null);
        setNewDate(undefined);
        setNewTimeSlot(undefined);
      } else {
        toast.error(result.error || "Failed to reschedule session");
      }
    } catch (err) {
      toast.error("An error occurred while rescheduling the session");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderMentorCard = (mentor: UserWithMentorCounts) => (
    <Card key={mentor.id}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
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
              <span>{mentor.specialty || "Mentor"}</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <div className="space-y-3">
          <p className="text-sm">{mentor.bio || "No bio available."}</p>
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Badge>Active</Badge>
              </div>
              <div className="flex items-center gap-1">
                <CalendarIcon className="h-3.5 w-3.5" />
                <span>Since {format(new Date(), "MMMM yyyy")}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t pt-4 bg-muted/50 gap-4">
        <Button variant="outline" className="flex-1">
          <MessageSquare className="h-4 w-4 mr-2" />
          Message
        </Button>
        <Button className="flex-1" onClick={() => handleBookSession(mentor)}>
          Book Session
        </Button>
      </CardFooter>
    </Card>
  );

  // Function to check if there are recently cancelled or declined sessions
  const hasRecentCancelledOrDeclinedSessions = () => {
    const hasCancelled = pastSessions.some((s) => {
      if (!s.updatedAt) return false;
      const updatedAt =
        s.updatedAt instanceof Date ? s.updatedAt : new Date(s.updatedAt);
      return (
        s.status === MentorSessionStatus.CANCELLED &&
        new Date().getTime() - updatedAt.getTime() < 24 * 60 * 60 * 1000
      );
    });

    const hasDeclined = upcomingSessions.some(
      (s) => s.status === MentorSessionStatus.DECLINED
    );

    return hasCancelled || hasDeclined;
  };

  // Function to check if there are recently cancelled sessions
  const hasRecentCancelledSessions = () => {
    return pastSessions.some((s) => {
      if (!s.updatedAt) return false;
      const updatedAt =
        s.updatedAt instanceof Date ? s.updatedAt : new Date(s.updatedAt);
      return (
        s.status === MentorSessionStatus.CANCELLED &&
        new Date().getTime() - updatedAt.getTime() < 24 * 60 * 60 * 1000
      );
    });
  };

  // Function to check if there are declined sessions
  const hasDeclinedSessions = () => {
    return upcomingSessions.some(
      (s) => s.status === MentorSessionStatus.DECLINED
    );
  };

  return (
    <div className="container py-6 max-w-6xl">
      <div className="flex flex-col gap-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Mentors</h1>
          <p className="text-muted-foreground mt-2">
            View your mentors and upcoming sessions
          </p>
        </div>

        {/* Cancelled or declined sessions notification - updated to be dismissible */}
        {!loading &&
          !error &&
          hasRecentCancelledOrDeclinedSessions() &&
          showStatusBanner && (
            <div className="bg-muted border border-muted rounded-lg p-4 relative">
              <button
                onClick={() => setShowStatusBanner(false)}
                className="absolute top-2 right-2 p-1 hover:bg-muted-foreground/10 rounded-full"
                aria-label="Dismiss notification"
              >
                <X className="h-4 w-4" />
              </button>
              <h3 className="font-medium flex items-center">
                <CalendarIcon className="h-4 w-4 mr-2" />
                Session Status Update
              </h3>
              <p className="text-sm mt-1">
                {hasRecentCancelledSessions() && hasDeclinedSessions()
                  ? "Some of your sessions have been updated. Please check your session lists below for details."
                  : hasRecentCancelledSessions()
                    ? "One or more of your sessions have been cancelled. Please check the 'Session History' tab for details."
                    : "One or more of your session requests have been declined. Please check the 'Declined Sessions' tab for details."}
              </p>
            </div>
          )}

        {loading ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        ) : error ? (
          <div className="bg-destructive/10 p-4 rounded-md text-destructive">
            {error}
          </div>
        ) : (
          <Tabs defaultValue="mentors" className="w-full">
            <TabsList className="mb-6">
              <TabsTrigger value="mentors">Active Mentors</TabsTrigger>
              <TabsTrigger value="sessions">Upcoming Sessions</TabsTrigger>
              <TabsTrigger value="declined">Declined Sessions</TabsTrigger>
              <TabsTrigger value="history">Session History</TabsTrigger>
            </TabsList>

            <TabsContent value="mentors">
              <div className="flex flex-col gap-4">
                {mentorships.length > 0 ? (
                  mentorships.map(
                    (mentorship) =>
                      mentorship.mentor && renderMentorCard(mentorship.mentor)
                  )
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    You don't have any active mentors yet.{" "}
                    <a
                      href="/mentorship/find"
                      className="text-primary underline"
                    >
                      Find a mentor
                    </a>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="sessions">
              <div className="flex flex-col gap-4">
                {upcomingSessions.filter(
                  (session) => session.status !== MentorSessionStatus.DECLINED
                ).length > 0 ? (
                  upcomingSessions
                    .filter(
                      (session) =>
                        session.status !== MentorSessionStatus.DECLINED
                    )
                    .map((session) => (
                      <Card key={session.id}>
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>Upcoming Session</CardTitle>
                            <Badge
                              variant={getSessionBadgeVariant(session.status)}
                            >
                              {session.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 pb-4">
                            {session.mentorship?.mentor && (
                              <>
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={
                                      session.mentorship.mentor.avatar ||
                                      undefined
                                    }
                                    alt={
                                      session.mentorship.mentor.name || "Mentor"
                                    }
                                  />
                                  <AvatarFallback>
                                    {session.mentorship.mentor.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("") || "M"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {session.mentorship.mentor.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.mentorship.mentor.specialty ||
                                      "Mentor"}
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
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(session.scheduledFor),
                                  "h:mm a"
                                )}
                              </span>
                            </div>

                            {session.status ===
                              MentorSessionStatus.DECLINED && (
                                <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded-md text-red-800">
                                  <p className="text-sm">
                                    <XCircle className="h-4 w-4 inline mr-1" />
                                    This session request was declined by the
                                    mentor
                                  </p>
                                  <p className="text-xs mt-1">
                                    The mentor is unavailable at this time. Please
                                    book at a different time.
                                  </p>
                                </div>
                              )}
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4 bg-muted/50 gap-4">
                          {session.status !== MentorSessionStatus.DECLINED ? (
                            <>
                              <Button
                                variant="outline"
                                className="flex-1"
                                onClick={() => openRescheduleDialog(session)}
                              >
                                Reschedule
                              </Button>
                              <Button
                                variant="destructive"
                                className="flex-1"
                                onClick={() => openCancelDialog(session)}
                              >
                                Cancel
                              </Button>
                            </>
                          ) : (
                            <Button
                              className="flex-1"
                              onClick={() => {
                                if (session.mentorship?.mentor) {
                                  handleBookSession(session.mentorship.mentor);
                                }
                              }}
                            >
                              Book New Session
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No upcoming sessions. Book a session with one of your
                    mentors.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="declined">
              <div className="flex flex-col gap-4">
                {upcomingSessions.filter(
                  (session) => session.status === MentorSessionStatus.DECLINED
                ).length > 0 ? (
                  upcomingSessions
                    .filter(
                      (session) =>
                        session.status === MentorSessionStatus.DECLINED
                    )
                    .map((session) => (
                      <Card key={session.id} className="border-muted border-2">
                        <CardHeader>
                          <div className="flex justify-between items-center">
                            <CardTitle>Declined Session</CardTitle>
                            <Badge
                              variant={getSessionBadgeVariant(session.status)}
                            >
                              {session.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4 pb-4">
                            {session.mentorship?.mentor && (
                              <>
                                <Avatar className="h-10 w-10">
                                  <AvatarImage
                                    src={
                                      session.mentorship.mentor.avatar ||
                                      undefined
                                    }
                                    alt={
                                      session.mentorship.mentor.name || "Mentor"
                                    }
                                  />
                                  <AvatarFallback>
                                    {session.mentorship.mentor.name
                                      ?.split(" ")
                                      .map((n: string) => n[0])
                                      .join("") || "M"}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <p className="font-medium">
                                    {session.mentorship.mentor.name}
                                  </p>
                                  <p className="text-sm text-muted-foreground">
                                    {session.mentorship.mentor.specialty ||
                                      "Mentor"}
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
                              <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                              <span>
                                {format(
                                  new Date(session.scheduledFor),
                                  "h:mm a"
                                )}
                              </span>
                            </div>
                            <div className="mt-2 p-2 bg-muted rounded-md border border-muted">
                              <p className="text-sm">
                                <XCircle className="h-4 w-4 inline mr-1" />
                                This session request was declined
                              </p>
                              <p className="text-xs mt-1">
                                Consider booking at a different time or with
                                another mentor.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                        <CardFooter className="border-t pt-4 bg-muted/50 gap-4">
                          <Button
                            className="flex-1"
                            onClick={() => {
                              // Ensure mentor is not null before passing to handler
                              const mentor = session.mentorship?.mentor;
                              if (mentor) {
                                handleBookSession(mentor);
                              }
                            }}
                          >
                            Book New Session
                          </Button>
                        </CardFooter>
                      </Card>
                    ))
                ) : (
                  <div className="text-center py-12 text-muted-foreground">
                    No declined sessions.
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="history">
              <div className="flex flex-col gap-4">
                {pastSessions.length > 0 ? (
                  pastSessions.map((session) => (
                    <Card key={session.id}>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Past Session</CardTitle>
                          <Badge
                            variant={getSessionBadgeVariant(session.status)}
                          >
                            {session.status}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center gap-4 pb-4">
                          {session.mentorship?.mentor && (
                            <>
                              <Avatar className="h-10 w-10">
                                <AvatarImage
                                  src={
                                    session.mentorship.mentor.avatar ||
                                    undefined
                                  }
                                  alt={
                                    session.mentorship.mentor.name || "Mentor"
                                  }
                                />
                                <AvatarFallback>
                                  {session.mentorship.mentor.name
                                    ?.split(" ")
                                    .map((n: string) => n[0])
                                    .join("") || "M"}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <p className="font-medium">
                                  {session.mentorship.mentor.name}
                                </p>
                                <p className="text-sm text-muted-foreground">
                                  {session.mentorship.mentor.specialty ||
                                    "Mentor"}
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
                            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
                            <span>
                              {format(new Date(session.scheduledFor), "h:mm a")}
                            </span>
                          </div>
                          {session.status === MentorSessionStatus.CANCELLED && (
                            <div className="mt-2 p-2 bg-muted rounded-md border border-muted text-muted-foreground">
                              <p className="text-sm">
                                <XCircle className="h-4 w-4 inline mr-1" />
                                {session.mentorship?.menteeId === currentUserId
                                  ? "You cancelled this session"
                                  : session.mentorship?.mentorId ===
                                    currentUserId
                                    ? "You cancelled this session"
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

      {/* Add the booking dialog */}
      {selectedMentor && (
        <MentorBookingDialog
          mentor={selectedMentor}
          open={dialogOpen}
          onOpenChange={(open) => {
            setDialogOpen(open);
            if (!open) {
              // When dialog closes, reload mentorships data
              loadMentorships();
            }
          }}
          onSuccess={handleBookingComplete}
        />
      )}

      {/* Cancel confirmation dialog */}
      <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Cancel Session</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to cancel this mentorship session? This
              action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>No, Keep It</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleCancelSession}
              className="bg-destructive text-destructive-foreground"
            >
              Yes, Cancel Session
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Reschedule dialog */}
      <Dialog
        open={rescheduleDialogOpen}
        onOpenChange={setRescheduleDialogOpen}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl">Reschedule Session</DialogTitle>
            <DialogDescription>
              Select a new date and time for your session
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Date</label>
              <CalendarComponent
                mode="single"
                selected={newDate}
                onSelect={setNewDate}
                disabled={(date) =>
                  date < new Date() ||
                  date.getDay() === 0 ||
                  date.getDay() === 6
                }
                className="border rounded-md p-3"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select New Time</label>
              <Select value={newTimeSlot} onValueChange={setNewTimeSlot}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a time slot" />
                </SelectTrigger>
                <SelectContent>
                  {TIME_SLOTS.map((slot) => (
                    <SelectItem key={slot} value={slot}>
                      {slot}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setRescheduleDialogOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleRescheduleSession}
              disabled={!newDate || !newTimeSlot || isSubmitting}
            >
              {isSubmitting ? "Rescheduling..." : "Reschedule Session"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
