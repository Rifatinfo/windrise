'use client';

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { getCategories, getSubCategories } from "@/services/product/getCategories";
// import { getSubCategories } from "@/services/product/getSubCategories";

const ProductFilters = () => {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [search, setSearch] = useState("");
    const [categories, setCategories] = useState<any[]>([]);
    const [subCategories, setSubCategories] = useState<any[]>([]);
    const [filteredSubs, setFilteredSubs] = useState<any[]>([]);

    // ================= INIT FROM URL =================
    useEffect(() => {
        setSearch(searchParams.get("searchTerm") || "");
    }, [searchParams]);

    // ================= FETCH DATA =================
    useEffect(() => {
        const fetchData = async () => {
            const catRes = await getCategories();
            const subRes = await getSubCategories();

            setCategories(catRes?.data || []);
            setSubCategories(subRes?.data || []);
        };

        fetchData();
    }, []);

    // ================= SEARCH =================
    const handleSearch = (value: string) => {
        setSearch(value);

        const params = new URLSearchParams(searchParams.toString());

        if (value) params.set("searchTerm", value);
        else params.delete("searchTerm");

        params.set("page", "1");

        router.push(`?${params.toString()}`);
    };

    // ================= CATEGORY =================
    const handleCategoryChange = (value: string) => {
        const categoryId = value === "all" ? "" : value;

        const params = new URLSearchParams(searchParams.toString());

        if (categoryId) params.set("category", categoryId);
        else params.delete("category");

        // reset subcategory
        params.delete("subCategory");

        params.set("page", "1");

        router.push(`?${params.toString()}`);

        // filter subcategories locally
        const filtered = subCategories.filter(
            (sub: any) => sub.parentId === categoryId
        );
        setFilteredSubs(filtered);
    };

    // ================= SUBCATEGORY =================
    const handleSubCategoryChange = (value: string) => {
        const subId = value === "all" ? "" : value;

        const params = new URLSearchParams(searchParams.toString());

        if (subId) params.set("subCategory", subId);
        else params.delete("subCategory");

        params.set("page", "1");

        router.push(`?${params.toString()}`);
    };

    // ================= SORT =================
            const handleSort = (value: string | null) => {
            if (!value) return;

            const params = new URLSearchParams(searchParams.toString());

            params.set("sortBy", "createdAt");
            params.set("sortOrder", value);

            router.push(`?${params.toString()}`);
            };

    return (
        <div className="bg-white p-4 rounded-xl border flex flex-col md:flex-row gap-4 justify-between items-center">

            {/* SEARCH */}
            <div className="relative w-full md:w-96">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                    value={search}
                    onChange={(e) => handleSearch(e.target.value)}
                    placeholder="Search products..."
                    className="pl-10"
                />
            </div>

            {/* FILTERS */}
            <div className="flex flex-wrap gap-3 w-full md:w-auto">

                {/* CATEGORY */}
                <Select
                    value={searchParams.get("category") || "all"}
                    onValueChange={(value) => {
                        if (!value) return;
                        handleCategoryChange(value);
                    }}
                    >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>

                        {categories.map((cat: any) => (
                            <SelectItem key={cat.id} value={cat.id}>
                                {cat.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                {/* SUBCATEGORY */}
                <Select
                    value={searchParams.get("subCategory") || "all"}
                    onValueChange={(value) => {
                        if (!value) return;
                        handleSubCategoryChange(value);
                    }}
                    >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Sub Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All SubCategories</SelectItem>

                        {(filteredSubs.length ? filteredSubs : subCategories).map(
                            (sub: any) => (
                                <SelectItem key={sub.id} value={sub.id}>
                                    {sub.name}
                                </SelectItem>
                            )
                        )}
                    </SelectContent>
                </Select>

                {/* SORT */}
                <Select
                    onValueChange={handleSort}
                    value={searchParams.get("sortOrder") || "desc"}
                >
                    <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Sort" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="desc">Newest</SelectItem>
                        <SelectItem value="asc">Oldest</SelectItem>
                    </SelectContent>
                </Select>

            </div>
        </div>
    );
};

export default ProductFilters;