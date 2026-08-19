'use client';
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { serverFetch } from '@/lib/server-fetch';

import { Toast } from '@/components/shared/Toast/Toast';
import {
    SearchableMultiSelect,
    normalizeName,
    type Option as Category,
} from './SearchableMultiSelect';

type Props = {
    onChange: (data: {
        categories: { categoryId: string }[];
        subCategories: { subCategoryId: string }[];
    }) => void;
    defaultCategories?: string[];
    defaultSubcategories?: string[];
};
const CategoriesSection = ({ onChange, defaultCategories, defaultSubcategories }: Props) => {
    //============== Categories ===============//
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>(defaultCategories || []);
    //=============== Subcategories ============//
    const [subcategories, setSubcategories] = useState<Category[]>([]);
    const [selectedSubcategories, setSelectedSubcategories] = useState<string[]>(defaultSubcategories || []);


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


    const addCategory = async (name: string) => {
        // Safety net: `name` is unique-checked in the picker too, but the
        // database has no unique constraint on Category.name, so guard here
        // as well before spending a request.
        const existing = categories.find(
            c => normalizeName(c.name) === normalizeName(name)
        );
        if (existing) {
            setSelectedCategories(prev =>
                prev.includes(existing.id) ? prev : [...prev, existing.id]
            );
            return;
        }

        try {
            setIsAddingCategory(true);
            const res = await serverFetch.post("/api/v1/product/create-category", {
                body: JSON.stringify({ name }),
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });
            const data = await res.json();

            if (!res.ok || !data?.data?.id || !data?.data?.name) {
                throw new Error(data?.message || "Create failed");
            }

            const created: Category = data.data;

            // The backend is the source of truth: if it hands back a row that
            // already exists locally, reuse it instead of duplicating the list.
            setCategories(prev =>
                prev.some(c => c.id === created.id) ? prev : [...prev, created]
            );
            setSelectedCategories(prev =>
                prev.includes(created.id) ? prev : [...prev, created.id]
            );
        } catch (error) {
            console.error("Failed to add category", error);
            Toast.fire({
                icon: "error",
                title: "Failed to add category",
            });
        } finally {
            setIsAddingCategory(false); // stop loading
        }
    }

    const addSubcategory = async (name: string) => {
        const existing = subcategories.find(
            s => normalizeName(s.name) === normalizeName(name)
        );
        if (existing) {
            setSelectedSubcategories(prev =>
                prev.includes(existing.id) ? prev : [...prev, existing.id]
            );
            return;
        }

        try {
            setIsSubAddingCategory(true);
            const res = await serverFetch.post("/api/v1/product/create-sub-category", {
                body: JSON.stringify({ name }),
                credentials: "include",
                headers: { "Content-Type": "application/json" },
            });

            const data = await res.json();

            if (!res.ok || !data?.data?.id || !data?.data?.name) {
                throw new Error(data?.message || "Create failed");
            }

            const created: Category = data.data;

            setSubcategories(prev =>
                prev.some(s => s.id === created.id) ? prev : [...prev, created]
            );
            setSelectedSubcategories(prev =>
                prev.includes(created.id) ? prev : [...prev, created.id]
            );
        } catch (error) {
            console.error("Failed to add Subcategory", error);
            Toast.fire({
                icon: "error",
                title: "Failed to add subcategory",
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
                className="bg-white rounded-2xl border border-slate-200 p-5 mb-8"
            >
                <SearchableMultiSelect
                    title="Categories"
                    options={categories}
                    selectedIds={selectedCategories}
                    loading={loadingData}
                    creating={isAddingCategory}
                    entityLabel="category"
                    entityPlural="categories"
                    createExample="Streetwear"
                    deleteTitle="Delete Category?"
                    deleteDescription="This will permanently delete the category."
                    onToggle={toggleCategory}
                    onCreate={addCategory}
                    onDelete={removeCategory}
                />
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
                className="bg-white rounded-2xl border border-slate-200 p-5"
            >
                <SearchableMultiSelect
                    title="Sub Categories"
                    options={subcategories}
                    selectedIds={selectedSubcategories}
                    loading={loadingData}
                    creating={isAddingSubCategory}
                    entityLabel="subcategory"
                    entityPlural="subcategories"
                    createExample="Hoodie"
                    deleteTitle="Delete Subcategory?"
                    deleteDescription="This will permanently delete the subcategory."
                    onToggle={toggleSubcategory}
                    onCreate={addSubcategory}
                    onDelete={removeSubcategory}
                />
            </motion.div>
        </div>
    )
}

export default CategoriesSection;