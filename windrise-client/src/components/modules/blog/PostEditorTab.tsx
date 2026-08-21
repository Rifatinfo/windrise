"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CheckIcon,
  ImageIcon,
  Loader2Icon,
  SparklesIcon,
  TriangleAlertIcon,
  XIcon,
} from "lucide-react";

import { RichTextEditor } from "@/components/shared/richTextEditor/RichTextEditor";
import { ToggleSwitch } from "@/components/ui/toggle-switch";
import { Toast } from "@/components/shared/Toast/Toast";
import {
  createPost,
  getAuthors,
  getCategories,
  getPost,
  mediaUrl,
  suggestSeo,
  updatePost,
  uploadBlogImage,
} from "@/services/blog/blog";
import type { BlogAuthorOption, BlogCategory, BlogStatus } from "@/types/blog";
import { buildSeoChecks, computeSeoScore, countWords, seoBandColor } from "@/utils/seoScore";

const SITE = "windrise.com";

const slugify = (value: string) =>
  value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

/** The score ring beside the checklist. */
function ScoreRing({ score }: { score: number }) {
  const radius = 26;
  const circumference = 2 * Math.PI * radius;
  const color = seoBandColor(score);

  return (
    <svg width="70" height="70" viewBox="0 0 70 70" aria-hidden="true">
      <circle cx="35" cy="35" r={radius} fill="none" stroke="#f1f5f9" strokeWidth="7" />
      <circle
        cx="35"
        cy="35"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="7"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={circumference * (1 - score / 100)}
        transform="rotate(-90 35 35)"
        style={{ transition: "stroke-dashoffset 400ms ease, stroke 400ms ease" }}
      />
    </svg>
  );
}

function Field({
  label,
  children,
  counter,
  hint,
  required,
}: {
  label: string;
  children: React.ReactNode;
  counter?: string;
  hint?: string;
  required?: boolean;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <label className="text-[13px] font-semibold text-slate-800">
          {label}
          {required && <span className="ml-0.5 text-rose-500">*</span>}
        </label>
        {counter && <span className="text-[11px] text-slate-400">{counter}</span>}
      </div>
      <div className="mt-1.5">{children}</div>
      {hint && <p className="mt-1 text-[11px] text-slate-400">{hint}</p>}
    </div>
  );
}

const inputClass =
  "h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-[13px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-400";

export function PostEditorTab({
  postId,
  onSaved,
  onDone,
}: {
  /** Set when editing; null starts a blank post. */
  postId: string | null;
  onSaved: () => void;
  onDone: () => void;
}) {
  const [title, setTitle] = useState("");
  const [slugDraft, setSlugDraft] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [editingSlug, setEditingSlug] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");

  const [status, setStatus] = useState<BlogStatus>("PUBLISHED");
  const [publicationDate, setPublicationDate] = useState("");
  const [visibility, setVisibility] = useState<"PUBLIC" | "PRIVATE">("PUBLIC");

  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [focusKeyword, setFocusKeyword] = useState("");
  const [keywords, setKeywords] = useState("");
  const [canonicalUrl, setCanonicalUrl] = useState("");

  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  const [useCustomAuthor, setUseCustomAuthor] = useState(false);
  const [customAuthorName, setCustomAuthorName] = useState("");
  const [customAuthorAvatar, setCustomAuthorAvatar] = useState<string | null>(null);
  const [authorId, setAuthorId] = useState("");
  const [authors, setAuthors] = useState<BlogAuthorOption[]>([]);

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [categoryId, setCategoryId] = useState("");

  const [tags, setTags] = useState<string[]>([]);
  const [tagDraft, setTagDraft] = useState("");

  const [isFeatured, setIsFeatured] = useState(false);
  const [allowComments, setAllowComments] = useState(true);
  const [showAds, setShowAds] = useState(true);

  const [loading, setLoading] = useState(Boolean(postId));
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);

  // ---- Load reference data + the post being edited -------------------------

  useEffect(() => {
    getCategories()
      .then((res) => setCategories(res.data))
      .catch(() => undefined);
    getAuthors()
      .then((res) => {
        setAuthors(res.data);
        setAuthorId((current) => current || res.data[0]?.id || "");
      })
      .catch(() => undefined);
  }, []);

  useEffect(() => {
    if (!postId) return;
    let cancelled = false;

    // `loading` already starts true whenever postId is set, and the component
    // is remounted per post, so there is nothing to flip here.
    getPost(postId)
      .then((res) => {
        if (cancelled) return;
        const post = res.data;
        setTitle(post.title);
        setSlugDraft(post.slug);
        setSlugTouched(true);
        setExcerpt(post.excerpt ?? "");
        setContent(post.content ?? "");
        setStatus(post.status);
        setPublicationDate(post.publishedAt ? post.publishedAt.slice(0, 10) : "");
        setVisibility(post.visibility);
        setMetaTitle(post.metaTitle ?? "");
        setMetaDescription(post.metaDescription ?? "");
        setFocusKeyword(post.focusKeyword ?? "");
        setKeywords(post.keywords.join(", "));
        setCanonicalUrl(post.canonicalUrl ?? "");
        setFeaturedImage(post.featuredImage);
        setUseCustomAuthor(Boolean(post.customAuthorName));
        setCustomAuthorName(post.customAuthorName ?? "");
        setCustomAuthorAvatar(post.customAuthorAvatar);
        setAuthorId(post.authorId ?? "");
        setCategoryId(post.categoryId ?? "");
        setTags(post.tags.map((tag) => tag.name));
        setIsFeatured(post.isFeatured);
        setAllowComments(post.allowComments);
        setShowAds(post.showAds);
      })
      .catch((error) =>
        Toast.fire({
          icon: "error",
          title: error instanceof Error ? error.message : "Couldn't load the post",
        })
      )
      .finally(() => !cancelled && setLoading(false));

    return () => {
      cancelled = true;
    };
  }, [postId]);

  // A new post's permalink follows the title until it is edited by hand.
  // Derived during render rather than synced through an effect, so there is
  // never a frame where the two disagree.
  const slug = slugTouched ? slugDraft : slugify(title);

  // ---- Derived SEO state ---------------------------------------------------

  const seoInput = useMemo(
    () => ({ title, metaTitle, metaDescription, focusKeyword, content }),
    [title, metaTitle, metaDescription, focusKeyword, content]
  );
  const score = computeSeoScore(seoInput);
  const checks = buildSeoChecks(seoInput);
  const words = countWords(content);

  // ---- Actions -------------------------------------------------------------

  const handleUpload = async (file: File, target: "featured" | "author") => {
    setUploading(true);
    try {
      const res = await uploadBlogImage(file);
      if (target === "featured") setFeaturedImage(res.data.url);
      else setCustomAuthorAvatar(res.data.url);
      Toast.fire({ icon: "success", title: "Image uploaded" });
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Upload failed",
      });
    } finally {
      setUploading(false);
    }
  };

  const addTag = (raw: string) => {
    const value = raw.trim().replace(/,$/, "");
    if (!value) return;
    setTags((current) =>
      current.some((tag) => tag.toLowerCase() === value.toLowerCase())
        ? current
        : [...current, value]
    );
    setTagDraft("");
  };

  const handleGenerate = async () => {
    if (!title.trim()) {
      Toast.fire({ icon: "error", title: "Add a post title first" });
      return;
    }
    setGenerating(true);
    try {
      const res = await suggestSeo({
        title,
        excerpt: excerpt || null,
        content: content || null,
        categoryName: categories.find((c) => c.id === categoryId)?.name ?? null,
      });
      const suggestion = res.data;
      setMetaTitle(suggestion.metaTitle);
      setMetaDescription(suggestion.metaDescription);
      setFocusKeyword(suggestion.focusKeyword);
      setKeywords(suggestion.keywords.join(", "));

      Toast.fire({
        icon: "success",
        title:
          suggestion.source === "fallback"
            ? "Drafted from your post (no AI key configured)"
            : "SEO fields drafted — review before publishing",
      });
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Couldn't draft SEO fields",
      });
    } finally {
      setGenerating(false);
    }
  };

  const buildPayload = useCallback(
    (nextStatus: BlogStatus) => ({
      title: title.trim(),
      slug: slug || slugify(title),
      excerpt: excerpt.trim() || null,
      content: content || null,
      status: nextStatus,
      visibility,
      publishedAt: publicationDate
        ? new Date(`${publicationDate}T00:00:00`).toISOString()
        : null,
      featuredImage,
      authorId: useCustomAuthor ? null : authorId || null,
      customAuthorName: useCustomAuthor ? customAuthorName.trim() || null : null,
      customAuthorAvatar: useCustomAuthor ? customAuthorAvatar : null,
      categoryId: categoryId || null,
      tags,
      metaTitle: metaTitle.trim() || null,
      metaDescription: metaDescription.trim() || null,
      focusKeyword: focusKeyword.trim() || null,
      keywords: keywords
        .split(",")
        .map((keyword) => keyword.trim())
        .filter(Boolean),
      canonicalUrl: canonicalUrl.trim() || null,
      isFeatured,
      allowComments,
      showAds,
    }),
    [
      title, slug, excerpt, content, visibility, publicationDate, featuredImage,
      useCustomAuthor, authorId, customAuthorName, customAuthorAvatar, categoryId,
      tags, metaTitle, metaDescription, focusKeyword, keywords, canonicalUrl,
      isFeatured, allowComments, showAds,
    ]
  );

  const save = async (nextStatus: BlogStatus) => {
    if (!title.trim()) {
      Toast.fire({ icon: "error", title: "A post needs a title" });
      return;
    }
    if (useCustomAuthor && !customAuthorName.trim()) {
      Toast.fire({ icon: "error", title: "Enter the custom author's name" });
      return;
    }
    if (!useCustomAuthor && !authorId) {
      Toast.fire({ icon: "error", title: "Select an author" });
      return;
    }

    setSaving(true);
    try {
      const payload = buildPayload(nextStatus);
      if (postId) {
        await updatePost(postId, payload);
        Toast.fire({ icon: "success", title: "Post updated" });
      } else {
        await createPost(payload);
        Toast.fire({
          icon: "success",
          title: nextStatus === "PUBLISHED" ? "Post published" : "Draft saved",
        });
      }
      onSaved();
      onDone();
    } catch (error) {
      Toast.fire({
        icon: "error",
        title: error instanceof Error ? error.message : "Save failed",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2Icon className="h-6 w-6 animate-spin text-slate-400" />
      </div>
    );
  }

  const previewDescription =
    metaDescription.trim() ||
    excerpt.trim() ||
    "Your meta description will appear here once you add one — aim for 120–160 characters that summarize the post.";

  return (
    <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
      {/* ------------------------------- Main ------------------------------- */}
      <div className="space-y-5">
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Add your post title"
            aria-label="Post title"
            className="w-full border-none bg-transparent text-[24px] font-bold text-slate-900 outline-none placeholder:text-slate-300"
          />

          <div className="mt-3 flex flex-wrap items-center gap-2 text-[12px] text-slate-500">
            <span>Permalink: {SITE}/blog/</span>
            {editingSlug ? (
              <>
                <input
                  value={slug}
                  onChange={(event) => {
                    setSlugDraft(slugify(event.target.value));
                    setSlugTouched(true);
                  }}
                  className="h-7 rounded border border-slate-200 px-2 text-[12px] outline-none focus:border-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setEditingSlug(false)}
                  className="font-medium text-slate-700 underline"
                >
                  Done
                </button>
              </>
            ) : (
              <>
                <span className="font-medium text-blue-600">{slug || "your-post-slug"}</span>
                <button
                  type="button"
                  onClick={() => setEditingSlug(true)}
                  className="font-medium text-slate-700 underline"
                >
                  Edit
                </button>
              </>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <Field
            label="Excerpt / Meta Summary"
            counter={`${excerpt.length} / 750`}
            hint="Shown on the blog index and used as a fallback meta description."
          >
            <textarea
              value={excerpt}
              maxLength={750}
              onChange={(event) => setExcerpt(event.target.value)}
              rows={3}
              placeholder="A short summary shown on the blog index and used as a fallback meta description (min. 120 characters recommended)"
              className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-slate-400"
            />
          </Field>

          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <label className="text-[13px] font-semibold text-slate-800">Content</label>
              <span className="text-[11px] text-slate-400">
                Rich text editor · {words} words
              </span>
            </div>
            <div className="mt-1.5">
              <RichTextEditor
                value={content}
                onChange={setContent}
                minHeight={320}
                placeholder="Start writing your post... select text and use the toolbar, or type directly."
              />
            </div>
          </div>
        </div>

        {/* --------------------------- SEO metafields ------------------------ */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-[15px] font-semibold text-slate-900">SEO Metafields</h2>
              <p className="text-[12px] text-slate-500">
                Optimize how this post appears in Google and social shares
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-[11px] font-medium text-indigo-700">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
              Yoast-style
            </span>
          </div>

          <button
            type="button"
            onClick={handleGenerate}
            disabled={generating}
            className="mt-4 inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-slate-900 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
          >
            {generating ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <SparklesIcon className="h-4 w-4" />
            )}
            {generating ? "Drafting..." : "Generate Meta Title, Description & Keywords with AI"}
          </button>
          <p className="mt-2 text-[11px] leading-[17px] text-slate-400">
            Runs your draft through a connected AI model (bring your own key — set
            AI_PROVIDER and AI_API_KEY on the server; free tiers such as Gemini Flash,
            Claude Haiku or a local Ollama model work fine). Without a key it drafts the
            fields from your post instead. Always review before publishing.
          </p>

          {/* Google result preview */}
          <div className="mt-4 rounded-lg bg-slate-50 p-4">
            <p className="text-[12px] text-emerald-700">
              {SITE} › blog › {slug || "your-post-slug"}
            </p>
            <p className="mt-1 text-[15px] font-medium text-blue-700">
              {metaTitle.trim() || title || "Your post title"}
            </p>
            <p className="mt-1 text-[12px] leading-[18px] text-slate-600">
              {previewDescription}
            </p>
          </div>

          <div className="mt-5 space-y-4">
            <Field label="Meta Title (SEO)" counter={`${metaTitle.length} / 60`}>
              <input
                value={metaTitle}
                onChange={(event) => setMetaTitle(event.target.value)}
                placeholder="AI-generated or manual SEO title"
                className={inputClass}
              />
            </Field>

            <Field label="Meta Description (SEO)" counter={`${metaDescription.length} / 160`}>
              <textarea
                value={metaDescription}
                onChange={(event) => setMetaDescription(event.target.value)}
                rows={3}
                placeholder="AI-generated or manual SEO description (optional, defaults to excerpt)"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-[13px] outline-none transition placeholder:text-slate-400 focus:border-slate-400"
              />
            </Field>

            <Field label="Focus Keyword">
              <input
                value={focusKeyword}
                onChange={(event) => setFocusKeyword(event.target.value)}
                placeholder="e.g. sustainable fashion Bangladesh"
                className={inputClass}
              />
            </Field>

            <Field label="Keywords (comma-separated)">
              <input
                value={keywords}
                onChange={(event) => setKeywords(event.target.value)}
                placeholder="e.g. windrise, capsule wardrobe, ethical fashion"
                className={inputClass}
              />
            </Field>

            <Field label="Canonical URL" counter="optional">
              <input
                value={canonicalUrl}
                onChange={(event) => setCanonicalUrl(event.target.value)}
                placeholder={`https://${SITE}/blog/...`}
                className={inputClass}
              />
            </Field>
          </div>
        </div>
      </div>

      {/* ------------------------------- Rail ------------------------------- */}
      <div className="space-y-5">
        {/* Publish */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">Publish</h2>

          <div className="mt-4 space-y-4">
            <Field label="Status">
              <select
                value={status}
                onChange={(event) => setStatus(event.target.value as BlogStatus)}
                className={inputClass}
              >
                <option value="PUBLISHED">Published</option>
                <option value="DRAFT">Draft</option>
                <option value="SCHEDULED">Scheduled</option>
                <option value="ARCHIVED">Archived</option>
              </select>
            </Field>

            <Field
              label="Publication Date"
              hint="A future date keeps the post scheduled until then."
            >
              <input
                type="date"
                value={publicationDate}
                onChange={(event) => setPublicationDate(event.target.value)}
                className={inputClass}
              />
            </Field>

            <Field label="Visibility">
              <select
                value={visibility}
                onChange={(event) =>
                  setVisibility(event.target.value as "PUBLIC" | "PRIVATE")
                }
                className={inputClass}
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
              </select>
            </Field>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => save("DRAFT")}
              disabled={saving}
              className="h-10 rounded-lg border border-slate-200 bg-white text-[13px] font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-60"
            >
              Save Draft
            </button>
            <button
              type="button"
              onClick={() => save(status)}
              disabled={saving}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 text-[13px] font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-60"
            >
              {saving && <Loader2Icon className="h-3.5 w-3.5 animate-spin" />}
              {postId ? "Update" : status === "PUBLISHED" ? "Publish" : "Save"}
            </button>
          </div>
        </div>

        {/* SEO score */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">SEO Score</h2>
          <p className="text-[12px] text-slate-500">Updates as you write</p>

          <div className="mt-3 flex items-center gap-4">
            <ScoreRing score={score} />
            <div>
              <p className="text-[20px] font-bold leading-none text-slate-900">
                {score}
                <span className="text-[12px] font-normal text-slate-400">/100</span>
              </p>
              <p className="mt-1 text-[12px]" style={{ color: seoBandColor(score) }}>
                {score >= 70 ? "Good" : score >= 40 ? "OK" : "Needs work"}
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-2">
            {checks.map((check) => (
              <li key={check.id} className="flex items-start gap-2 text-[12px]">
                {check.passed ? (
                  <CheckIcon className="mt-px h-3.5 w-3.5 shrink-0 text-emerald-600" />
                ) : (
                  <TriangleAlertIcon className="mt-px h-3.5 w-3.5 shrink-0 text-amber-500" />
                )}
                <span className={check.passed ? "text-slate-500" : "text-slate-700"}>
                  {check.label}
                </span>
              </li>
            ))}
          </ul>
        </div>

        {/* Featured image */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">Featured Image</h2>

          <input
            ref={fileInput}
            type="file"
            accept="image/*"
            hidden
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void handleUpload(file, "featured");
              event.target.value = "";
            }}
          />

          {featuredImage ? (
            <div className="mt-3">
              <img
                src={mediaUrl(featuredImage) ?? ""}
                alt="Featured"
                className="h-[130px] w-full rounded-lg object-cover"
              />
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="h-8 flex-1 rounded-md border border-slate-200 text-[12px] text-slate-700 hover:bg-slate-50"
                >
                  Replace
                </button>
                <button
                  type="button"
                  onClick={() => setFeaturedImage(null)}
                  className="h-8 flex-1 rounded-md border border-slate-200 text-[12px] text-rose-600 hover:bg-rose-50"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileInput.current?.click()}
              disabled={uploading}
              className="mt-3 flex h-[130px] w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-slate-300 text-slate-400 transition-colors hover:border-slate-400 hover:text-slate-500 disabled:opacity-60"
            >
              {uploading ? (
                <Loader2Icon className="h-5 w-5 animate-spin" />
              ) : (
                <ImageIcon className="h-5 w-5" />
              )}
              <span className="text-[12px]">Click to upload or choose from library</span>
              <span className="text-[11px]">Recommended 1200×630 for social sharing</span>
            </button>
          )}
        </div>

        {/* Author */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">Author</h2>

          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-medium text-slate-800">Use custom author</p>
              <p className="text-[11px] text-slate-400">
                Add a name &amp; photo — no staff account needed
              </p>
            </div>
            <ToggleSwitch
              checked={useCustomAuthor}
              onChange={setUseCustomAuthor}
              label="Use custom author"
            />
          </div>

          {useCustomAuthor ? (
            <div className="mt-4 space-y-3">
              <Field label="Author name" required>
                <input
                  value={customAuthorName}
                  onChange={(event) => setCustomAuthorName(event.target.value)}
                  placeholder="e.g. Guest Contributor"
                  className={inputClass}
                />
              </Field>
              <div className="flex items-center gap-3">
                {customAuthorAvatar ? (
                  <img
                    src={mediaUrl(customAuthorAvatar) ?? ""}
                    alt=""
                    className="h-10 w-10 rounded-full object-cover"
                  />
                ) : (
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                    <ImageIcon className="h-4 w-4" />
                  </span>
                )}
                <label className="cursor-pointer text-[12px] font-medium text-slate-700 underline">
                  Upload photo
                  <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void handleUpload(file, "author");
                      event.target.value = "";
                    }}
                  />
                </label>
              </div>
            </div>
          ) : (
            <div className="mt-4">
              <Field label="Select Author" required>
                <select
                  value={authorId}
                  onChange={(event) => setAuthorId(event.target.value)}
                  className={inputClass}
                >
                  <option value="">Choose an author</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>
                      {author.name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          )}
        </div>

        {/* Categories & tags */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-[15px] font-semibold text-slate-900">Categories</h2>

          <div className="mt-3 flex flex-wrap gap-2">
            {categories.length === 0 && (
              <p className="text-[12px] text-slate-400">
                No categories yet — add them under Categories &amp; Tags.
              </p>
            )}
            {categories.map((category) => {
              const active = categoryId === category.id;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setCategoryId(active ? "" : category.id)}
                  className={`h-8 rounded-full px-3.5 text-[12px] font-medium transition-colors ${
                    active
                      ? "bg-slate-900 text-white"
                      : "border border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
          </div>

          <h3 className="mt-5 text-[13px] font-semibold text-slate-800">Tags</h3>
          <div className="mt-2 rounded-lg border border-slate-200 p-2">
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2.5 py-1 text-[12px] text-slate-700"
                >
                  {tag}
                  <button
                    type="button"
                    aria-label={`Remove tag ${tag}`}
                    onClick={() => setTags((current) => current.filter((t) => t !== tag))}
                    className="text-slate-400 hover:text-slate-700"
                  >
                    <XIcon className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <input
              value={tagDraft}
              onChange={(event) => {
                // A typed comma commits the tag, matching the hint below.
                if (event.target.value.endsWith(",")) addTag(event.target.value);
                else setTagDraft(event.target.value);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  addTag(tagDraft);
                }
                if (event.key === "Backspace" && !tagDraft) {
                  setTags((current) => current.slice(0, -1));
                }
              }}
              onBlur={() => addTag(tagDraft)}
              placeholder="Add tag, press Enter"
              className="mt-2 h-8 w-full border-none bg-transparent px-1 text-[12px] outline-none placeholder:text-slate-400"
            />
          </div>
          <p className="mt-1.5 text-[11px] text-slate-400">
            Press <strong>Enter</strong> or <strong>,</strong> to add a tag. Backspace on an
            empty field removes the last one.
          </p>
        </div>

        {/* Toggles */}
        <div className="rounded-xl border border-slate-200 bg-white p-5">
          {[
            {
              key: "featured",
              label: "Featured post",
              hint: null,
              value: isFeatured,
              set: setIsFeatured,
            },
            {
              key: "comments",
              label: "Allow comments",
              hint: null,
              value: allowComments,
              set: setAllowComments,
            },
            {
              key: "ads",
              label: "Show ads in this post",
              hint: "Uses your active Ads placements",
              value: showAds,
              set: setShowAds,
            },
          ].map((row, index) => (
            <div
              key={row.key}
              className={`flex items-start justify-between gap-3 ${
                index > 0 ? "mt-4 border-t border-slate-100 pt-4" : ""
              }`}
            >
              <div>
                <p className="text-[13px] font-medium text-slate-800">{row.label}</p>
                {row.hint && <p className="text-[11px] text-slate-400">{row.hint}</p>}
              </div>
              <ToggleSwitch
                checked={row.value}
                onChange={row.set}
                label={row.label}
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
