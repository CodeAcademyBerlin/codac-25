"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { UserWithMentorCounts } from "@/actions/mentorship/get-mentors";
import { createMentorshipBooking } from "@/actions/mentorship/create-booking";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface MentorBookingDialogProps {
  mentor: UserWithMentorCounts;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

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

export function MentorBookingDialog({
  mentor,
  open,
  onOpenChange,
  onSuccess,
}: MentorBookingDialogProps) {
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [timeSlot, setTimeSlot] = useState<string | undefined>(undefined);
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!date || !timeSlot) {
      setError("Please select both a date and time for your session");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);

      // Format the booking date and time
      const bookingDateTime = new Date(date);
      const [hours, minutes, period] = timeSlot.split(/[:\s]/);
      let hour = parseInt(hours);
      if (period === "PM" && hour !== 12) hour += 12;
      if (period === "AM" && hour === 12) hour = 0;
      bookingDateTime.setHours(hour, parseInt(minutes));

      const result = await createMentorshipBooking({
        mentorId: mentor.id,
        scheduledFor: bookingDateTime,
        message: message.trim(),
      });

      if (result.success) {
        setSuccessMessage("Your booking has been submitted successfully!");
        // Reset form after successful submission
        setDate(undefined);
        setTimeSlot(undefined);
        setMessage("");

        // Close dialog after 2 seconds and trigger success callback
        setTimeout(() => {
          onOpenChange(false);
          setSuccessMessage(null);
          if (onSuccess) {
            onSuccess();
          }
        }, 2000);
      } else {
        setError(result.error || "Failed to book session. Please try again.");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setDate(undefined);
    setTimeSlot(undefined);
    setMessage("");
    setError(null);
    setSuccessMessage(null);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(isOpen) => {
        if (!isOpen) resetForm();
        onOpenChange(isOpen);
      }}
    >
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Book a Session</DialogTitle>
          <DialogDescription>
            Schedule a mentoring session with {mentor.name}
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center space-x-4 py-4">
          <Avatar className="h-12 w-12">
            <AvatarImage
              src={mentor.avatar || undefined}
              alt={mentor.name || "Mentor"}
            />
            <AvatarFallback>
              {mentor.name
                ?.split(" ")
                .map((n) => n[0])
                .join("") || "M"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-medium">{mentor.name}</h3>
            <p className="text-sm text-muted-foreground">
              {mentor.bio
                ? mentor.bio.substring(0, 60) + "..."
                : "No bio available"}
            </p>
          </div>
        </div>

        {successMessage ? (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 my-4 text-green-800">
            {successMessage}
          </div>
        ) : (
          <div className="space-y-6 py-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Select Date</label>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                disabled={(date) =>
                  date < new Date() ||
                  date.getDay() === 0 ||
                  date.getDay() === 6
                }
                className="border rounded-md p-3"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Select Time</label>
              <Select value={timeSlot} onValueChange={setTimeSlot}>
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

            <div className="space-y-2">
              <label className="text-sm font-medium">Message (Optional)</label>
              <Textarea
                placeholder="Let your mentor know what you'd like to discuss..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
              />
            </div>

            {error && (
              <div className="bg-destructive/10 p-3 rounded-md text-destructive text-sm">
                {error}
              </div>
            )}
          </div>
        )}

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          {!successMessage && (
            <Button
              onClick={handleSubmit}
              disabled={!date || !timeSlot || isSubmitting}
              className="gap-2"
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  Book Session
                  <ChevronRight className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
