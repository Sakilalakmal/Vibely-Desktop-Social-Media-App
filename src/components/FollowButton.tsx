"use client";

import React, { useState } from "react";
import { Button } from "./ui/button";
import { AwardIcon, Loader2Icon } from "lucide-react";
import toast from "react-hot-toast";
import { toggleFollow } from "@/actions/user.actions";

function FollowButton({ userId }: { userId: string }) {
  const [isLoading, setIsLoading] = useState(false);
  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await toggleFollow(userId);
      toast.success("User followed successfully");
    } catch (error) {
      console.log("error follwing user", error);
      toast.error("something wrong when following this user");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      size={"sm"}
      variant={"secondary"}
      onClick={handleFollow}
      disabled={isLoading}
      className="w-20"
    >
      {isLoading ? <Loader2Icon className="animate-spin" /> : "Follow"}
    </Button>
  );
}

export default FollowButton;
