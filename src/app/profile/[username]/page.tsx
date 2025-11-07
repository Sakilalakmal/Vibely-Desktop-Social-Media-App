import {
  getUserPosts,
  getUserProfileByUsername,
  isFollowing,
  userLikedPosts,
} from "@/actions/profile.actions";
import NotFound from "@/app/not-found";
import React from "react";
import ProfilePageClient from "./ProfilePageClient";

async function ProfilePage({ params }: { params: { username: string } }) {
  const user = await getUserProfileByUsername(params.username);

  if (!user) return <NotFound />;

  const [posts, likedPosts, isUserFollowing] = await Promise.all([
    getUserPosts(user.id),
    userLikedPosts(user.id),
    isFollowing(user.id),
  ]);

  return (
    <div>
      <ProfilePageClient
        user={user}
        posts={posts}
        likedPosts={likedPosts}
        isFollowing={isUserFollowing}
      />
    </div>
  );
}

export default ProfilePage;
