/**
 * Blog comments.
 *
 * Open to everyone — a reader should not need an account to join in. A signed-in
 * reader is recognised from their token, so their name and avatar come from the
 * account instead of a form; a guest supplies both.
 */

import { BlogStatus, BlogVisibility, Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";

import prisma from "../../../shared/prisma";
import ApiError from "../../errors/ApiError";

const MAX_BODY = 2000;

/**
 * The post being commented on, if it is one the public can see.
 *
 * A draft or a private post must not accept comments — that would let someone
 * discover unpublished work by probing slugs and watching which ones accept a
 * reply.
 */
const requirePublicPost = async (slug: string) => {
  const post = await prisma.blogPost.findFirst({
    where: {
      slug,
      status: BlogStatus.PUBLISHED,
      visibility: BlogVisibility.PUBLIC,
    },
    select: { id: true },
  });

  if (!post) throw new ApiError(StatusCodes.NOT_FOUND, "Story not found");
  return post;
};

const commentInclude = {
  user: { select: { id: true, name: true, avatar: true } },
} satisfies Prisma.BlogCommentInclude;

type CommentRow = Prisma.BlogCommentGetPayload<{ include: typeof commentInclude }>;

/**
 * What a reader is allowed to see about a commenter.
 *
 * The email is collected but never leaves the server — the form promises it
 * will not be published, and that promise is kept here rather than in the UI.
 * A signed-in commenter's name and avatar are read from the account, so a later
 * profile change is reflected on old comments.
 */
const shapeComment = (row: CommentRow) => ({
  id: row.id,
  name: row.user?.name ?? row.name,
  avatar: row.user?.avatar ?? null,
  /** Marks comments left by a signed-in reader, for a subtle badge if wanted. */
  isMember: Boolean(row.userId),
  body: row.body,
  createdAt: row.createdAt,
  parentId: row.parentId,
});

export type ShapedComment = ReturnType<typeof shapeComment> & {
  replies: ReturnType<typeof shapeComment>[];
};

/**
 * Comments for a story, newest first, each with its replies.
 *
 * `limit` applies to top-level comments; replies always travel with their
 * parent, because a thread split across pages reads as nonsense.
 */
export const listComments = async (
  slug: string,
  options: { page?: number; limit?: number } = {},
) => {
  const post = await requirePublicPost(slug);

  const page = Math.max(1, options.page ?? 1);
  const limit = Math.min(50, Math.max(1, options.limit ?? 3));

  const [roots, rootTotal, total] = await Promise.all([
    prisma.blogComment.findMany({
      where: { postId: post.id, parentId: null },
      include: { ...commentInclude, replies: { include: commentInclude, orderBy: { createdAt: "asc" } } },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.blogComment.count({ where: { postId: post.id, parentId: null } }),
    // Every comment, replies included — the heading counts the conversation,
    // not just its openings.
    prisma.blogComment.count({ where: { postId: post.id } }),
  ]);

  const data: ShapedComment[] = roots.map((root) => ({
    ...shapeComment(root),
    replies: root.replies.map(shapeComment),
  }));

  return { data, meta: { page, limit, total: rootTotal }, totalComments: total };
};

export type CreateCommentInput = {
  slug: string;
  body: string;
  parentId?: string | null;
  name?: string;
  email?: string;
};

export type CommentAuthor = { id: string; email?: string } | undefined;

export const createComment = async (
  input: CreateCommentInput,
  author: CommentAuthor,
) => {
  const post = await requirePublicPost(input.slug);

  const body = input.body.trim();
  if (!body) throw new ApiError(StatusCodes.BAD_REQUEST, "Write something first.");
  if (body.length > MAX_BODY) {
    throw new ApiError(StatusCodes.BAD_REQUEST, "That comment is too long.");
  }

  let name: string;
  let email: string;

  if (author?.id) {
    // Signed in: identity comes from the account, not the request body, so a
    // reader cannot post under someone else's name while logged in.
    const user = await prisma.user.findUnique({
      where: { id: author.id },
      select: { name: true, email: true },
    });

    if (!user) throw new ApiError(StatusCodes.UNAUTHORIZED, "Your session has expired.");

    name = user.name?.trim() || "Member";
    email = user.email ?? author.email ?? "";
  } else {
    name = (input.name ?? "").trim();
    email = (input.email ?? "").trim();

    if (!name) throw new ApiError(StatusCodes.BAD_REQUEST, "Your name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Enter a valid email address.");
    }
  }

  let parentId: string | null = null;

  if (input.parentId) {
    const parent = await prisma.blogComment.findUnique({
      where: { id: input.parentId },
      select: { id: true, postId: true, parentId: true },
    });

    if (!parent || parent.postId !== post.id) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "That comment no longer exists.");
    }

    // Threads stay one level deep: replying to a reply attaches to the same
    // top-level comment rather than nesting further, which is what keeps the
    // conversation readable on a narrow screen.
    parentId = parent.parentId ?? parent.id;
  }

  const created = await prisma.blogComment.create({
    data: {
      postId: post.id,
      parentId,
      userId: author?.id ?? null,
      name,
      email,
      body,
    },
    include: commentInclude,
  });

  return shapeComment(created);
};

export const CommentService = {
  listComments,
  createComment,
};
