"use client";

import { motion } from "framer-motion";
import { Edit, Trash2, Eye } from "lucide-react";
import Image from "next/image";
import { Toast } from "../shared/Toast/Toast";
import { serverFetch } from "@/lib/server-fetch";
import ConfirmDialog from "../shared/ConfirmDialog";
import { useRouter } from "next/navigation";
import { useState } from "react";
import ProductViewModal from "../shared/ProductViewModal";


const ProductRow = ({ product, index }: any) => {
    const [openView, setOpenView] = useState(false);
    const router = useRouter();
    const removeProduct = async (id: string) => {
        try {
            const res = await serverFetch.delete(`/api/v1/product/${id}`,
                { credentials: "include", }
            );

         
            const result = await res.json();
            console.log("product", result)
            if (res.ok && result.success) {
                Toast.fire({
                    icon: "success",
                    title: "Product deleted successfully"
                });

                //============  reload page or refetch ==============// 
                router.refresh();
            } else {
                Toast.fire({
                    icon: "success",
                    title: "Failed to delete Product"
                });
            }
        } catch (err) {
            console.error(err);
            Toast.fire({
                icon: "error",
                title: "Something went wrong!",
            });
        }
    };

    return (
        <motion.tr
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="hover:bg-slate-50 transition-colors group"
        >
            {/* Product */}
            <td className="py-3 px-4">
                <div className="flex items-center gap-3">
                    {product?.thumbnailImage?.trim() ? (
                        <Image
                            width={40}
                            height={40}
                            src={product.thumbnailImage}
                            alt={product.name || "product"}
                            className="w-10 h-10 rounded-lg object-cover border border-slate-200"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                            <span className="text-xs font-bold text-slate-400">
                                {(product.name || "?").charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div>
                        <p className=" font-bold text-slate-900">{product.name}</p>
                        <p className="text-xs text-slate-500 font-mono mt-0.5">{product.sku}</p>
                    </div>
                </div>
            </td>


            <td className="py-3 px-4">
                <div className="flex flex-wrap items-center gap-2">

                    {/*===================== Categories =======================*/}
                    {product.categories?.length > 0 ? (
                        product.categories.map((cat: any) => (
                            <span
                                key={cat.id}
                                className="px-2 py-0.5 text-sm bg-blue-50  rounded-md"
                            >
                                {cat.category?.name}
                            </span>
                        ))
                    ) : (
                        <span className="text-slate-400 text-sm">No Categories</span>
                    )}
                </div>
            </td>
            <td className="py-3 px-4">
                {/*=================== SubCategories ==========================*/}
                {product.subCategories?.length > 0 &&
                    product.subCategories.map((sub: any) => (
                        <span
                            key={sub.id}
                            className="px-2 py-0.5 text-sm  bg-blue-50 rounded-md"
                        >
                            {sub.subCategory?.name}
                        </span>
                    ))}
            </td>

            {/* Price */}
            <td className="py-3 px-4">
                <p className="text-sm font-bold text-slate-900">
                    {`${product.salePrice?.toLocaleString() || product.regularPrice?.toLocaleString()} TK`}
                </p>
                {product.salePrice && (
                    <p className="text-xs text-slate-400 line-through">
                        {`${product.regularPrice.toLocaleString()} TK`}
                    </p>
                )}
            </td>


            {/* Stock */}
            <td className="py-3 px-4">
                <div className="flex flex-col items-start gap-1">
                    <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-xl text-[10px] font-bold uppercase tracking-wider ${product.stockStatus === "IN_STOCK"
                            ? "bg-emerald-100 text-emerald-700"
                            : product.stockStatus === "LOW_STOCK"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-rose-100 text-rose-700"
                            }`}
                    >
                        {product.stockStatus === "IN_STOCK"
                            ? "In Stock"
                            : product.stockStatus === "LOW_STOCK"
                                ? "Low Stock"
                                : "Out of Stock"}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                        {product.stockQuantity}
                    </span>
                </div>
            </td>

            {/* Actions */}
            <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2 transition-opacity">
                    <button onClick={() => setOpenView(true)} className="p-1.5 text-slate-400  hover:bg-blue-50 rounded-md transition-colors cursor-pointer" title="View">
                        <Eye className="w-4 h-4" />
                    </button>
                    <button  onClick={() => router.push(`/admin/update-product/${product.slug}`)}  className="p-1.5 text-slate-400  hover:bg-orange-50 rounded-md transition-colors cursor-pointer" title="Edit">
                        <Edit className="w-4 h-4" />
                    </button>

                    {/*============= Confirm Dialog  ======================*/}
                    <ConfirmDialog
                        trigger={
                            <span className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer inline-flex items-center justify-center">
                                <Trash2 className="w-4 h-4" />
                            </span>
                        }
                        title="Delete Product?"
                        description="This action cannot be undone."
                        onConfirm={() => removeProduct(product.id)}
                    />
                    <ProductViewModal
                        product={product}
                        open={openView}
                        setOpen={setOpenView}
                    />
                </div>
            </td>
        </motion.tr>
    );
};

export default ProductRow;