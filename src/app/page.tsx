import { getPosts } from "@/actions/posts.actions";
import { getDbUserId } from "@/actions/user.actions";
import CreatePosts from "@/components/CreatePosts";
import PostCard from "@/components/PostCard";
import Suggestions from "@/components/Suggestions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();
  const posts = await getPosts();
  const dbUserId = await getDbUserId();
  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {/* create post components */}
        {user ? <CreatePosts /> : null}

        <div className="space-y-6">
          {posts.map((post) => (
            <PostCard key={post.id} userId={dbUserId} post={post} />
          ))}
        </div>
      </div>

      {/* right side components in here */}
      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <Suggestions />
      </div>
    </div>
  );
}
