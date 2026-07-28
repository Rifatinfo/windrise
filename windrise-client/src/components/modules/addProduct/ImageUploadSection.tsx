'use client';
import React, { useRef } from 'react'
import {
    Upload,
    ImageIcon,
    X,
    Plus,
    FolderOpen,
    Ruler,
} from 'lucide-react'
import { motion } from 'framer-motion'

type Props = {
    sizeGuideImage: File | null
    setSizeGuideImage: React.Dispatch<React.SetStateAction<File | null>>
    thumbnailImage: File | null
    setThumbnailImage: React.Dispatch<React.SetStateAction<File | null>>
    galleryImages: File[]
    setGalleryImages: React.Dispatch<React.SetStateAction<File[]>>
}

const ImageUploadSection = ({
    sizeGuideImage,
    setSizeGuideImage,
    thumbnailImage,
    setThumbnailImage,
    galleryImages,
    setGalleryImages,
}: Props) => {
    // Refs
    const thumbnailRef = useRef<HTMLInputElement>(null)
    const galleryRef = useRef<HTMLInputElement>(null)
    const sizeGuideRef = useRef<HTMLInputElement>(null)

    // Generic single image handler
    const handleSingleImage = (
        e: React.ChangeEvent<HTMLInputElement>,
        setter: React.Dispatch<React.SetStateAction<File | null>>
    ) => {
        const file = e.target.files?.[0]
        if (file) setter(file)
        if (e.target) e.target.value = ''
    }

    // Gallery multiple images handler
    const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files
        if (!files) return
        const remaining = 6 - galleryImages.length
        const toAdd = Array.from(files).slice(0, remaining)
        setGalleryImages(prev => [...prev, ...toAdd])
        if (e.target) e.target.value = ''
    }

    return (
        <div className='space-y-6'>
            {/* Thumbnail Image */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl border border-slate-200 p-5 mb-10"
            >
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <ImageIcon className="w-4 h-4 " /> Thumbnail Image
                </h3>
                <input
                    ref={thumbnailRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSingleImage(e, setThumbnailImage)}
                    className="hidden"
                />
                {thumbnailImage ? (
                    <div className="relative group">
                        <img
                            src={URL.createObjectURL(thumbnailImage)}
                            alt="Thumbnail"
                            className="w-full h-52 object-cover rounded-lg"
                        />
                        <button
                            onClick={() => setThumbnailImage(null)}
                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4 text-slate-600" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => thumbnailRef.current?.click()}
                        className="flex flex-col items-center justify-center h-52 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-black hover:bg-gray-50/30 transition-all"
                    >
                        <Upload className="w-8 h-8 text-slate-300 mb-2" />
                        <span className="text-sm font-medium text-slate-500">
                            Click to upload
                        </span>
                        <span className="text-xs text-slate-400 mt-1">
                            SVG, PNG, JPG (max. 800×400px)
                        </span>
                    </div>
                )}
            </motion.div>

            {/* Gallery Images */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="bg-white rounded-xl border border-slate-200 p-5"
            >
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <FolderOpen className="w-4 h-4 " /> Gallery Images
                    <span className="text-xs text-slate-400 font-normal ml-auto">
                        {galleryImages.length}/6
                    </span>
                </h3>
                <input
                    ref={galleryRef}
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={handleGalleryUpload}
                    className="hidden"
                />
                <div className="grid grid-cols-3 gap-2">
                    {galleryImages.map((img, i) => (
                        <div key={i} className="relative group aspect-square">
                            <img
                                src={URL.createObjectURL(img)}
                                alt={`Gallery ${i}`}
                                className="w-full h-full object-cover rounded-lg"
                            />
                            <button
                                onClick={() =>
                                    setGalleryImages(
                                        galleryImages.filter((_, idx) => idx !== i)
                                    )
                                }
                                className="absolute top-1 right-1 p-0.5 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                <X className="w-3 h-3 text-slate-600" />
                            </button>
                        </div>
                    ))}
                    {galleryImages.length < 6 && (
                        <div
                            onClick={() => galleryRef.current?.click()}
                            className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-black hover:bg-gray-50/30  transition-all"
                        >
                            <Plus className="w-5 h-5 text-slate-300" />
                            <span className="text-[10px] text-slate-400 mt-1">Add</span>
                        </div>
                    )}
                </div>
            </motion.div>

            {/* Size Guide Image */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white rounded-xl border border-slate-200 p-5"
            >
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Ruler className="w-4 h-4 " /> Size Guide Image
                </h3>
                <input
                    ref={sizeGuideRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleSingleImage(e, setSizeGuideImage)}
                    className="hidden"
                />
                {sizeGuideImage ? (
                    <div className="relative group">
                        <img
                            src={URL.createObjectURL(sizeGuideImage)}
                            alt="Size Guide"
                            className="w-full h-52 object-cover rounded-lg"
                        />
                        <button
                            onClick={() => setSizeGuideImage(null)}
                            className="absolute top-2 right-2 p-1 bg-white/90 rounded-full shadow opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X className="w-4 h-4 text-slate-600 cursor-pointer" />
                        </button>
                    </div>
                ) : (
                    <div
                        onClick={() => sizeGuideRef.current?.click()}
                        className="flex flex-col items-center justify-center h-52 border-2 border-dashed border-slate-200 rounded-lg cursor-pointer hover:border-black hover:bg-gray-50/30  transition-all"
                    >
                        <Upload className="w-6 h-6 text-slate-300 mb-1" />
                        <span className="text-xs text-slate-500">
                            Upload size chart
                        </span>
                    </div>
                )}
            </motion.div>
        </div>
    )
}

export default ImageUploadSection