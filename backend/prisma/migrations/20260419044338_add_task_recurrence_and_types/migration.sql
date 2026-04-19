-- AlterTable
ALTER TABLE "tasks" ADD COLUMN     "categoryType" TEXT NOT NULL DEFAULT 'MISC',
ADD COLUMN     "editable" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "lastCompletedDate" TIMESTAMP(3),
ADD COLUMN     "recurrence" TEXT NOT NULL DEFAULT 'NONE';
