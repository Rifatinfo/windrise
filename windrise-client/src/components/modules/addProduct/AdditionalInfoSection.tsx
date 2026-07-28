
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Plus, X } from 'lucide-react'
export interface InfoItem {
    id: string
    label: string
    value: string
}
interface AdditionalInfoProps {
    items: InfoItem[]
    onChange: (items: InfoItem[]) => void
}
export function AdditionalInfoSection({
    items,
    onChange,
}: AdditionalInfoProps) {
    const addItem = () => {
        const newItem: InfoItem = {
            id: Math.random().toString(36).substr(2, 9),
            label: '',
            value: '',
        }
        onChange([...items, newItem])
    }
    const removeItem = (id: string) => {
        onChange(items.filter((i) => i.id !== id))
    }
    const updateItem = (id: string, field: keyof InfoItem, value: string) => {
        onChange(
            items.map((i) =>
                i.id === id
                    ? {
                        ...i,
                        [field]: value,
                    }
                    : i,
            ),
        )
    }
    return (
        <Card>
            <div className="mb-4 px-2">
                <h2 className="text-lg font-semibold">Additional Information</h2>
                <p className="text-sm text-slate-600">Add custom details like material, fit, or care instructions</p>
            </div>
            <div className="space-y-4 px-2">
                {items.map((item) => (
                    <div key={item.id} className="flex gap-4 items-start">
                        <div className="flex-1">
                            <Input
                                placeholder="Label (e.g. Material)"
                                value={item.label}
                                onChange={(e) => updateItem(item.id, 'label', e.target.value)}
                            />
                        </div>
                        <div className="flex-1">
                            <Input
                                placeholder="Value (e.g. 100% Cotton)"
                                value={item.value}
                                onChange={(e) => updateItem(item.id, 'value', e.target.value)}
                            />
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="mt-0.5 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                            onClick={() => removeItem(item.id)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                ))}

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={addItem}
                    className="w-full border-dashed border-slate-300 bg-slate-50 hover:bg-slate-100 py-5 cursor-pointer"
                >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Custom Field
                </Button>
            </div>
        </Card>
    )
}