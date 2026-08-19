'use client';

import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, X } from 'lucide-react';

import {
    buildSku,
    SKU_DIGIT_CHOICES,
    type SkuFormatConfig,
    type SkuSeparator,
} from '@/lib/sku';

const SEPARATORS: { label: string; value: SkuSeparator }[] = [
    { label: 'Hyphen (-)', value: '-' },
    { label: 'Underscore (_)', value: '_' },
    { label: 'None', value: '' },
];

const PREVIEW_FALLBACK_NAME = 'Nike Air Max 90 Sneakers';

type Props = {
    /** Seeds the local draft. The parent mounts this only while open, so a
     *  fresh copy is taken every time the modal is opened. */
    config: SkuFormatConfig;
    /** Live product name, so the preview reflects what will actually be built. */
    productName: string;
    /** First selected category name, or undefined when none is chosen yet. */
    categoryName?: string;
    onClose: () => void;
    onApply: (config: SkuFormatConfig) => void;
};

export function FormatSkuModal({
    config,
    productName,
    categoryName,
    onClose,
    onApply,
}: Props) {
    // Edits stay local until "Apply Format", so Cancel truly discards.
    const [draft, setDraft] = useState<SkuFormatConfig>(config);

    useEffect(() => {
        const onKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onClose]);

    const previewName = productName.trim() || PREVIEW_FALLBACK_NAME;
    const preview = buildSku(previewName, draft, categoryName);

    const patchSegment = (index: number, patch: Partial<SkuFormatConfig['segments'][number]>) =>
        setDraft((prev) => ({
            ...prev,
            segments: prev.segments.map((segment, i) =>
                i === index ? { ...segment, ...patch } : segment
            ),
        }));

    const moveSegment = (index: number, direction: -1 | 1) => {
        const target = index + direction;
        if (target < 0 || target >= draft.segments.length) return;
        setDraft((prev) => {
            const segments = [...prev.segments];
            [segments[index], segments[target]] = [segments[target], segments[index]];
            return { ...prev, segments };
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-[2px]"
            onClick={onClose}
            role="presentation"
        >
            <div
                role="dialog"
                aria-modal="true"
                aria-label="Format SKU"
                onClick={(event) => event.stopPropagation()}
                className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h2 className="text-base font-bold text-slate-900">Format SKU</h2>
                    <button
                        type="button"
                        aria-label="Close"
                        onClick={onClose}
                        className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 cursor-pointer"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <div className="space-y-3 px-5 py-4">
                    {/* Live preview */}
                    <div className="rounded-xl bg-slate-900 px-4 py-4 text-center">
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                            Preview
                        </p>
                        <p className="mt-1.5 font-mono text-base font-bold tracking-wide text-white break-all">
                            {preview}
                        </p>
                    </div>

                    {/* Reorderable segments */}
                    <div className="space-y-2">
                        {draft.segments.map((segment, index) => {
                            const categoryMissing =
                                segment.key === 'category' && !categoryName;

                            return (
                                <div
                                    key={segment.key}
                                    className="flex items-stretch gap-2 rounded-xl border border-slate-200 p-2"
                                >
                                    {/* Reorder */}
                                    <div className="flex flex-col justify-center gap-0.5">
                                        <button
                                            type="button"
                                            aria-label={`Move ${segment.label} up`}
                                            disabled={index === 0}
                                            onClick={() => moveSegment(index, -1)}
                                            className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            <ChevronUp className="h-3.5 w-3.5" strokeWidth={3} />
                                        </button>
                                        <button
                                            type="button"
                                            aria-label={`Move ${segment.label} down`}
                                            disabled={index === draft.segments.length - 1}
                                            onClick={() => moveSegment(index, 1)}
                                            className="rounded p-0.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 disabled:opacity-30 disabled:hover:bg-transparent cursor-pointer disabled:cursor-not-allowed"
                                        >
                                            <ChevronDown className="h-3.5 w-3.5" strokeWidth={3} />
                                        </button>
                                    </div>

                                    <div className="min-w-0 flex-1 py-1">
                                        <label className="flex cursor-pointer items-center gap-2.5">
                                            <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    checked={segment.enabled}
                                                    onChange={(event) =>
                                                        patchSegment(index, {
                                                            enabled: event.target.checked,
                                                        })
                                                    }
                                                    className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[5px] border border-slate-300 bg-white transition-colors checked:border-indigo-600 checked:bg-indigo-600"
                                                />
                                                <svg
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={3.5}
                                                    className="pointer-events-none relative h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
                                                >
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            </span>
                                            <span className="text-sm font-semibold text-slate-800">
                                                {segment.label}
                                            </span>
                                        </label>

                                        {segment.key === 'custom' && (
                                            <input
                                                type="text"
                                                value={segment.value ?? ''}
                                                disabled={!segment.enabled}
                                                placeholder="e.g. WR"
                                                onChange={(event) =>
                                                    patchSegment(index, { value: event.target.value })
                                                }
                                                className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 disabled:bg-slate-50 disabled:text-slate-400"
                                            />
                                        )}

                                        {segment.key === 'random' && (
                                            <select
                                                value={segment.digits ?? 3}
                                                disabled={!segment.enabled}
                                                onChange={(event) =>
                                                    patchSegment(index, {
                                                        digits: Number(event.target.value),
                                                    })
                                                }
                                                className="mt-2 h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none transition-colors focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15 disabled:bg-slate-50 disabled:text-slate-400"
                                            >
                                                {SKU_DIGIT_CHOICES.map((digits) => (
                                                    <option key={digits} value={digits}>
                                                        {digits} digits
                                                    </option>
                                                ))}
                                            </select>
                                        )}

                                        {categoryMissing && (
                                            <p className="mt-1.5 text-xs text-slate-400">
                                                No category selected yet — this segment will be skipped
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Separator */}
                    <div>
                        <p className="mb-2 text-sm font-semibold text-slate-800">Separator</p>
                        <div className="grid grid-cols-3 gap-2">
                            {SEPARATORS.map((option) => {
                                const active = draft.separator === option.value;
                                return (
                                    <button
                                        key={option.label}
                                        type="button"
                                        aria-pressed={active}
                                        onClick={() =>
                                            setDraft((prev) => ({ ...prev, separator: option.value }))
                                        }
                                        className={`h-10 rounded-xl border text-sm font-semibold transition-colors cursor-pointer ${
                                            active
                                                ? 'border-indigo-200 bg-indigo-50 text-indigo-600'
                                                : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-600 transition-colors hover:bg-slate-50 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={() => onApply(draft)}
                        className="h-10 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-slate-800 cursor-pointer"
                    >
                        Apply Format
                    </button>
                </div>
            </div>
        </div>
    );
}
