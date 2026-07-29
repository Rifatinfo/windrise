
"use client";

import { serverFetch } from "@/lib/server-fetch";
import { Toast } from "@/components/shared/Toast/Toast";
import CategoriesSection from "@/components/modules/addProduct/CategoriesSection";
import { TagsSection } from "@/components/modules/addProduct/TagsSection";
import { AdditionalInfoSection, InfoItem } from "@/components/modules/addProduct/AdditionalInfoSection";
import { Variant, VariantsSection } from "@/components/modules/addProduct/VariantsSection";
import { BasicDetailsCard, StockStatus } from "@/components/modules/addProduct/BasicDetailsCard";
import { Button } from "@/components/ui/button";
import Spinner from "@/components/shared/Spinner";
import { ArrowLeft, Eye, Save } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import ImageUploadUpdate from "../addProduct/ImageUploadUpdate";
import Swal from "sweetalert2";

type CategoryPayload = {
    categories: { categoryId: string }[];
    subCategories: { subCategoryId: string }[];
};

const resolveUrl = (url: any): string | null => {
    if (!url || typeof url !== "string") return null;
    if (url.startsWith("http")) return url;
    if (url.startsWith("/")) return url;
    return `${process.env.NEXT_PUBLIC_API_URL}${url}`;
};

const ProductUpdateClient = ({ product, slug }: any) => {
    const [isSaving, setIsSaving] = useState(false);

    const [basicDetails, setBasicDetails] = useState({
        name: "", regularPrice: "", salePrice: "",
        shortDescription: "", fullDescription: "",
        sku: "", stockQuantity: 0, stockStatus: StockStatus.IN_STOCK,
    });

    const [variants, setVariants] = useState<Variant[]>([]);
    const [additionalInfo, setAdditionalInfo] = useState<InfoItem[]>([]);
    const [tags, setTags] = useState<string[]>([]);

    const [thumbnailImage, setThumbnailImage] = useState<File | null>(null);
    const [sizeGuideImage, setSizeGuideImage] = useState<File | null>(null);
    const [galleryImages, setGalleryImages] = useState<File[]>([]);

    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
    const [sizeGuidePreview, setSizeGuidePreview] = useState<string | null>(null);
    const [galleryPreview, setGalleryPreview] = useState<string[]>([]);

    // Stores RAW original URLs from backend (not resolved)
    // Used directly in payload — ref so handleUpdate always reads fresh value
    const rawOriginalUrlsRef = useRef<string[]>([]);

    const [categoryPayload, setCategoryPayload] = useState<CategoryPayload>({
        categories: [], subCategories: [],
    });

    useEffect(() => {
        if (!product) return;

        setBasicDetails({
            name: product.name ?? "", regularPrice: product.regularPrice ?? "",
            salePrice: product.salePrice ?? "", shortDescription: product.shortDescription ?? "",
            fullDescription: product.fullDescription ?? "", sku: product.sku ?? "",
            stockQuantity: product.stockQuantity ?? 0,
            stockStatus: product.stockStatus ?? StockStatus.IN_STOCK,
        });

        setVariants(product.variants || []);
        setAdditionalInfo(product.additionalInformation || []);
        setTags(product.tags || []);

        setCategoryPayload({
            categories: product.categories?.map((c: any) => ({ categoryId: c.categoryId || c.category?.id })) || [],
            subCategories: product.subCategories?.map((s: any) => ({ subCategoryId: s.subCategoryId || s.subCategory?.id })) || [],
        });

        setThumbnailPreview(resolveUrl(product.thumbnailImage));
        setSizeGuidePreview(resolveUrl(product.sizeGuideImage ?? product.sizeGuidImage));

        // Step 1: extract raw URLs exactly as backend gave them
        const rawUrls = (product.images || [])
            .map((img: any) =>
                typeof img === "string"
                    ? img
                    : (img?.url ?? img?.imageUrl ?? img?.image ?? null)
            )
            .filter(Boolean) as string[];

        // Step 2: store raw for sending to backend
        rawOriginalUrlsRef.current = rawUrls;

        // Step 3: resolve only for display purposes
        setGalleryPreview(rawUrls.map((url) => resolveUrl(url)).filter(Boolean) as string[]);

        setThumbnailImage(null);
        setSizeGuideImage(null);
        setGalleryImages([]);
    }, [product]);
   const validateForm = () => {

    //============= Category required ==========================//
    if (!categoryPayload.categories || categoryPayload.categories.length === 0) {
        Swal.fire({
            icon: "error",
            title: "Missing Category",
            text: "Please select at least one category!",
            confirmButtonText: "Go it",
            customClass: {
            confirmButton: "bg-black text-white px-12 py-2 rounded cursor-pointer",
        },
        buttonsStyling: false,
        });
        return false;
    }

    // ============= Subcategory required =====================//
    if (
        !categoryPayload.subCategories ||
        categoryPayload.subCategories.length === 0
    ) {
        Swal.fire({
            icon: "error",
            title: "Missing Subcategory",
            text: "Please select at least one subcategory!",
            confirmButtonText: "Go it",
            customClass: {
            confirmButton: "bg-black text-white px-12 py-2 rounded cursor-pointer",
        },
        buttonsStyling: false,
        });
        return false;
    }

    return true;
};
const resetForm = () => {
    setBasicDetails({
        name: "",
        regularPrice: "",
        salePrice: "",
        shortDescription: "",
        fullDescription: "",
        sku: "",
        stockQuantity: 0,
        stockStatus: StockStatus.IN_STOCK,
    });

    setVariants([]);
    setAdditionalInfo([]);
    setTags([]);

    setGalleryImages([]);
    setThumbnailImage(null);
    setSizeGuideImage(null);

    setCategoryPayload({
        categories: [],
        subCategories: [],
    });

    //  also clear previews (important)
    setThumbnailPreview(null);
    setSizeGuidePreview(null);
    setGalleryPreview([]);

    //  clear original images ref
    rawOriginalUrlsRef.current = [];
};
    const handleUpdate = async () => {
        //  MUST VALIDATE FIRST
    if (!validateForm()) return;
    
        setIsSaving(true);
        try {
            const payload: Record<string, any> = {
                name: basicDetails.name,
                sku: basicDetails.sku,
                regularPrice: Number(basicDetails.regularPrice),
                salePrice: Number(basicDetails.salePrice),
                stockQuantity: basicDetails.stockQuantity,
                stockStatus: basicDetails.stockStatus,
                shortDescription: basicDetails.shortDescription,
                fullDescription: basicDetails.fullDescription,
                categories: categoryPayload.categories.map((c) => c.categoryId),
                subCategories: categoryPayload.subCategories.map((s) => s.subCategoryId),
                tags: tags.map((t: any) =>
                    typeof t === "string" ? t : t.name
                ),
                variants: variants.map((v) => ({
                    color: v.color, size: v.size, quantity: Number(v.quantity),
                })),
                additionalInformation: additionalInfo,
            };

            // Send the list of original gallery images to KEEP.
            // The backend will delete any existing images NOT in this list.
            // When user removes a preview, onGalleryPreviewChange updates the ref.
            payload.existingGalleryImages = rawOriginalUrlsRef.current;

            // Send existing image paths for backend to clean up old files on replacement
            if (product?.thumbnailImage) payload.existingThumbnail = product.thumbnailImage;
            if (product?.sizeGuideImage || product?.sizeGuidImage) {
                payload.existingSizeGuide = product.sizeGuideImage || product.sizeGuidImage;
            }

            // Explicit removal signals: user clicked X on an existing image
            // without choosing a replacement file
            const originalSizeGuide = product?.sizeGuideImage || product?.sizeGuidImage;
            if (!thumbnailImage && !thumbnailPreview && product?.thumbnailImage) {
                payload.removeThumbnail = true;
            }
            if (!sizeGuideImage && !sizeGuidePreview && originalSizeGuide) {
                payload.removeSizeGuide = true;
            }

            const formData = new FormData();
            formData.append("data", JSON.stringify(payload));
            if (thumbnailImage) formData.append("thumbnailImage", thumbnailImage);
            if (sizeGuideImage) formData.append("sizeGuidImage", sizeGuideImage);

            // only newly picked files
            galleryImages.forEach((img) => formData.append("file", img));

            const res = await serverFetch.patch(`/api/v1/product/${slug}`, {
                credentials: "include",
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data?.message || "Update failed");

            setThumbnailImage(null);
            setSizeGuideImage(null);
            setGalleryImages([]);

            Toast.fire({ icon: "success", title: "Product updated successfully!" });
            resetForm();

        } catch (err) {
            console.error(err);
            Toast.fire({ icon: "error", title: "Failed to update product." });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen">
            <header className="sticky top-0 z-30 bg-white border-b px-4 h-16 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
                    <h1 className="text-xl font-bold">Update Product</h1>
                </div>
                <div className="flex gap-3">
                    <Button variant="outline"><Eye className="h-4 w-4" /> Preview</Button>
                    <Button onClick={handleUpdate}>
                        {isSaving && <Spinner />}
                        <Save className="h-4 w-4 ml-2" /> Update
                    </Button>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-9 space-y-8">
                        <BasicDetailsCard data={basicDetails}
                            onChange={(f, v) => setBasicDetails((p) => ({ ...p, [f]: v }))} />
                        <VariantsSection variants={variants} onChange={setVariants} />
                        <AdditionalInfoSection items={additionalInfo} onChange={setAdditionalInfo} />
                        <TagsSection tags={tags} onChange={setTags} />
                    </div>

                    <div className="lg:col-span-3 space-y-8">
                        <ImageUploadUpdate
                            thumbnailImage={thumbnailImage} setThumbnailImage={setThumbnailImage}
                            sizeGuideImage={sizeGuideImage} setSizeGuideImage={setSizeGuideImage}
                            galleryImages={galleryImages} setGalleryImages={setGalleryImages}
                            thumbnailPreview={thumbnailPreview} setThumbnailPreview={setThumbnailPreview}
                            sizeGuidePreview={sizeGuidePreview} setSizeGuidePreview={setSizeGuidePreview}
                            galleryPreview={galleryPreview} setGalleryPreview={setGalleryPreview}
                            originalGalleryUrls={rawOriginalUrlsRef.current}
                            onGalleryPreviewChange={(newOriginals) => {
                                //  user deleted a preview — update ref immediately
                                rawOriginalUrlsRef.current = newOriginals;
                            }}
                        />
                        <CategoriesSection
                            onChange={setCategoryPayload}
                            defaultCategories={product?.categories?.map((c: any) => c.categoryId || c.category?.id) || []}
                            defaultSubcategories={product?.subCategories?.map((s: any) => s.subCategoryId || s.subCategory?.id) || []}
                        />
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ProductUpdateClient;