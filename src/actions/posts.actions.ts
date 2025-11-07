"use server";

import { get } from "http";
import { getDbUserId } from "./user.actions";
import prisma from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPost(content: string, imageUrl?: string) {
  try {
    const userId = await getDbUserId();

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
