import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export enum StockStatus {
  IN_STOCK = "IN_STOCK",
  OUT_OF_STOCK = "OUT_OF_STOCK",
  LOW_STOCK = "LOW_STOCK",
}

interface BasicDetailsData {
  name: string
  regularPrice: string
  salePrice: string
  shortDescription: string
  fullDescription: string
  sku: string
  stockQuantity: number
  stockStatus: StockStatus
}

interface BasicDetailsProps {
  data: BasicDetailsData
  onChange: <K extends keyof BasicDetailsData>(
    field: K,
    value: BasicDetailsData[K]
  ) => void
}

export function BasicDetailsCard({ data, onChange }: BasicDetailsProps) {
  return (
    <Card title="Basic Information">
      <div className="space-y-4 px-2">

        {/* Product Name */}
        <Field label="Product Name">
          <Input
            value={data.name ?? ""}
            onChange={(e) => onChange("name", e.target.value)}
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
          {/* SKU */}
          <Field label="SKU">
            <Input
              placeholder="TSHIRT-BLK-M"
              value={data.sku}
              onChange={(e) => onChange("sku", e.target.value)}
            />
          </Field>

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

          {/* Stock Status – full width */}
          <div className="md:col-span-2">
            <Field label="Stock Status">
              <Select
                value={data.stockStatus}
                onValueChange={(value) =>
                  onChange("stockStatus", value as StockStatus)
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={StockStatus.IN_STOCK}>In Stock</SelectItem>
                  <SelectItem value={StockStatus.LOW_STOCK}>Low Stock</SelectItem>
                  <SelectItem value={StockStatus.OUT_OF_STOCK}>Out of Stock</SelectItem>
                </SelectContent>
              </Select>
            </Field>
          </div>
        </div>


        {/* Short Description */}
        <Field label="Short Description">
          <Textarea
            rows={2}
            maxLength={160}
            value={data.shortDescription}
            onChange={(e) =>
              onChange("shortDescription", e.target.value)
            }
          />
          <p className="text-xs text-right text-muted-foreground">
            {data.shortDescription.length}/160
          </p>
        </Field>

        {/* Full Description */}
        <Field label="Full Description">
          <Textarea
            rows={6}
            className="h-28"
            value={data.fullDescription}
            onChange={(e) =>
              onChange("fullDescription", e.target.value)
            }
          />
        </Field>
      </div>
    </Card>
  )
}

function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-slate-700">
        {label}
      </label>
      {children}
    </div>
  )
}