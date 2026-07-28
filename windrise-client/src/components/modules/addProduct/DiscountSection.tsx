import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type DiscountType = "PERCENTAGE" | "FIXED";

type Props = {
    discount: {
        type: DiscountType,
        value: number,
        startDate?: string,
        endDate?: string
    };
    onChange: (date: any) => void
}

const DiscountSection = ({ discount, onChange }: Props) => {
    return (
        <div className="bg-white p-5 rounded-xl border space-y-4">
            <h2 className="font-semibold text-lg">Discount</h2>

            {/*================= Type ================*/}
            <Select
                value={discount.type}
                onValueChange={(value) =>
                    onChange({ ...discount, type: value })
                }
            >
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount TK</SelectItem>
                </SelectContent>
            </Select>

            {/*================ Value =================*/}
            <Input
                type="number"
                placeholder="Discount value"
                value={discount.value || ""}
                onChange={(e) =>
                    onChange({ ...discount, value: Number(e.target.value) })
                }
            />

            {/*=============== Dates ===================*/}
            <div className="grid grid-cols-2 gap-3">
                <Input
                    type="date"
                    value={discount.startDate || ""}
                    onChange={(e) =>
                        onChange({ ...discount, startDate: e.target.value })
                    }
                />
                <Input
                    type="date"
                    value={discount.endDate || ""}
                    onChange={(e) =>
                        onChange({ ...discount, endDate: e.target.value })
                    }
                />
            </div>
        </div>
    );
}

export default DiscountSection;