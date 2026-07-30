export interface SocialItem {
  social_master_id: number;
  socialName: string;
  option1: string;
  option2: string;
  notes?: string | null;
  status: number;
  createdAt?: string;
  createdBy?: string | null;
  updatedAt?: string;
  updatedBy?: string | null;
}

export interface CreateSocialPayload {
  socialName: string;
  option1: string;
  option2: string;
  notes?: string;
  status?: number;
}

export type UpdateSocialPayload = Partial<CreateSocialPayload>;
