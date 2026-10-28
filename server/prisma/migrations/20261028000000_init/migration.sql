-- CreateTable
CREATE TABLE "GuestSession" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "lastSeenAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GuestSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Roadmap" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "goalSummary" TEXT NOT NULL,
    "strategyType" TEXT NOT NULL,
    "strategyName" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "intendedProfile" TEXT NOT NULL,
    "expectedOutcome" TEXT NOT NULL,
    "estimatedTotalEffort" TEXT NOT NULL,
    "tradeOffs" TEXT NOT NULL,
    "assumptions" JSONB NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Roadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "shortDescription" TEXT NOT NULL,
    "actionableInstructions" TEXT NOT NULL,
    "completionCriterion" TEXT NOT NULL,
    "estimatedEffort" TEXT NOT NULL,
    "iconCategory" TEXT NOT NULL,
    "resourceSuggestions" JSONB NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Achievement" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "roadmapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "badgeLabel" TEXT NOT NULL,
    "constellationTheme" TEXT NOT NULL,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "earnedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Achievement_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AiGenerationUsage" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "goalHash" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "succeeded" BOOLEAN NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AiGenerationUsage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Roadmap_sessionId_archived_createdAt_idx" ON "Roadmap"("sessionId", "archived", "createdAt");

-- CreateIndex
CREATE INDEX "Milestone_roadmapId_position_idx" ON "Milestone"("roadmapId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Milestone_roadmapId_position_key" ON "Milestone"("roadmapId", "position");

-- CreateIndex
CREATE UNIQUE INDEX "Achievement_roadmapId_key" ON "Achievement"("roadmapId");

-- CreateIndex
CREATE INDEX "Achievement_sessionId_featured_idx" ON "Achievement"("sessionId", "featured");

-- CreateIndex
CREATE INDEX "AiGenerationUsage_sessionId_succeeded_createdAt_idx" ON "AiGenerationUsage"("sessionId", "succeeded", "createdAt");

-- AddForeignKey
ALTER TABLE "Roadmap" ADD CONSTRAINT "Roadmap_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Achievement" ADD CONSTRAINT "Achievement_roadmapId_fkey" FOREIGN KEY ("roadmapId") REFERENCES "Roadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AiGenerationUsage" ADD CONSTRAINT "AiGenerationUsage_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "GuestSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;