import { FarmerVerificationStatus, Prisma, ProjectStatus, Role } from "@prisma/client";
import type { Request } from "express";
import { prisma } from "../../lib/prisma.js";
import { toAssetUrl } from "../../lib/public-url.js";
import { dec, decStr } from "../../lib/serialize.js";
import { env } from "../../config/env.js";

export type ProjectDto = ReturnType<typeof mapProject>;

function mapProject(
  p: {
    id: string;
    title: string;
    description: string;
    category: string;
    farmPlan: string;
    landPhotoUrls: string[];
    idDocumentUrl: string | null;
    fundingGoal: Prisma.Decimal;
    raisedAmount: Prisma.Decimal;
    expectedRoi: Prisma.Decimal;
    durationDays: number;
    startDate: Date;
    endDate: Date;
    status: ProjectStatus;
    verifiedAt: Date | null;
    createdAt: Date;
    farmer?: {
      farmName: string;
      location: string;
      verificationStatus: FarmerVerificationStatus;
      user?: { fullName: string; country: string | null };
    };
  },
  req?: Pick<Request, "protocol" | "get">,
) {
  const goal = dec(p.fundingGoal);
  const raised = dec(p.raisedAmount);
  return {
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    farmPlan: p.farmPlan,
    landPhotoUrls: p.landPhotoUrls.map((u) => toAssetUrl(u, req)),
    idDocumentUrl: p.idDocumentUrl ? toAssetUrl(p.idDocumentUrl, req) : null,
    fundingGoal: decStr(p.fundingGoal),
    raisedAmount: decStr(p.raisedAmount),
    expectedRoi: decStr(p.expectedRoi),
    durationDays: p.durationDays,
    startDate: p.startDate.toISOString().slice(0, 10),
    endDate: p.endDate.toISOString().slice(0, 10),
    status: p.status.toLowerCase(),
    verifiedAt: p.verifiedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
    percentFunded: goal > 0 ? Math.min(100, Math.round((raised / goal) * 100)) : 0,
    farmer: p.farmer
      ? {
          farmName: p.farmer.farmName,
          location: p.farmer.location,
          verificationStatus: p.farmer.verificationStatus.toLowerCase(),
          ownerName: p.farmer.user?.fullName,
          country: p.farmer.user?.country,
        }
      : undefined,
  };
}

const projectInclude = {
  farmer: {
    include: { user: { select: { fullName: true, country: true } } },
  },
} as const;

export async function listMarketplace(req: Pick<Request, "protocol" | "get">) {
  const rows = await prisma.project.findMany({
    where: { status: ProjectStatus.ACTIVE },
    include: projectInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((p) => mapProject(p, req));
}

/** Top open listings for landing: highest % funded, excluding fully funded. */
export async function listMarketplaceFeatured(req: Pick<Request, "protocol" | "get">, limit = 3) {
  const rows = await prisma.project.findMany({
    where: { status: ProjectStatus.ACTIVE },
    include: projectInclude,
  });
  return rows
    .filter((p) => dec(p.raisedAmount) < dec(p.fundingGoal))
    .map((p) => mapProject(p, req))
    .sort((a, b) => b.percentFunded - a.percentFunded)
    .slice(0, limit);
}

export async function getProject(id: string, req: Pick<Request, "protocol" | "get">) {
  const p = await prisma.project.findUnique({
    where: { id },
    include: projectInclude,
  });
  if (!p) throw new Error("NOT_FOUND");
  return mapProject(p, req);
}

export async function listFarmerProjects(userId: string, req: Pick<Request, "protocol" | "get">) {
  const profile = await prisma.farmerProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("NOT_FARMER");

  const rows = await prisma.project.findMany({
    where: { farmerId: profile.id },
    include: projectInclude,
    orderBy: { createdAt: "desc" },
  });
  return rows.map((p) => mapProject(p, req));
}

export async function createProject(
  userId: string,
  input: {
    title: string;
    description: string;
    category: string;
    farmPlan: string;
    landPhotoUrls: string[];
    idDocumentUrl?: string;
    fundingGoal: number;
    expectedRoi: number;
    durationDays: number;
    startDate: string;
    endDate: string;
  },
  req: Pick<Request, "protocol" | "get">,
) {
  const profile = await prisma.farmerProfile.findUnique({ where: { userId } });
  if (!profile) throw new Error("NOT_FARMER");

  if (profile.verificationStatus !== FarmerVerificationStatus.VERIFIED) {
    if (env.AUTO_APPROVE_FARMERS) {
      await prisma.farmerProfile.update({
        where: { id: profile.id },
        data: { verificationStatus: FarmerVerificationStatus.VERIFIED },
      });
    } else {
      throw new Error("FARMER_NOT_VERIFIED");
    }
  }

  const start = new Date(input.startDate);
  const end = new Date(input.endDate);
  if (end <= start) throw new Error("INVALID_DATES");

  const autoApprove = env.AUTO_APPROVE_PROJECTS;
  const status = autoApprove ? ProjectStatus.ACTIVE : ProjectStatus.PENDING_REVIEW;
  const verifiedAt = autoApprove ? new Date() : null;

  const row = await prisma.project.create({
    data: {
      farmerId: profile.id,
      title: input.title.trim(),
      description: input.description.trim(),
      category: input.category.trim(),
      farmPlan: input.farmPlan.trim(),
      landPhotoUrls: input.landPhotoUrls,
      idDocumentUrl: input.idDocumentUrl,
      fundingGoal: input.fundingGoal,
      expectedRoi: input.expectedRoi,
      durationDays: input.durationDays,
      startDate: start,
      endDate: end,
      status,
      verifiedAt,
    },
    include: projectInclude,
  });

  return mapProject(row, req);
}

export async function approveProject(projectId: string, req: Pick<Request, "protocol" | "get">) {
  const row = await prisma.project.update({
    where: { id: projectId },
    data: { status: ProjectStatus.ACTIVE, verifiedAt: new Date() },
    include: projectInclude,
  });
  return mapProject(row, req);
}

export async function verifyFarmer(farmerProfileId: string) {
  return prisma.farmerProfile.update({
    where: { id: farmerProfileId },
    data: { verificationStatus: FarmerVerificationStatus.VERIFIED },
  });
}

export async function ensureFarmerVerified(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { farmerProfile: true },
  });
  if (!user || user.role !== Role.FARMER || !user.farmerProfile) {
    throw new Error("NOT_FARMER");
  }
  if (user.farmerProfile.verificationStatus !== FarmerVerificationStatus.VERIFIED) {
    if (env.AUTO_APPROVE_FARMERS) {
      await prisma.farmerProfile.update({
        where: { id: user.farmerProfile.id },
        data: { verificationStatus: FarmerVerificationStatus.VERIFIED },
      });
    } else {
      throw new Error("FARMER_NOT_VERIFIED");
    }
  }
  return user.farmerProfile;
}
