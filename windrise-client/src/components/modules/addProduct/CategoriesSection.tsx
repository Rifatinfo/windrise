'use client';
import { useState, useRef, useEffect } from 'react'
import {
    X,
    Plus,
    Tag,
} from 'lucide-react'
import { motion } from 'framer-motion'
import { serverFetch } from '@/lib/server-fetch';

import { Toast } from '@/components/shared/Toast/Toast';
import Spinner from '@/components/shared/Spinner';
import ListSkeleton from '@/components/shared/skeleton/ListSkeleton';
import ConfirmDialog from '@/components/shared/ConfirmDialog';



type Category = {
    id: string;
    name: string;
}

type Props = {
    onChange: (data: {
        categories: { categoryId: string }[];
        subCategories: { subCategoryId: string }[];
    }) => void;
};
const CategoriesSection = ({ onChange }: Props) => {
    //============== Categories ===============//
    const [categories, setCategories] = useState<Category[]>([]);
    const [newCategory, setNewCategory] = useState('');
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    //=============== Subcategories ============// 
    const [subcategories, setSubcategories] = useState<Category[]>([]);
    const [newSubcategory, setNewSubcategory] = useState('');
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>([]);


    // ================= loading ================// 
    const [isAddingCategory, setIsAddingCategory] = useState(false);
    const [isAddingSubCategory, setIsSubAddingCategory] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    // ================= FETCH ================= //
    useEffect(() => {
        const loadData = async () => {
            try {
                setLoadingData(true);

                const catRes = await serverFetch.get("/api/v1/product/category");
                const catData = await catRes.json();
                setCategories(catData.data || []);

                const subRes = await serverFetch.get("/api/v1/product/sub-category");
                const subData = await subRes.json();
                setSubcategories(subData.data || []);
            } catch (error) {
                console.error(error);
            } finally {
                setLoadingData(false);
            }
        };

        loadData();
    }, []);

    // ================= SEND ================= //
    useEffect(() => {
        onChange({
            categories: selectedCategories.map(id => ({ categoryId: id })),
            subCategories: selectedSubcategories.map(id => ({ subCategoryId: id })),
        });
    }, [selectedCategories, selectedSubcategories]);


    const addCategory = async () => {
        if (!newCategory.trim()) return;
        try {
            setIsAddingCategory(true);
            const res = await serverFetch.post("/api/v1/product/create-category", {
                body: JSON.stringify({ name: newCategory }),
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();
            if (data.data?.id && data.data?.name) {
                setCategories(prev => [...prev, data.data]);
            }
            setNewCategory("");
        } catch (error) {
            console.error("Failed to add category");
            Toast.fire({
                icon: "error",
                title: "Failed to category",
            });
        } finally {
            setIsAddingCategory(false); // stop loading
        }
    }

    const addSubcategory = async () => {
        if (!newSubcategory.trim()) return;

        try {
            setIsSubAddingCategory(true);
            const res = await serverFetch.post("/api/v1/product/create-sub-category", {
                body: JSON.stringify({ name: newSubcategory }),
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();
            if (data.data?.id && data.data?.name) {
                setSubcategories(prev => [...prev, data.data]);
            }
            setNewSubcategory("");
        } catch (error) {
            console.error("Failed to add Subcategory");
            Toast.fire({
                icon: "error",
                title: "Failed to Subcategory",
            });
        } finally {
            setIsSubAddingCategory(false);
        }
    };
    // ================= TOGGLE ================= //
    const toggleCategory = (id: string) => {
        setSelectedCategories(prev =>
            prev.includes(id)
                ? prev.filter(c => c !== id)
                : [...prev, id]
        );
    };

    const toggleSubcategory = (id: string) => {
        setSelectedSubcategories(prev =>
            prev.includes(id)
                ? prev.filter(s => s !== id)
                : [...prev, id]
        );
    };


    // ================= DELETE =================
    const removeCategory = async (id: string) => {
        try {
            const res = await serverFetch.delete(`/api/v1/product/category/${id}`,
                { credentials: "include", }
            );
            const result = await res.json();
            if (res.ok && result.success) {
                setCategories(prev => prev.filter(c => c.id !== id));
                setSelectedCategories(prev => prev.filter(c => c !== id));

                Toast.fire({
                    icon: "success",
                    title: "Category deleted successfully",
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Failed to delete category",
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
    const removeSubcategory = async (id: string) => {
        try {
            const res = await serverFetch.delete(`/api/v1/product/sub-category/${id}`, {
                credentials: "include"
            });
            const result = await res.json();

            if (res.ok && result.success) {
                setSubcategories(prev => prev.filter(s => s.id !== id));
                setSelectedSubcategories(prev => prev.filter(s => s !== id));

                Toast.fire({
                    icon: "success",
                    title: "Category deleted successfully",
                });
            } else {
                Toast.fire({
                    icon: "error",
                    title: "Failed to delete category",
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
        <div>
            {/* Categories */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    delay: 0.25,
                }}
                className="bg-white rounded-xl border border-slate-200 p-5 mb-8"
            >
                <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                    <Tag className="w-4 h-4 " /> Categories
                </h3>

                <div className="flex gap-2 mb-3">
                    <input
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="New category..."
                        className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button onClick={addCategory} disabled={isAddingCategory} className="bg-black text-white px-3 rounded cursor-pointer">
                        {isAddingCategory ? (
                            <Spinner size={20} />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {loadingData ? (
                    <ListSkeleton count={6} />
                ) : (
                    categories.filter(cat => cat?.id && cat?.name).map(cat => (
                        <div key={cat.id} className="flex items-center gap-2 group">
                            <input
                                type="checkbox"
                                checked={selectedCategories.includes(cat.id)}
                                onChange={() => toggleCategory(cat.id)}
                            />
                            <span className="flex-1">{cat.name}</span>

                            <ConfirmDialog
                                trigger={
                                    <span className="opacity-0 group-hover:opacity-100 text-red-500 cursor-pointer">
                                        <X />
                                    </span>
                                }
                                title="Delete Category?"
                                description="This will permanently delete the category."
                                onConfirm={() => removeCategory(cat.id)}
                            />
                        </div>
                    ))
                )}
            </motion.div>

            {/* Sub Categories */}
            <motion.div
                initial={{
                    opacity: 0,
                    y: 20,
                }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                transition={{
                    delay: 0.3,
                }}
                className="bg-white rounded-xl border border-slate-200 p-5"
            >
                <h3 className="text-sm font-bold text-slate-900 mb-3">
                    Sub Categories
                </h3>
                <div className="flex gap-2 mb-3">
                    <input
                        value={newSubcategory}
                        onChange={(e) => setNewSubcategory(e.target.value)}
                        placeholder="New subcategory..."
                        className="flex-1 px-3 py-2 border rounded-lg"
                    />
                    <button onClick={addSubcategory} className="bg-black text-white px-3 rounded cursor-pointer">
                        {isAddingSubCategory ? (
                            <Spinner size={20} />
                        ) : (
                            <Plus className="w-5 h-5" />
                        )}
                    </button>
                </div>

                {loadingData ? (
                    <ListSkeleton count={6} />
                ) : (
                    subcategories.filter(sub => sub?.id && sub?.name).map(sub => (
                        <div key={sub.id} className="flex items-center gap-2 group">
                            <input
                                type="checkbox"
                                checked={selectedSubcategories.includes(sub.id)}
                                onChange={() => toggleSubcategory(sub.id)}
                            />
                            <span className="flex-1">{sub.name}</span>

                            <ConfirmDialog
                                trigger={
                                    <span className="opacity-0 group-hover:opacity-100 text-red-500 cursor-pointer">
                                        <X />
                                    </span>
                                }
                                title="Delete Subcategory?"
                                description="This will permanently delete the subcategory."
                                onConfirm={() => removeSubcategory(sub.id)}
                            />
                        </div>
                    ))
                )}
            </motion.div>
        </div>
    )
}

export default CategoriesSection;