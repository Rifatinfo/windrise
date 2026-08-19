/* eslint-disable @typescript-eslint/no-explicit-any */
"use client"

import { useState } from "react"
import { ArrowLeft, Save, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { BasicDetailsCard, StockStatus } from "./BasicDetailsCard"

import { AdditionalInfoSection, InfoItem } from "./AdditionalInfoSection"


import { Toast } from "@/components/shared/Toast/Toast"
import { serverFetch } from "@/lib/server-fetch"
import { hasMeaningfulHtmlContent } from "@/lib/sanitizeHtml"
import ImageUploadSection from "./ImageUploadSection"
import CategoriesSection from "./CategoriesSection"

import Swal from "sweetalert2";
import { createVariant, isEmptyVariant, resolveVariantSku, Variant, VariantsSection } from "./VariantsSection"
import Spinner from "@/components/shared/Spinner"
import { TagsSection } from "./TagsSection"


export default function ProductAddPage() {
  const [basicDetails, setBasicDetails] = useState({
    name: "",
    regularPrice: "",
    salePrice: "",
    shortDescription: "",
    fullDescription: "",
    sku: "",
    stockQuantity: 0,
    stockStatus: StockStatus.IN_STOCK
  })

  // The variants table opens with two blank rows, matching the design.
  const [variants, setVariants] = useState<Variant[]>(() => [createVariant(), createVariant()])
  const [additionalInfo, setAdditionalInfo] = useState<InfoItem[]>([])
  const [tags, setTags] = useState<string[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [savingMessage, setSavingMessage] = useState("")

  // Image states
  const [sizeGuideImage, setSizeGuideImage] = useState<File | null>(null)
  const [thumbnailImage, setThumbnailImage] = useState<File | null>(null)
  const [galleryImages, setGalleryImages] = useState<File[]>([])
  const [categoryPayload, setCategoryPayload] = useState<{
    categories: { categoryId: string }[]
    subCategories: { subCategoryId: string }[]
  }>({
    categories: [],
    subCategories: [],
  });

  // ==================== Discount ======================//

  // console.log("discount", discount);

  const validateForm = () => {
    if (!basicDetails.name?.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing Field",
        text: "Product Name is required!",
        confirmButtonText: "Go it",
            customClass: {
            confirmButton: "bg-black text-white px-12 py-2 rounded cursor-pointer",
        },
        buttonsStyling: false,
      });
      return false;
    }

    if (!basicDetails.regularPrice) {
      Swal.fire({
        icon: "error",
        title: "Missing Field",
        text: "Regular Price is required!",
        confirmButtonText: "Go it",
            customClass: {
            confirmButton: "bg-black text-white px-12 py-2 rounded cursor-pointer",
        },
        buttonsStyling: false,
      });
      return false;
    }

    if (!basicDetails.sku?.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing Field",
        text: "SKU is required!",
        confirmButtonText: "Go it",
            customClass: {
            confirmButton: "bg-black text-white px-12 py-2 rounded cursor-pointer",
        },
        buttonsStyling: false,
      });
      return false;
    }

    if (basicDetails.stockQuantity < 0) {
      Swal.fire({
        icon: "error",
        title: "Invalid Stock",
        text: "Stock Quantity cannot be negative!",
        confirmButtonText: "Go it",
            customClass: {
            confirmButton: "bg-black text-white px-12 py-2 rounded cursor-pointer",
        },
        buttonsStyling: false,
      });
      return false;
    }

    if (!basicDetails.shortDescription?.trim()) {
      Swal.fire({
        icon: "error",
        title: "Missing Field",
        text: "Short Description is required!",
        confirmButtonText: "Go it",
            customClass: {
            confirmButton: "bg-black text-white px-12 py-2 rounded cursor-pointer",
        },
        buttonsStyling: false,
      });
      return false;
    }

    if (!hasMeaningfulHtmlContent(basicDetails.fullDescription)) {
      Swal.fire({
        icon: "error",
        title: "Missing Field",
        text: "Product description is required.",
        confirmButtonText: "Go it",
            customClass: {
            confirmButton: "bg-black text-white px-12 py-2 rounded cursor-pointer",
        },
        buttonsStyling: false,
      });
      return false;
    }

    //========= Thumbnail required ============//
    if (!thumbnailImage) {
      Swal.fire({
        icon: "error",
        title: "Missing Thumbnail",
        text: "Please upload a thumbnail image!",
        confirmButtonText: "Go it",
            customClass: {
            confirmButton: "bg-black text-white px-12 py-2 rounded cursor-pointer",
        },
        buttonsStyling: false,
      });
      return false;
    }

    //============== Gallery required (at least 1 image) ==========//
    if (!galleryImages || galleryImages.length === 0) {
      Swal.fire({
        icon: "error",
        title: "Missing Gallery Images",
        text: "Please upload at least one gallery image!",
        confirmButtonText: "Go it",
            customClass: {
            confirmButton: "bg-black text-white px-12 py-2 rounded cursor-pointer",
        },
        buttonsStyling: false,
      });
      return false;
    }

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
  }

  const resetForm = () => {
    setBasicDetails({
      name: "",
      regularPrice: "",
      salePrice: "",
      shortDescription: "",
      fullDescription: "",
      sku: "",
      stockQuantity: 0,
      stockStatus: StockStatus.IN_STOCK
    })
    setVariants([createVariant(), createVariant()])
    setAdditionalInfo([])
    setTags([])
    setGalleryImages([])
    setThumbnailImage(null)
    setSizeGuideImage(null)
    setCategoryPayload({
      categories: [],
      subCategories: [],
    })
  }

  const handleSave = async () => {
    if (!validateForm()) return;

    setIsSaving(true);
    setSavingMessage("Uploading product...");
    try {
      // Prepare payload
      const payload = {
        name: basicDetails.name,
        sku: basicDetails.sku,
        regularPrice: Number(basicDetails.regularPrice),
        salePrice: Number(basicDetails.salePrice),
        stockQuantity: basicDetails.stockQuantity,
        stockStatus: basicDetails.stockStatus,
        shortDescription: basicDetails.shortDescription,
        fullDescription: basicDetails.fullDescription,

        categories: categoryPayload.categories.map(c => c.categoryId),
        subCategories: categoryPayload.subCategories.map(s => s.subCategoryId),

        tags,

        // Blank rows the admin never filled in must not become records.
        variants: variants.filter(v => !isEmptyVariant(v)).map(v => ({
          color: v.color,
          size: v.size,
          quantity: Number(v.quantity),
          sku: resolveVariantSku(v, basicDetails.sku),
        })),

        additionalInformation: additionalInfo,

      };


      const formData = new FormData();
      formData.append("data", JSON.stringify(payload));


      if (thumbnailImage) formData.append("thumbnailImage", thumbnailImage);
      if (sizeGuideImage) formData.append("sizeGuidImage", sizeGuideImage);
      galleryImages.forEach(img => formData.append("file", img));

      setSavingMessage(`Processing ${1 + galleryImages.length + (sizeGuideImage ? 1 : 0)} images...`);

      const res = await serverFetch.post("/api/v1/product/create", {
        credentials: "include",
        body: formData,
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Create failed");

      Toast.fire({
        icon: "success",
        title: "Product saved successfully!",
      });

      resetForm();
    } catch (error: any) {
      console.error(error);

      Toast.fire({
        icon: "error",
        title: "Failed to save product.",
      });
    } finally {
      setIsSaving(false);
      setSavingMessage("");
    }
  }

  return (
    <div className="min-h-screen   border rounded-lg">
      <header className="sticky top-0 z-30 bg-white border-b px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold">Add New Product</h1>
        </div>
        <div className="flex gap-3">
          <Button variant="outline">
            <Eye className="h-4 w-4" /> Preview
          </Button>
          <Button onClick={handleSave} disabled={isSaving} className="cursor-pointer">
            {isSaving ? (
              <>
                <Spinner /> <span className="text-xs ml-1">{savingMessage}</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" /> Save
              </>
            )}

          </Button>
        </div>
      </header>

      <main className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-12 gap-8">
          <div className="lg:col-span-9  space-y-8">
            <BasicDetailsCard
              data={basicDetails}
              onChange={(field, value) =>
                setBasicDetails(prev => ({ ...prev, [field]: value }))
              }
            />
            <VariantsSection variants={variants} onChange={setVariants} mainSku={basicDetails.sku} />
            <AdditionalInfoSection items={additionalInfo} onChange={setAdditionalInfo} />
            <TagsSection tags={tags} onChange={setTags} />
          </div>

          <div className="lg:col-span-3 space-y-8">
            <ImageUploadSection sizeGuideImage={sizeGuideImage}
              setSizeGuideImage={setSizeGuideImage}
              thumbnailImage={thumbnailImage}
              setThumbnailImage={setThumbnailImage}
              galleryImages={galleryImages}
              setGalleryImages={setGalleryImages} />
            <CategoriesSection onChange={setCategoryPayload} />
          </div>
        </div>
      </main>
    </div>
  )
}