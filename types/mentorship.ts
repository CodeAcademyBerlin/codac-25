import { UserWithMentorCounts } from "@/actions/mentorship/get-mentors";

export enum MentorSessionStatus {
  PENDING = "PENDING",
  CONFIRMED = "CONFIRMED",
  COMPLETED = "COMPLETED",
  CANCELLED = "CANCELLED",
  DECLINED = "DECLINED",
}

export interface UserWithMenteeInfo {
  id: string;
  name?: string | null;
  email?: string | null;
  avatar?: string | null;
  bio?: string | null;
  cohortId?: string | null;
  cohort?: {
    name: string;
    slug: string;
  } | null;
}

export interface MentorSession {
  id: string;
  status: MentorSessionStatus;
  scheduledFor: Date;
  completedAt?: Date | null;
  notes?: string | null;
  feedback?: string | null;
  mentorshipId: string;
  createdAt: Date;
  updatedAt: Date;
  rescheduleCount?: number;
  // Relations
  mentorship?: Mentorship;
}

export enum MentorshipStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  COMPLETED = "COMPLETED",
  DECLINED = "DECLINED",
}

export interface Mentorship {
  id: string;
  status: MentorshipStatus;
  message?: string | null;
  mentorId: string;
  menteeId: string;
  createdAt: Date;
  acceptedAt?: Date | null;
  endedAt?: Date | null;
  // Relations
  mentor?: UserWithMentorCounts;
  mentee?: UserWithMenteeInfo;
  sessions?: MentorSession[];
}

export interface MentorBookingFormData {
  mentorId: string;
  scheduledFor: Date;
  message?: string;
}
