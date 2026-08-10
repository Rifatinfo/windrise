// ImageUploadUpdate.tsx
'use client';
import React, { useRef, useMemo } from 'react'
import { Upload, ImageIcon, X, Plus, FolderOpen, Ruler } from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
    sizeGuideImage: File | null
    setSizeGuideImage: React.Dispatch<React.SetStateAction<File | null>>
    thumbnailImage: File | null
    setThumbnailImage: React.Dispatch<React.SetStateAction<File | null>>
    galleryImages: File[]
    setGalleryImages: React.Dispatch<React.SetStateAction<File[]>>
    thumbnailPreview?: string | null
    setThumbnailPreview?: React.Dispatch<React.SetStateAction<string | null>>
    sizeGuidePreview?: string | null
    setSizeGuidePreview?: React.Dispatch<React.SetStateAction<string | null>>
    galleryPreview?: string[]
    setGalleryPreview?: React.Dispatch<React.SetStateAction<string[]>>
    // ✅ NEW: original paths for backend
    onGalleryPreviewChange?: (survivingOriginals: string[]) => void
    originalGalleryUrls?: string[]
}

const ImageUploadUpdate = ({
    sizeGuideImage, setSizeGuideImage,
    thumbnailImage, setThumbnailImage,
    galleryImages, setGalleryImages,
    thumbnailPreview, setThumbnailPreview,
    sizeGuidePreview, setSizeGuidePreview,
    galleryPreview = [], setGalleryPreview,
    onGalleryPreviewChange,
    originalGalleryUrls = [],
}: Props) => {
    const thumbnailRef = useRef<HTMLInputElement>(null)
    const galleryRef = useRef<HTMLInputElement>(null)
    const sizeGuideRef = useRef<HTMLInputElement>(null)

    const thumbnailObjectUrl = useMemo(
        () => thumbnailImage ? URL.createObjectURL(thumbnailImage) : null,
        [thumbnailImage]
    )
    const sizeGuideObjectUrl = useMemo(
        () => sizeGuideImage ? URL.createObjectURL(sizeGuideImage) : null,
        [sizeGuideImage]
    )
    const galleryObjectUrls = useMemo(
        () => galleryImages.map(f => URL.createObjectURL(f)),
        [galleryImages]
    )

    const thumbnailSrc = thumbnailObjectUrl ?? thumbnailPreview ?? null
    const sizeGuideSrc = sizeGuideObjectUrl ?? sizeGuidePreview ?? null
    const totalGalleryCount = galleryPreview.length + galleryImages.length

    const handleSingleImage = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<File | null>>,
        clearPreview?: React.Dispatch<React.SetStateAction<string | null>>
    ) => {
        const file = e.target.files?.[0]
        if (file) { setter(file); clearPreview?.(null) }
        e.target.value = ''
    }

    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        const remaining = 6 - totalGalleryCount
        const toAdd = Array.from(files).slice(0, remaining)
        setGalleryImages(prev => [...prev, ...toAdd])
        e.target.value = ''
    }

    // ✅ When user removes an existing preview, sync originals too
    const handleRemovePreview = (index: number) => {
        const removedResolved = galleryPreview[index]
        const newPreviews = galleryPreview.filter((_, i) => i !== index)
        setGalleryPreview?.(newPreviews)

        // Resolve originals with the SAME rules used to build the previews
        // (must mirror resolveUrl() in ProductUpdateClient.tsx, otherwise
        
        const resolveOriginal = (orig: string): string => {
            if (orig.startsWith("http")) return orig
            if (orig.startsWith("/")) return orig
            return `${process.env.NEXT_PUBLIC_API_URL}${orig}`
        }
        const newOriginals = originalGalleryUrls.filter(
            (orig) => resolveOriginal(orig) !== removedResolved
        )
        onGalleryPreviewChange?.(newOriginals)
    }

    return (
        <div className='space-y-6'>

            {/* ── Thumbnail ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-5"
            >
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 " /> Thumbnail Image
                </h3>
                <input ref={thumbnailRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleSingleImage(e, setThumbnailImage, setThumbnailPreview)}
                />
                {thumbnailSrc ? (
                    <div className="relative group cursor-pointer"
                        onClick={() => thumbnailRef.current?.click()}>
                        <img src={thumbnailSrc} alt="Thumbnail"
                            className="w-full h-48 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">Click to replace</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setThumbnailImage(null); setThumbnailPreview?.(null) }}
                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <X className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                ) : (
                    <div onClick={() => thumbnailRef.current?.click()}
                        className="flex flex-col items-center justify-center h-48 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-black hover:bg-gray-50/30  transition-all">
                        <Upload className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-sm font-medium text-slate-500">Click to upload</span>
                        <span className="text-xs text-slate-400 mt-1">SVG, PNG, JPG (max. 800×400px)</span>
                    </div>
                )}
            </motion.div>

            {/* ── Gallery ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl border border-slate-200 p-5"
            >
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 " /> Gallery Images
                    <span className="text-xs text-slate-400 font-normal ml-auto">{totalGalleryCount}/6</span>
                </h3>
                <input ref={galleryRef} type="file" accept="image/*" multiple className="hidden"
                    onChange={handleGalleryUpload} />
                <div className="grid grid-cols-3 gap-2">

                    {/* ✅ Existing URL previews */}
                    {galleryPreview.map((url, i) => (
                        <div key={`preview-${i}`} className="relative group aspect-square">
                            <img src={url} alt={`Gallery ${i}`}
                                className="w-full h-full object-cover rounded-lg" />
                            <button onClick={() => handleRemovePreview(i)}
                                className="absolute top-1 right-1 p-0.5 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-3 h-3 text-slate-600" />
                            </button>
                        </div>
                    ))}

                    {/* New file previews */}
                    {galleryObjectUrls.map((src, i) => (
                        <div key={`new-${i}`} className="relative group aspect-square">
                            <img src={src} alt={`New ${i}`}
                                className="w-full h-full object-cover rounded-lg" />
                            <button onClick={() => setGalleryImages(prev => prev.filter((_, idx) => idx !== i))}
                                className="absolute top-1 right-1 p-0.5 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity">
                                <X className="w-3 h-3 text-slate-600" />
                            </button>
                        </div>
                    ))}

                    {totalGalleryCount < 6 && (
                        <div onClick={() => galleryRef.current?.click()}
                            className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-black hover:bg-gray-50/30  transition-all">
                            <Plus className="w-5 h-5 text-slate-300" />
                            <span className="text-[10px] text-slate-400 mt-1">Add</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* ── Size Guide ── */}
            <motion.div
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-slate-200 p-5"
            >
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4 " /> Size Guide Image
                </h3>
                <input ref={sizeGuideRef} type="file" accept="image/*" className="hidden"
                    onChange={(e) => handleSingleImage(e, setSizeGuideImage, setSizeGuidePreview)} />
                {sizeGuideSrc ? (
                    <div className="relative group cursor-pointer"
                        onClick={() => sizeGuideRef.current?.click()}>
                        <img src={sizeGuideSrc} alt="Size Guide"
                            className="w-full h-32 object-cover rounded-lg" />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-lg transition-all flex items-center justify-center">
                            <span className="text-white text-xs font-medium opacity-0 group-hover:opacity-100">Click to replace</span>
                        </div>
                        <button onClick={(e) => { e.stopPropagation(); setSizeGuideImage(null); setSizeGuidePreview?.(null) }}
                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity z-10">
                            <X className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                ) : (
                    <div onClick={() => sizeGuideRef.current?.click()}
                        className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-black hover:bg-gray-50/30  transition-all">
                        <Upload className="w-6 h-6 text-slate-300 mb-1" />
                        <span className="text-xs text-slate-500">Upload size chart</span>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default ImageUploadUpdate