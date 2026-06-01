export type Project = {
  id: string;
  title: string;
  description: string;
  category: string;
  farmPlan: string;
  landPhotoUrls: string[];
  idDocumentUrl: string | null;
  fundingGoal: string;
  raisedAmount: string;
  expectedRoi: string;
  durationDays: number;
  startDate: string;
  endDate: string;
  status: string;
  percentFunded: number;
  verifiedAt: string | null;
  farmer?: {
    farmName: string;
    location: string;
    verificationStatus: string;
    ownerName?: string;
    country?: string | null;
  };
};

export type Investment = {
  id: string;
  amountUsdc: string;
  stellarTxHash: string;
  status: string;
  createdAt: string;
  project: { id: string; title: string; status: string; farmName: string };
};
