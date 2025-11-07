import CreatePosts from "@/components/CreatePosts";
import Suggestions from "@/components/Suggestions";
import { currentUser } from "@clerk/nextjs/server";

export default async function Home() {
  const user = await currentUser();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-10 gap-6">
      <div className="lg:col-span-6">
        {/* create post components */}
        {user ? <CreatePosts /> : null}
      </div>

      {/* right side components in here */}
      <div className="hidden lg:block lg:col-span-4 sticky top-20">
        <Suggestions />
      </div>
    </div>
  );
}
