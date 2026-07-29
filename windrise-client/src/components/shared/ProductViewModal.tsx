
import { useEffect, useState } from "react";
import Image from "next/image";
import { Dispatch, SetStateAction } from "react";
import { X } from "lucide-react";

interface Variant { id: string; color: string; size: string; quantity: number; }
interface ProductImage { id: string; url: string; }
interface AdditionalInfo { id: string; label: string; value: string; }
export interface Product {
    id: string;
    name: string;
    sku: string;
    regularPrice: number;
    salePrice?: number;
    thumbnailImage: string | null;
    fullDescription?: string;
    variants?: Variant[];
    images?: ProductImage[];
    additionalInformation?: AdditionalInfo[];
}
interface Props { product: Product; open: boolean; setOpen: Dispatch<SetStateAction<boolean>>; }

const ProductViewModal = ({ product, open, setOpen }: Props) => {
    // ✅ Hooks must run unconditionally on EVERY render — never after an
    // early return, otherwise React resets the state (this is what made the
    // main image revert a moment after clicking a thumbnail)
    const [mainImage, setMainImage] = useState<string | null>(product?.thumbnailImage ?? null);

    // Reset the main image every time the modal is opened / product changes
    useEffect(() => {
        if (open) {
            setMainImage(product?.thumbnailImage ?? product?.images?.[0]?.url ?? null);
        }
    }, [open, product]);

    if (!open) return null;

    const variants = product?.variants ?? [];
    const images = product?.images ?? [];
    const additionalInfo = product?.additionalInformation ?? [];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
        >
            <div
                className="bg-white w-[95%] max-w-5xl rounded-2xl shadow-2xl p-8 relative grid grid-cols-1 md:grid-cols-2 gap-8 overflow-y-auto max-h-[90vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close Button */}
                <button
                    className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 hover:text-[#D94D1B] text-2xl font-bold transition cursor-pointer"
                     onClick={() => setOpen(false)}
                >
                    <X size={24} className="cursor-pointer" />
                </button>

                {/* Left: Gallery */}
                <div className="flex flex-col items-center gap-4">
                    {/* Main Image */}
                    {mainImage ? (
                        <Image
                            width={300}
                            height={300}
                            src={mainImage}
                            alt={product.name}
                            className="rounded-xl border border-gray-200 object-cover shadow-md"
                        />
                    ) : (
                        <div className="w-[300px] h-[300px] flex items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-gray-400 text-sm shadow-md">
                            No Image
                        </div>
                    )}

                    {/* Thumbnails */}
                    {images.length > 0 && (
                        <div className="flex gap-2 flex-wrap mt-2 justify-center ">
                            {images.map((img) => (
                                <Image
                                    key={img.id}
                                    width={60}
                                    height={60}
                                    src={img.url}
                                    alt="gallery"
                                    className={`rounded-lg border object-cover shadow-sm hover:scale-105 transition-transform cursor-pointer ${img.url === mainImage ? "border-black-500" : ""
                                        }`}
                                    onClick={() => setMainImage(img.url)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Right: Product Info */}
                <div className="flex flex-col gap-4 items-start w-full">
                    <div className="w-full">
                        <h2 className="text-2xl font-bold text-gray-900 text-left">{product.name}</h2>
                        <p className="text-sm text-gray-500 mt-1 text-left">SKU: {product.sku}</p>
                    </div>
                    <div className="flex items-center gap-3 w-full">
                        {/* Price */}
                        <div className="flex items-center gap-3 w-full">
                            <p className="text-2xl font-bold ">
                                {product.salePrice?.toLocaleString() || product.regularPrice.toLocaleString()} TK
                            </p>
                            {product.salePrice && (
                                <p className="text-sm line-through text-gray-400">
                                    {product.regularPrice.toLocaleString()} TK
                                </p>
                            )}
                        </div>
                    </div>
                    {
                        variants.length > 0 && (
                            <div className="w-full">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-left">Variants</h3>
                                <div className="flex flex-wrap gap-2">
                                    {variants.map((v) => (
                                        <span
                                            key={v.id}
                                            className="px-3 py-1 bg-blue-50 text-blue-800 rounded-full text-sm font-medium shadow-sm"
                                        >
                                            {v.color} - {v.size} ({v.quantity})
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    }

                    {
                        product.fullDescription && (
                            <div className="w-full">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-left">Description</h3>
                                <p className="text-gray-600 text-left">{product.fullDescription}</p>
                            </div>
                        )
                    }
                    {
                        additionalInfo.length > 0 && (
                            <div className="w-full">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2 text-left">Additional Info</h3>
                                <div className="flex flex-wrap gap-3">
                                    {additionalInfo.map((info) => (
                                        <span
                                            key={info.id}
                                            className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm shadow-sm"
                                        >
                                            {info.label}: {info.value}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )
                    }
                </div>
            </div>
        </div>
    );
};

export default ProductViewModal;