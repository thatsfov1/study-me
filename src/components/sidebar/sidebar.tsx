import {
  getCollaboratingSessions,
  getFolders,
  getPrivateSessions,
  getSharedSessions,
  getUserSubscriptionStatus,
} from "@/lib/supabase/queries";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { twMerge } from "tailwind-merge";
import SessionDropdown from "./session-dropdown";
import PlanUsage from "./plan-usage";
import NativeNavigation from "./native-navigation";
import { ScrollArea } from "../ui/scroll-area";
import FoldersDropdownList from "./folders-dropdown-list";
import UserCard from "./user-card";

interface SidebarProps {
  params: { sessionId: string };
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = async ({ params, className }) => {
  const supabase = createServerComponentClient({ cookies });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return;

  const { data: subscriptionData, error: subscriptionError } =
    await getUserSubscriptionStatus(user.id);

  const { data: sessionFolderData, error: foldersError } = await getFolders(
    params.sessionId
  );

  if (subscriptionError || foldersError) redirect("/dashboard");

  const [privateSessions, collaboratingSessions, sharedSessions] =
    await Promise.all([
      getPrivateSessions(user.id),
      getSharedSessions(user.id),
      getCollaboratingSessions(user.id),
    ]);

  return (
    <aside
      className={twMerge(
        "hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between",
        className
      )}
    >
      <div>
        <SessionDropdown
          privateSessions={privateSessions}
          collaboratingSessions={collaboratingSessions}
          sharedSessions={sharedSessions}
          defaultValue={[
            ...privateSessions,
            ...sharedSessions,
            ...collaboratingSessions,
          ].find((session) => session.id === params.sessionId)}
        />
        <PlanUsage
          foldersLength={sessionFolderData?.length || 0}
          subscription={subscriptionData}
        />
        <NativeNavigation mySessionId={params.sessionId} />
        <ScrollArea className="overflow-scroll h-[450px] relative">
          <div
            className="pointer-events-none 
          w-full 
          absolute 
          bottom-0 
          h-20 
          bg-gradient-to-t 
          from-background 
          to-transparent 
          z-40"
          />
          <FoldersDropdownList
            sessionFolders={sessionFolderData || []}
            sessionId={params.sessionId}
          />
        </ScrollArea>
      </div>
      <UserCard subscription={subscriptionData} />
    </aside>
  );
};

export default Sidebar;
