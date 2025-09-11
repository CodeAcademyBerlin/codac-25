/*
  Warnings:

  - The values [DOCUMENT] on the enum `ResourceType` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the column `documentId` on the `comments` table. All the data in the column will be lost.
  - You are about to drop the `document_collaborators` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `document_versions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `documents` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `favorites` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `suggestions` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "public"."ConversationType" AS ENUM ('DIRECT', 'GROUP', 'CHANNEL');

-- CreateEnum
CREATE TYPE "public"."ParticipantRole" AS ENUM ('MEMBER', 'ADMIN', 'OWNER');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."ResourceType_new" AS ENUM ('LINK', 'FILE', 'VIDEO');
ALTER TABLE "public"."assignment_resources" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."lesson_resources" ALTER COLUMN "type" DROP DEFAULT;
ALTER TABLE "public"."lesson_resources" ALTER COLUMN "type" TYPE "public"."ResourceType_new" USING ("type"::text::"public"."ResourceType_new");
ALTER TABLE "public"."assignment_resources" ALTER COLUMN "type" TYPE "public"."ResourceType_new" USING ("type"::text::"public"."ResourceType_new");
ALTER TYPE "public"."ResourceType" RENAME TO "ResourceType_old";
ALTER TYPE "public"."ResourceType_new" RENAME TO "ResourceType";
DROP TYPE "public"."ResourceType_old";
ALTER TABLE "public"."assignment_resources" ALTER COLUMN "type" SET DEFAULT 'LINK';
ALTER TABLE "public"."lesson_resources" ALTER COLUMN "type" SET DEFAULT 'LINK';
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."comments" DROP CONSTRAINT "comments_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_collaborators" DROP CONSTRAINT "document_collaborators_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_collaborators" DROP CONSTRAINT "document_collaborators_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."document_versions" DROP CONSTRAINT "document_versions_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_authorId_fkey";

-- DropForeignKey
ALTER TABLE "public"."documents" DROP CONSTRAINT "documents_parentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."favorites" DROP CONSTRAINT "favorites_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."favorites" DROP CONSTRAINT "favorites_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."suggestions" DROP CONSTRAINT "suggestions_documentId_fkey";

-- DropForeignKey
ALTER TABLE "public"."suggestions" DROP CONSTRAINT "suggestions_userId_fkey";

-- AlterTable
ALTER TABLE "public"."comments" DROP COLUMN "documentId";

-- DropTable
DROP TABLE "public"."document_collaborators";

-- DropTable
DROP TABLE "public"."document_versions";

-- DropTable
DROP TABLE "public"."documents";

-- DropTable
DROP TABLE "public"."favorites";

-- DropTable
DROP TABLE "public"."suggestions";

-- DropEnum
DROP TYPE "public"."DocumentPermission";

-- DropEnum
DROP TYPE "public"."DocumentType";

-- DropEnum
DROP TYPE "public"."SuggestionStatus";

-- DropEnum
DROP TYPE "public"."SuggestionType";

-- CreateTable
CREATE TABLE "public"."conversations" (
    "id" TEXT NOT NULL,
    "type" "public"."ConversationType" NOT NULL DEFAULT 'DIRECT',
    "name" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."conversation_participants" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "public"."ParticipantRole" NOT NULL DEFAULT 'MEMBER',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3),

    CONSTRAINT "conversation_participants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."chat_messages" (
    "id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "roomName" TEXT,
    "userName" TEXT,

    CONSTRAINT "chat_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "conversation_participants_conversationId_userId_key" ON "public"."conversation_participants"("conversationId", "userId");

-- CreateIndex
CREATE INDEX "chat_messages_conversationId_idx" ON "public"."chat_messages"("conversationId");

-- CreateIndex
CREATE INDEX "chat_messages_createdAt_idx" ON "public"."chat_messages"("createdAt");

-- CreateIndex
CREATE INDEX "chat_messages_userId_idx" ON "public"."chat_messages"("userId");

-- AddForeignKey
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."conversation_participants" ADD CONSTRAINT "conversation_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "public"."conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."chat_messages" ADD CONSTRAINT "chat_messages_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
