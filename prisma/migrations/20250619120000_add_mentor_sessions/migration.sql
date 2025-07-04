-- CreateTable
CREATE TABLE "mentor_sessions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "scheduledFor" DATETIME NOT NULL,
    "completedAt" DATETIME,
    "notes" TEXT,
    "feedback" TEXT,
    "mentorshipId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "mentor_sessions_mentorshipId_fkey" FOREIGN KEY ("mentorshipId") REFERENCES "mentorships" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- AlterTable
-- Add MentorSessionStatus enum
-- This is already handled by using TEXT fields with constraints in SQLite 