export type BlogStatus = "DRAFT" | "PUBLISHED" | "SCHEDULED" | "ARCHIVED";
export type BlogVisibility = "PUBLIC" | "PRIVATE";

export type BlogAuthor = {
  id: string | null;
  name: string;
  avatar: string | null;
  isCustom: boolean;
};

export type BlogTaxonomy = { id: string; name: string; slug: string };

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  status: BlogStatus;
  visibility: BlogVisibility;
  publishedAt: string | null;
  featuredImage: string | null;

  author: BlogAuthor;
  authorId: string | null;
  customAuthorName: string | null;
  customAuthorAvatar: string | null;

  category: BlogTaxonomy | null;
  categoryId: string | null;
  tags: BlogTaxonomy[];

  metaTitle: string | null;
  metaDescription: string | null;
  focusKeyword: string | null;
  keywords: string[];
  canonicalUrl: string | null;
  seoScore: number;

  views: number;
  wordCount: number;
  isFeatured: boolean;
  allowComments: boolean;
  showAds: boolean;

  createdAt: string;
  updatedAt: string;
};

export type BlogCategory = {
  id: string;
  name: string;
  slug: string;
  postCount: number;
};

export type BlogTag = BlogCategory;

export type BlogStats = {
  totalPosts: number;
  drafts: number;
  published: number;
  publishedThisMonth: number;
  totalViews: number;
  viewsChangePercent: number | null;
  avgSeoScore: number;
};

export type BlogAuthorOption = {
  id: string;
  name: string;
  email: string | null;
  avatar: string | null;
  role: string;
};

export type SeoSuggestion = {
  metaTitle: string;
  metaDescription: string;
  focusKeyword: string;
  keywords: string[];
  source: "anthropic" | "openai-compatible" | "fallback";
};

// ------------------------------------ Ads ----------------------------------

export type AdType = "INTERNAL" | "SPONSORED";

export type AdStatus = "DRAFT" | "ACTIVE" | "PAUSED" | "SCHEDULED" | "EXPIRED";

export type AdPlacementRef = {
  id: string;
  key: string;
  name: string;
  width: number | null;
  height: number | null;
  isNative: boolean;
};

export type Ad = {
  id: string;
  name: string;
  type: AdType;
  sponsorName: string | null;
  sponsorEmail: string | null;
  placement: AdPlacementRef | null;
  placementId: string | null;
  status: AdStatus;
  /** What the operator chose, before the date window is applied. */
  storedStatus: AdStatus;
  imageUrl: string | null;
  htmlSnippet: string | null;
  targetUrl: string | null;
  openInNewTab: boolean;
  priority: number;
  frequencyCap: number | null;
  utmSource: string | null;
  utmMedium: string | null;
  utmCampaign: string | null;
  categories: BlogTaxonomy[];
  startsAt: string | null;
  endsAt: string | null;
  impressions: number;
  clicks: number;
  ctr: number;
  createdAt: string;
  updatedAt: string;
};

export type AdStats = {
  activeAds: number;
  scheduledAds: number;
  totalAds: number;
  impressions30d: number;
  clicks30d: number;
  impressionsChangePercent: number | null;
  clicksChangePercent: number | null;
  ctr30d: number;
};

export type AdPlacementSlot = {
  id: string;
  key: string;
  name: string;
  description: string | null;
  width: number | null;
  height: number | null;
  isNative: boolean;
  isSystem: boolean;
  adCount: number;
  currentAd: {
    id: string;
    name: string;
    type: AdType;
    status: AdStatus;
    sponsorName: string | null;
  } | null;
};
