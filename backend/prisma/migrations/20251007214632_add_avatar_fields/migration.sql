-- AlterTable
ALTER TABLE "User" ADD COLUMN     "avatarSeed" TEXT,
ADD COLUMN     "avatarStyle" TEXT NOT NULL DEFAULT 'initials';
