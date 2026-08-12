export interface ShortLink {
  id: string;
  slug: string;
  destinationUrl: string;
  title?: string;
  description?: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  clicks: number;
  isActive: boolean;
  expiresAt?: string | null; // ISO String or null
  password?: string | null; // Plain text or hashed password
  tags?: string[];
}

export interface LinkClickLog {
  timestamp: string;
  referer?: string;
  userAgent?: string;
  country?: string;
}

export interface CreateLinkInput {
  destinationUrl: string;
  slug?: string;
  title?: string;
  description?: string;
  expiresAt?: string | null;
  password?: string | null;
  tags?: string[];
}

export interface UpdateLinkInput {
  destinationUrl?: string;
  title?: string;
  description?: string;
  isActive?: boolean;
  expiresAt?: string | null;
  password?: string | null;
  tags?: string[];
}
