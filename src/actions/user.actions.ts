"use server";

import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function SyncUserDB() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!user || !userId) return;

    //check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) {
      return existingUser;
    }

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        name: `${user.firstName || ""} ${user.lastName || ""}`,
        username:
          user.username ?? user.emailAddresses[0].emailAddress.split("@")[0],
        email: user.emailAddresses[0].emailAddress,
        image: user.imageUrl,
      },
    });

    return dbUser;
  } catch (error) {
    console.log("Error syncing user to DB:", error);
  }
}

export async function getUserByClerkId(clerkId: string) {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      return await prisma.user.findUnique({
        where: {
          clerkId: clerkId,
        },
        include: {
          _count: {
            select: {
              followers: true,
              following: true,
              posts: true,
            },
          },
        },
      });
    } catch (error: any) {
      console.log(
        `Database connection attempt ${retries + 1} failed:`,
        error.message
      );

      // If it's a connection timeout, wait and retry
      if (
        error.message?.includes("Can't reach database server") ||
        error.code === "P1001"
      ) {
        retries++;
        if (retries < maxRetries) {
          console.log(`Retrying in ${retries * 2} seconds...`);
          await new Promise((resolve) => setTimeout(resolve, retries * 2000));
          continue;
        }
      }
      throw error;
    }
  }
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();

  if (!clerkId) throw new Error("User not authenticated");

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found in database");

  return user.id;
}

export async function getRandomUsers() {
  try {
    const userId = await getDbUserId();

    // get 3 random users exclude current user and did not follow yet
    const randomUsers = await prisma.user.findMany({
      where: {
        AND: [
          { NOT: { id: userId } },
          { NOT: { followers: { some: { followerId: userId } } } },
        ],
      },
      select: {
        id: true,
        username: true,
        name: true,
        image: true,
        _count: {
          select: {
            followers: true,
          },
        },
      },
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
    });

    return randomUsers;
  } catch (error) {
    console.log("Error fetching random users:", error);
    return [];
  }
}

export async function toggleFollow(targetUserID: string) {
  try {
    const user = await getDbUserId();

    if (targetUserID === user) throw new Error("You cant follow your self");

    const existingFollows = await prisma.follows.findUnique({
      where: {
        followingId_followerId: {
          followerId: user,
          followingId: targetUserID,
        },
      },
    });

    if (existingFollows) {
      //unfollow
      await prisma.follows.delete({
        where: {
          followingId_followerId: {
            followerId: user,
            followingId: targetUserID,
          },
        },
      });
    } else {
      //follow
      await prisma.$transaction([
        prisma.follows.create({
          data: {
            followerId: user,
            followingId: targetUserID,
          },
        }),

        prisma.notification.create({
          data: {
            type: "FOLLOW",
            userId: targetUserID,
            creatorId: user,
          },
        }),
      ]);
    }
    revalidatePath("/");
    return {
      success: true,
    };
  } catch (error) {
    console.log("error in toggleFollow", error);
    return {
      success: false,
      error: "Error toggling follow",
    };
  }
}
