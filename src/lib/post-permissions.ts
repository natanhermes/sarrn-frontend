import type { AuthUser } from "@/schemas/auth";
import type { AdminPost, PostStatus } from "@/schemas/posts";

type PostOwnership = Pick<AdminPost, "authorId" | "author" | "coAuthors">;

function resolveAuthorId(post: PostOwnership) {
  return post.author?.id || post.authorId || "";
}

export function isPostOwner(
  user: AuthUser | null | undefined,
  post: PostOwnership,
) {
  if (!user) {
    return false;
  }

  return user.id === resolveAuthorId(post);
}

export function isPostCoAuthor(
  user: AuthUser | null | undefined,
  post: PostOwnership,
) {
  if (!user) {
    return false;
  }

  return (post.coAuthors ?? []).some((author) => author.id === user.id);
}

export function canEditPost(
  user: AuthUser | null | undefined,
  post: PostOwnership,
) {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN" || user.role === "EDITOR") {
    return true;
  }

  return (
    user.role === "CONTRIBUTOR" &&
    (isPostOwner(user, post) || isPostCoAuthor(user, post))
  );
}

export function canDeletePost(
  user: AuthUser | null | undefined,
  post: PostOwnership,
) {
  if (!user) {
    return false;
  }

  if (user.role === "ADMIN" || user.role === "EDITOR") {
    return true;
  }

  return user.role === "CONTRIBUTOR" && isPostOwner(user, post);
}

export function canManagePost(
  user: AuthUser | null | undefined,
  authorId: string,
) {
  return canEditPost(user, { authorId, author: null, coAuthors: [] });
}

export function canSetPostStatus(user: AuthUser | null | undefined) {
  return user?.role !== "CONTRIBUTOR";
}

export function canDeleteMedia(user: AuthUser | null | undefined) {
  return user?.role === "ADMIN" || user?.role === "EDITOR";
}

export function resolvePostStatusForSubmit(
  user: AuthUser | null | undefined,
  status: PostStatus,
): PostStatus {
  if (user?.role === "CONTRIBUTOR") {
    return "DRAFT";
  }

  return status;
}
