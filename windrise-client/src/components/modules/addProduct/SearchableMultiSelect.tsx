'use client';

import { useMemo, useState } from 'react';
import { Check, Diamond, Plus, Search, Trash, Trash2, X } from 'lucide-react';

import Spinner from '@/components/shared/Spinner';
import ListSkeleton from '@/components/shared/skeleton/ListSkeleton';
import ConfirmDialog from '@/components/shared/ConfirmDialog';

export type Option = {
    id: string;
    name: string;
};

/** Trimmed + case-insensitive key used for all duplicate checks. */
export const normalizeName = (value: string) => value.trim().toLowerCase();

/** How many rows to reveal at a time. */
const PAGE_SIZE = 10;

type Props = {
    title: string;
    /** The full list. Searching always runs against this, never just the visible page. */
    options: Option[];
    selectedIds: string[];
    loading: boolean;
    creating: boolean;
    /** Lowercase singular noun, e.g. "category". */
    entityLabel: string;
    /** Lowercase plural noun used in the helper line, e.g. "categories". */
    entityPlural: string;
    /** Example name shown in the inline create field. */
    createExample: string;
    deleteTitle: string;
    deleteDescription: string;
    onToggle: (id: string) => void;
    /** Creates the option remotely, then selects it. Resolves once done. */
    onCreate: (name: string) => Promise<void>;
    /** Permanently deletes the option from the database. */
    onDelete: (id: string) => void;
};

export function SearchableMultiSelect({
    title,
    options,
    selectedIds,
    loading,
    creating,
    entityLabel,
    entityPlural,
    createExample,
    deleteTitle,
    deleteDescription,
    onToggle,
    onCreate,
    onDelete,
}: Props) {
    const [search, setSearch] = useState('');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
    const [createOpen, setCreateOpen] = useState(false);
    const [createValue, setCreateValue] = useState('');

    const query = normalizeName(search);

    const validOptions = useMemo(
        () => options.filter((option) => option?.id && option?.name),
        [options]
    );

    // Searching spans every loaded option, so a match sitting past the
    // current page (e.g. item #50) is still reachable.
    const matches = useMemo(() => {
        if (!query) return validOptions;
        return validOptions.filter((option) =>
            normalizeName(option.name).includes(query)
        );
    }, [validOptions, query]);

    const visibleOptions = matches.slice(0, visibleCount);
    const hasMore = matches.length > visibleCount;

    const exactMatch = useMemo(
        () =>
            query
                ? validOptions.find((option) => normalizeName(option.name) === query)
                : undefined,
        [validOptions, query]
    );

    // Chips are derived from the selection, not the search, so they survive
    // the search input being cleared.
    const selectedOptions = useMemo(
        () =>
            selectedIds
                .map((id) => validOptions.find((option) => option.id === id))
                .filter(Boolean) as Option[],
        [selectedIds, validOptions]
    );

    const updateSearch = (value: string) => {
        setSearch(value);
        setVisibleCount(PAGE_SIZE);
    };

    const selectIfNeeded = (id: string) => {
        if (!selectedIds.includes(id)) onToggle(id);
    };

    /**
     * Shared create path for the Enter key, the "Add …" row and the + field.
     * An existing name is never re-created — it just gets selected.
     */
    const createOrSelect = async (rawName: string, onDone: () => void) => {
        const name = rawName.trim();
        if (!name || creating) return;

        const duplicate = validOptions.find(
            (option) => normalizeName(option.name) === normalizeName(name)
        );

        if (duplicate) {
            selectIfNeeded(duplicate.id);
            onDone();
            return;
        }

        await onCreate(name);
        onDone();
    };

    const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key !== 'Enter') return;
        // Never let this bubble up and submit the surrounding product form.
        event.preventDefault();
        if (!search.trim()) return;

        if (exactMatch) {
            selectIfNeeded(exactMatch.id);
            updateSearch('');
            return;
        }
        void createOrSelect(search, () => updateSearch(''));
    };

    const closeCreateField = () => {
        setCreateOpen(false);
        setCreateValue('');
    };

    const showSuggestion = Boolean(query) && !exactMatch;

    return (
        <>
            {/* Header */}
            <div className="flex items-center justify-between gap-2">
                <h3 className="flex items-center gap-2 text-[15px] font-bold text-slate-900">
                    <Diamond className="h-4 w-4 text-slate-900" strokeWidth={2} />
                    {title}
                </h3>
                <span className="shrink-0 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">
                    {selectedIds.length} selected
                </span>
            </div>

            {/* Selected chips — removing one only deselects, it never deletes. */}
            {selectedOptions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2 ">
                    {selectedOptions.map((option) => (
                        <span
                            key={option.id}
                            className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 py-1 pl-3 pr-1.5 text-xs font-semibold text-indigo-700"
                        >
                            {option.name}
                            <button
                                type="button"
                                aria-label={`Remove ${option.name}`}
                                onClick={() => onToggle(option.id)}
                                className="rounded-full p-0.5 text-indigo-400 transition-colors hover:bg-indigo-100 hover:text-indigo-700 cursor-pointer"
                            >
                                <X className="h-3 w-3" strokeWidth={2.5} />
                            </button>
                        </span>
                    ))}
                </div>
            )}

            {/* Search + open-create-field button */}
            <div className="mt-3 flex gap-2">
                <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4  -translate-y-1/2 text-slate-400" />
                    <input
                        value={search}
                        onChange={(event) => updateSearch(event.target.value)}
                        onKeyDown={handleSearchKeyDown}
                        placeholder={`Search or add ${entityLabel}...`}
                        className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
                    />
                </div>
                <button
                    type="button"
                    aria-label={`Add new ${entityLabel}`}
                    aria-expanded={createOpen}
                    onClick={() => (createOpen ? closeCreateField() : setCreateOpen(true))}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-900 text-white transition-colors hover:bg-slate-800 cursor-pointer"
                >
                    <Plus className="h-5 w-5" strokeWidth={2.5} />
                </button>
            </div>

            {/* Inline create field revealed by the + button (no modal) */}
            {createOpen && (
                <div className="mt-2 flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50/60 p-2">
                    <input
                        autoFocus
                        value={createValue}
                        onChange={(event) => setCreateValue(event.target.value)}
                        onKeyDown={(event) => {
                            if (event.key !== 'Enter') return;
                            event.preventDefault();
                            void createOrSelect(createValue, closeCreateField);
                        }}
                        placeholder={`e.g. ${createExample}`}
                        className="h-10 flex-1 rounded-lg border border-slate-200 bg-white px-1 text-sm text-slate-700 outline-none transition-colors placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/15"
                    />
                    <button
                        type="button"
                        aria-label={`Create ${entityLabel}`}
                        disabled={!createValue.trim() || creating}
                        onClick={() => void createOrSelect(createValue, closeCreateField)}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white transition-colors hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {creating ? <Spinner size={18} /> : <Check className="h-5 w-5" strokeWidth={2.5} />}
                    </button>
                    <button
                        type="button"
                        aria-label="Cancel"
                        onClick={closeCreateField}
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-white hover:text-slate-600 cursor-pointer"
                    >
                        <X className="h-5 w-5" strokeWidth={2.5} />
                    </button>
                </div>
            )}

            {/* Results box — scrolls once the rows outgrow its height */}
            <div className="scrollbar-auto mt-3 max-h-56 overflow-y-auto rounded-xl border border-slate-200 p-1.5">
                {loading ? (
                    <div className="p-2">
                        <ListSkeleton count={5} />
                    </div>
                ) : (
                    <>
                        {visibleOptions.map((option) => {
                            const checked = selectedIds.includes(option.id);
                            return (
                                <div
                                    key={option.id}
                                    className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-slate-50"
                                >
                                    <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-3">
                                        <span className="relative flex h-[18px] w-[18px] shrink-0 items-center justify-center">
                                            <input
                                                type="checkbox"
                                                checked={checked}
                                                onChange={() => onToggle(option.id)}
                                                className="peer absolute inset-0 h-full w-full cursor-pointer appearance-none rounded-[5px] border border-slate-300 bg-white transition-colors checked:border-indigo-600 checked:bg-indigo-600 focus-visible:ring-2 focus-visible:ring-indigo-500/40 focus-visible:outline-none"
                                            />
                                            <Check
                                                className="pointer-events-none relative h-3 w-3 text-white opacity-0 peer-checked:opacity-100"
                                                strokeWidth={3.5}
                                            />
                                        </span>
                                        <span className="truncate text-sm text-slate-600">
                                            {option.name}
                                        </span>
                                    </label>

                                    <ConfirmDialog
                                        trigger={
                                            <span className="cursor-pointer text-red-500 opacity-0 transition-opacity group-hover:opacity-100">
                                                <Trash2  className="h-4 w-4" />
                                            </span>
                                        }
                                        title={deleteTitle}
                                        description={deleteDescription}
                                        onConfirm={() => onDelete(option.id)}
                                    />
                                </div>
                            );
                        })}

                        {/* Offer to create only when nothing matches that exact name */}
                        {showSuggestion && (
                            <button
                                type="button"
                                disabled={creating}
                                onClick={() => void createOrSelect(search, () => updateSearch(''))}
                                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-semibold text-indigo-600 transition-colors hover:bg-indigo-50 disabled:opacity-60 cursor-pointer"
                            >
                                {creating ? (
                                    <Spinner size={16} />
                                ) : (
                                    <Plus className="h-4 w-4 shrink-0" strokeWidth={2.5} />
                                )}
                                <span className="truncate">
                                    Add &quot;{search.trim()}&quot; as new {entityLabel}
                                </span>
                            </button>
                        )}

                        {hasMore && (
                            <button
                                type="button"
                                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                                className="mt-1 w-full rounded-lg py-2 text-sm font-semibold text-slate-500 transition-colors hover:bg-slate-50 cursor-pointer"
                            >
                                Load more
                            </button>
                        )}

                        {visibleOptions.length === 0 && !showSuggestion && (
                            <p className="px-3 py-2.5 text-sm text-slate-400">
                                No {entityPlural} yet.
                            </p>
                        )}
                    </>
                )}
            </div>

            <p className="mt-2.5 text-xs text-slate-400">
                Search existing {entityPlural}, press Enter to add a new one, or use the{' '}
                <span className="font-semibold text-indigo-500">+</span> button.
            </p>
        </>
    );
}
