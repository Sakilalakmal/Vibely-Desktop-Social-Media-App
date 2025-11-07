"use server";

import { get } from "http";
import { getDbUserId } from "./user.actions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, imageUrl?: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    const post = await prisma.post.create({
      data: {
        content: content,
        image: imageUrl,
        authorId: userId,
      },
    });

    revalidatePath("/");
    return { success: true, post };
  } catch (error) {
    console.log("Error creating post:", error);
    return { success: false, Error: "Failed to create post" };
  }
}

export async function getPosts() {
  try {
    const posts = await prisma.post.findMany({
      orderBy: {
        createdAt: "desc",
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            username: true,
          },
        },
        comments: {
          include: {
            author: {
              select: {
                id: true,
                username: true,
                image: true,
                name: true,
              },
            },
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        likes: {
          select: {
            userId: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
      },
    });

    return posts;
  } catch (error) {
    console.log("error in posts", error);
    throw new Error("error while getting posts");
  }
}

export async function toggleLike(postId: string) {
  try {
    const userId = await getDbUserId();

    if (!userId) return;

    //check if like exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          userId,
          postId,
        },
      },
    });

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: { authorId: true },
    });

    if (!post) throw new Error("post not found");

    if (existingLike) {
      //unlike
      await prisma.like.delete({
        where: {
          userId_postId: {
            userId,
            postId,
          },
        },
      });
    } else {
      //liked
      await prisma.$transaction([
        prisma.like.create({
          data: {
            userId,
            postId,
          },
        }),

        ...(post.authorId !== userId
          ? [
              prisma.notification.create({
                data: {
                  type: "LIKE",
                  userId: post.authorId,
                  creatorId: userId,
                  postId,
                },
              }),
            ]
          : []),
      ]);
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("failed to toggle like", error);
    return { success: false, error: "failed to toggle like" };
  }
}

export async function createComment(postId: string, content: string) {
  try {
    const userId = await getDbUserId();
    if (!userId) return;
    if (!content) throw new Error("content is required for this");

    const post = await prisma.post.findUnique({
      where: { id: postId },
      select: { authorId: true },
    });

    if (!post) throw new Error("Post not found");

    //create comment and notification in a transaction
    const [comment] = await prisma.$transaction(async (tx) => {
      const newComment = await tx.comment.create({
        data: {
          content: content,
          authorId: userId,
          postId,
        },
      });

      //create notification only if user write comment on other users posts
      if (post.authorId !== userId) {
        await tx.notification.create({
          data: {
            type: "COMMENT",
            userId: post.authorId,
            creatorId: userId,
            postId,
            commentId: newComment.id,
          },
        });
      }

      return [newComment];
    });

    revalidatePath("/");
    return { success: true, comment };
  } catch (error) {
    console.error("Failed to create comment", error);
    return { success: false, error: "Failed to create comment" };
  }
}

export async function deletePost(postId: string) {
  try {
    const userId = await getDbUserId();

    const post = await prisma.post.findUnique({
      where: {
        id: postId,
      },
      select: {
        authorId: true,
      },
    });

    if (!post) throw new Error("post not found");
    if (post.authorId !== userId)
      throw new Error("unauthorized - no delete permission");

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("error delete post", error);
    return { success: false };
  }
}
