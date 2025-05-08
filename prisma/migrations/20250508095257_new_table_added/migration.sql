-- CreateTable
CREATE TABLE "fail" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "failedAttempts" INTEGER NOT NULL DEFAULT 1,
    "lastLogin" TIMESTAMP(3),
    "Locked" TIMESTAMP(3),

    CONSTRAINT "fail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "fail" ADD CONSTRAINT "fail_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
