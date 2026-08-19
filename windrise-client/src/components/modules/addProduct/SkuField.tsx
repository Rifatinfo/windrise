'use client';

import { useRef, useState } from 'react';
import { Check, Sparkles, SlidersHorizontal, SquarePen } from 'lucide-react';

import {
    buildSku,
    describeSkuFormat,
    DEFAULT_SKU_FORMAT,
    type SkuFormatConfig,
} from '@/lib/sku';
import { FormatSkuModal } from './FormatSkuModal';
import { SkuToast } from './skuToast';

type Props = {
    /** Current product name — the SKU is derived from it. */
    productName: string;
    sku: string;
    onSkuChange: (sku: string) => void;
    /** Active format, owned by the parent so name edits can reuse it. */
    format: SkuFormatConfig;
    onFormatChange: (format: SkuFormatConfig) => void;
    /**
     * True once the SKU has been authored by hand. While set, renaming the
     * product must not regenerate it. "Generate SKU" clears it.
     */
    isManual: boolean;
    onIsManualChange: (manual: boolean) => void;
    /** First selected category name, feeding the optional Category segment. */
    categoryName?: string;
    /** Focuses the Product Name input when generation is attempted without one. */
    onRequestNameFocus?: () => void;
};

export function SkuField({
    productName,
    sku,
    onSkuChange,
    format,
    onFormatChange,
    isManual,
    onIsManualChange,
    categoryName,
    onRequestNameFocus,
}: Props) {
    const [formatOpen, setFormatOpen] = useState(false);
    // Whether the input is currently unlocked for typing.
    const [editing, setEditing] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const generate = () => {
        const name = productName.trim();
        if (!name) {
            SkuToast.fire({ icon: 'error', title: 'Enter a product name first' });
            onRequestNameFocus?.();
            return;
        }
        onSkuChange(buildSku(name, format, categoryName));
        // Explicitly generating hands control back to auto mode.
        onIsManualChange(false);
    };

    const toggleEditing = () => {
        if (!editing) {
            setEditing(true);
            // Let the readOnly flag clear before focusing.
            window.setTimeout(() => {
                inputRef.current?.focus();
                inputRef.current?.select();
            }, 0);
            return;
        }
        setEditing(false);
        onSkuChange(sku.trim());
        // The value is now hand-authored: renames must leave it alone.
        onIsManualChange(true);
        SkuToast.fire({ title: 'SKU locked' });
    };

    const applyFormat = (next: SkuFormatConfig) => {
        onFormatChange(next);
        setFormatOpen(false);
        // A hand-authored SKU is the admin's own text — never overwrite it.
        if (!isManual && productName.trim()) {
            onSkuChange(buildSku(productName.trim(), next, categoryName));
        }
        SkuToast.fire({ title: 'SKU format applied' });
    };

    return (
        <>
            <div className="flex flex-wrap items-center gap-2">
                <input
                    ref={inputRef}
                    value={sku}
                    readOnly={!editing}
                    placeholder="Not generated yet"
                    onChange={(event) => onSkuChange(event.target.value)}
                    className={`h-9 min-w-0 flex-1 rounded-lg border px-3 text-sm outline-none transition-colors placeholder:text-slate-400 ${
                        editing
                            ? 'border-indigo-300 bg-white text-slate-800 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15'
                            : 'border-slate-200 bg-slate-50 text-slate-600'
                    }`}
                />

                <button
                    type="button"
                    onClick={generate}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg bg-slate-900 px-3 text-[13px] font-semibold text-white transition-colors hover:bg-slate-800 cursor-pointer"
                >
                    <Sparkles className="h-3.5 w-3.5" strokeWidth={2.5} />
                    Generate SKU
                </button>

                <button
                    type="button"
                    onClick={toggleEditing}
                    className={`inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border px-3 text-[13px] font-semibold transition-colors cursor-pointer ${
                        editing
                            ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                >
                    {editing ? (
                        <>
                            <Check className="h-3.5 w-3.5" strokeWidth={3} />
                            Lock SKU
                        </>
                    ) : (
                        <>
                            <SquarePen className="h-3.5 w-3.5" strokeWidth={2} />
                            Edit SKU
                        </>
                    )}
                </button>

                <button
                    type="button"
                    onClick={() => setFormatOpen(true)}
                    className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 text-[13px] font-semibold text-slate-700 transition-colors hover:bg-slate-50 cursor-pointer"
                >
                    <SlidersHorizontal className="h-3.5 w-3.5" strokeWidth={2} />
                    Format SKU
                </button>
            </div>

            <p className="mt-1.5 text-xs text-indigo-400">
                {describeSkuFormat(format)}
            </p>

            {formatOpen && (
                <FormatSkuModal
                    config={format}
                    productName={productName}
                    categoryName={categoryName}
                    onClose={() => setFormatOpen(false)}
                    onApply={applyFormat}
                />
            )}
        </>
    );
}

export { DEFAULT_SKU_FORMAT };
