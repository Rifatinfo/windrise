/**
 * SKU generation.
 *
 * Kept free of React so the rules can be reasoned about (and tested) on
 * their own. The Add/Edit Product pages drive everything through
 * `buildSku` and `computeVariantSku`.
 */

/** Dropped from the product name before building the name segment. */
export const SKU_STOPWORDS = [
    'the', 'a', 'an', 'for', 'with', 'of', 'and', 'in', 'on', 'by',
];

export type SkuSegmentKey = 'custom' | 'name' | 'category' | 'random';

export type SkuSegment = {
    key: SkuSegmentKey;
    label: string;
    enabled: boolean;
    /** Custom-prefix text. Only meaningful for the `custom` segment. */
    value?: string;
    /** Digit count. Only meaningful for the `random` segment. */
    digits?: number;
};

export type SkuSeparator = '-' | '_' | '';

export type SkuFormatConfig = {
    separator: SkuSeparator;
    segments: SkuSegment[];
};

export const DEFAULT_SKU_FORMAT: SkuFormatConfig = {
    separator: '-',
    segments: [
        { key: 'custom', label: 'Custom Prefix', enabled: false, value: 'WR' },
        { key: 'name', label: 'Product Name Code', enabled: true },
        { key: 'category', label: 'Category Code', enabled: false },
        { key: 'random', label: 'Random Digits', enabled: true, digits: 3 },
    ],
};

export const SKU_DIGIT_CHOICES = [2, 3, 4, 5];

const alphanumeric = (value: string) => value.replace(/[^a-zA-Z0-9]/g, '');

/** Strip punctuation, cap at 4 characters, uppercase. */
const slugWord = (word: string) => alphanumeric(word).substring(0, 4).toUpperCase();

/**
 * Deterministic digits derived from the product name, so the same name
 * always yields the same SKU (no surprise churn between renders/saves).
 */
export function nameHashSuffix(name: string, digits: number): string {
    const safeDigits = Math.max(1, digits);
    const mod = Math.pow(10, safeDigits);
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = (hash * 31 + name.charCodeAt(i)) % mod;
    }
    return String(hash).padStart(safeDigits, '0');
}

/** First three meaningful words, e.g. "Nike Air Max 90" -> "NIKE-AIR-MAX". */
export function buildNameSegment(name: string, separator: string): string {
    const words = name
        .split(/\s+/)
        .filter((word) => word && !SKU_STOPWORDS.includes(word.toLowerCase()));
    const parts = words.slice(0, 3).map(slugWord).filter(Boolean);
    return parts.length ? parts.join(separator) : 'ITEM';
}

export function buildCategorySegment(categoryName?: string): string {
    if (!categoryName) return '';
    return alphanumeric(categoryName).substring(0, 4).toUpperCase();
}

/** Assembles the enabled segments, in their configured order. */
export function buildSku(
    name: string,
    config: SkuFormatConfig,
    categoryName?: string
): string {
    const separator = config.separator;
    const parts: string[] = [];

    config.segments.forEach((segment) => {
        if (!segment.enabled) return;

        if (segment.key === 'custom' && segment.value) {
            const prefix = alphanumeric(segment.value).toUpperCase();
            if (prefix) parts.push(prefix);
        }
        if (segment.key === 'name') {
            parts.push(buildNameSegment(name, separator));
        }
        if (segment.key === 'category') {
            const code = buildCategorySegment(categoryName);
            if (code) parts.push(code);
        }
        if (segment.key === 'random') {
            parts.push(nameHashSuffix(name, segment.digits ?? 3));
        }
    });

    // Never hand back an empty SKU just because every segment was disabled.
    return parts.length ? parts.join(separator) : buildNameSegment(name, separator);
}

/** `{mainSku}-{COL}-{SIZE}`, blank until a main SKU exists. */
export function computeVariantSku(
    mainSku: string,
    color: string,
    size: string
): string {
    if (!mainSku) return '';
    // Strip punctuation/spaces first — "In tenetur" must give "INT", not "IN ",
    // so a SKU never carries whitespace into URLs, exports or barcodes.
    const colorCode = alphanumeric(color).substring(0, 3).toUpperCase() || 'CLR';
    const sizeCode = alphanumeric(size).toUpperCase() || 'SZ';
    return `${mainSku}-${colorCode}-${sizeCode}`;
}

/** Human summary of the active format, shown under the SKU field. */
export function describeSkuFormat(config: SkuFormatConfig): string {
    const labels = config.segments
        .filter((segment) => segment.enabled)
        .map((segment) =>
            segment.label.replace(' Code', '').replace('Product ', '')
        );
    return `Format: ${labels.join(' + ') || 'Product Name'}. Use Format SKU to customize, or Edit SKU to type your own.`;
}
