export interface ProductImage {
  id: string;
  productId: string;
  url: string;
}

export interface ProductCategory {
  id: string;
  productId: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    parentId: string | null;
  };
}

export interface ProductSubCategory {
  id: string;
  productId: string;
  subCategoryId: string;
  subCategory: {
    id: string;
    name: string;
    parentId: string | null;
  };
}

export interface ProductVariant {
  id: string;
  size?: string;
  color?: string;
  stock?: number;
  price?: number;
  quantity: number;
  /** Per-variant SKU, derived from the product SKU or typed by an admin. */
  sku?: string | null;
}

export interface AdditionalInfo {
  id: string;
  label: string;
  value: string;
}

export interface ProductTag {
  id: string;
  name: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  sku: string;
  regularPrice: number;
  salePrice: number | null;
  stockQuantity: number | null;
  stockStatus: "IN_STOCK" | "OUT_OF_STOCK" | "LOW_STOCK";
  shortDescription: string | null;
  fullDescription: string | null;
  sizeGuidImage: string | null;
  thumbnailImage: string | null;
  isDeleted: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  categories: ProductCategory[];
  subCategories: ProductSubCategory[];
  variants: ProductVariant[];
  images: ProductImage[];
  additionalInformation: AdditionalInfo[];
  tags: ProductTag[];
}

export interface ProductApiResponse {
  success: boolean;
  message: string;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
  data: Product[];
}