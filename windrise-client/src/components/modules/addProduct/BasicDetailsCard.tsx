"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "@/components/ui/select";
import { RichTextEditor } from "@/components/shared/richTextEditor/RichTextEditor";
import { SkuField } from "./SkuField";
import { buildSku, DEFAULT_SKU_FORMAT, type SkuFormatConfig } from "@/lib/sku";

export enum StockStatus {
  IN_STOCK = "IN_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  LOW_STOCK = "LOW_STOCK",
}

/**
 * Only the statuses the backend enum accepts. Adding more (e.g. Backorder)
 * needs a Prisma enum change + migration first.
 */
const STOCK_STATUSES: { value: StockStatus; label: string; dot: string }[] = [
  { value: StockStatus.IN_STOCK, label: "In Stock", dot: "bg-green-600" },
  { value: StockStatus.LOW_STOCK, label: "Low Stock", dot: "bg-amber-500" },
  { value: StockStatus.OUT_OF_STOCK, label: "Out of Stock", dot: "bg-red-500" },
];

const PRODUCT_NAME_ID = "product-name-input";

interface BasicDetailsData {
  name: string;
  regularPrice: string;
  salePrice: string;
  shortDescription: string;
  fullDescription: string;
  sku: string;
  stockQuantity: number;
  stockStatus: StockStatus;
}

interface BasicDetailsProps {
  data: BasicDetailsData;
  onChange: <K extends keyof BasicDetailsData>(
    field: K,
    value: BasicDetailsData[K],
  ) => void;
}

export function BasicDetailsCard({ data, onChange }: BasicDetailsProps) {
  const [skuFormat, setSkuFormat] =
    useState<SkuFormatConfig>(DEFAULT_SKU_FORMAT);
  const [skuManual, setSkuManual] = useState(false);

  const selectedStatus = STOCK_STATUSES.find(
    (s) => s.value === data.stockStatus,
  );

  // Renaming the product keeps an auto-generated SKU in sync, but never
  // touches one the admin has locked or hasn't generated yet.
  const handleNameChange = (value: string) => {
    onChange("name", value);
    if (!skuManual && data.sku && value.trim()) {
      onChange("sku", buildSku(value.trim(), skuFormat));
    }
  };

  return (
    <Card title="Basic Information">
      <div className="space-y-4 px-2">
        {/* Product Name */}
        <Field label="Product Name">
          <Input
            id={PRODUCT_NAME_ID}
            placeholder="e.g. Nike Air Max 90 Sneakers"
            value={data.name ?? ""}
            onChange={(e) => handleNameChange(e.target.value)}
          />
        </Field>

        {/* Prices */}
        <div className="grid md:grid-cols-2 gap-6">
          <Field label="Regular Price">
            <Input
              type="number"
              value={data.regularPrice}
              onChange={(e) => onChange("regularPrice", e.target.value)}
            />
          </Field>

          <Field label="Sale Price">
            <Input
              type="number"
              value={data.salePrice}
              onChange={(e) => onChange("salePrice", e.target.value)}
            />
          </Field>
        </div>

        {/* 🔹 NEW 3 FIELDS (Responsive) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* SKU – generated from the product name, or typed manually */}
          <div className="md:col-span-2">
            <Field label="SKU">
              <SkuField
                productName={data.name ?? ""}
                sku={data.sku}
                onSkuChange={(sku) => onChange("sku", sku)}
                format={skuFormat}
                onFormatChange={setSkuFormat}
                isManual={skuManual}
                onIsManualChange={setSkuManual}
                onRequestNameFocus={() =>
                  document.getElementById(PRODUCT_NAME_ID)?.focus()
                }
              />
            </Field>
          </div>

          {/* Stock Status – full width */}
          <div className=" flex-1 items-center justify-center"></div>
        </div>

        <div className="flex gap-4 items-start">
          <div className="flex-1">
            <Field label="Stock Status">
              <Select
                value={data.stockStatus}
                onValueChange={(value) =>
                  onChange("stockStatus", value as StockStatus)
                }
              >
                <SelectTrigger className="w-full">
                  {/* Rendered explicitly (rather than via SelectValue) so the
                      dot + friendly label show instead of the raw enum. */}
                  <span className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={`h-2 w-2 shrink-0 rounded-full ${selectedStatus?.dot ?? "bg-slate-400"}`}
                    />
                    <span className="font-medium">
                      {selectedStatus?.label ?? "Select status"}
                    </span>
                  </span>
                </SelectTrigger>
                <SelectContent>
                  {STOCK_STATUSES.map((status) => (
                    <SelectItem
                      key={status.value}
                      value={status.value}
                      label={status.label}
                    >
                      <span className="flex items-center gap-2">
                        <span
                          aria-hidden="true"
                          className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`}
                        />
                        <span className="font-medium">{status.label}</span>
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>

          <div className="flex-1">
            {/* Stock Quantity */}
            <Field label="Stock Quantity">
              <Input
                type="number"
                min={0}
                value={data.stockQuantity}
                onChange={(e) =>
                  onChange("stockQuantity", Number(e.target.value))
                }
              />
            </Field>
          </div>
        </div>
        {/* Short Description */}
        <Field label="Short Description">
          <Textarea
            rows={2}
            maxLength={160}
            value={data.shortDescription}
            onChange={(e) => onChange("shortDescription", e.target.value)}
          />
          <p className="text-xs text-right text-muted-foreground">
            {data.shortDescription.length}/160
          </p>
        </Field>

        {/* Full Description */}
        <Field label="Full Description">
          <RichTextEditor
            value={data.fullDescription}
            onChange={(html) => onChange("fullDescription", html)}
          />
        </Field>
      </div>
    </Card>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">{label}</label>
      {children}
    </div>
  );
}
