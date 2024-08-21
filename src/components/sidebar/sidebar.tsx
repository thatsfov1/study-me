import {
  getCollaboratingEnvironments,
  getSessions,
  getPrivateEnvironments,
  getSharedEnvironments,
  getUserSubscriptionStatus,
} from "@/lib/supabase/queries";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import React from "react";
import { twMerge } from "tailwind-merge";
import EnvironmentDropdown from "./environment-dropdown";
import PlanUsage from "./plan-usage";
import NativeNavigation from "./native-navigation";
import { ScrollArea } from "../ui/scroll-area";
import SessionsDropdownList from "./sessions-dropdown-list";
import UserCard from "./user-card";

interface SidebarProps {
  params: { environmentId: string };
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

  const { data: environmentSessionData, error: sessionsError } = await getSessions(
    params.environmentId
  );

  console.log(environmentSessionData);

  if (subscriptionError || sessionsError) {
    console.error(sessionsError)
    redirect("/dashboard");
  }

  const [privateEnvironments, collaboratingEnvironments, sharedEnvironments] =
    await Promise.all([
      getPrivateEnvironments(user.id),
      getSharedEnvironments(user.id),
      getCollaboratingEnvironments(user.id),
    ]);

  return (
    <aside
      className={twMerge(
        "hidden sm:flex sm:flex-col w-[280px] shrink-0 p-4 md:gap-4 !justify-between",
        className
      )}
    >
      <div>
        <EnvironmentDropdown
          privateEnvironments={privateEnvironments}
          collaboratingEnvironments={collaboratingEnvironments}
          sharedEnvironments={sharedEnvironments}
          defaultValue={[
            ...privateEnvironments,
            ...sharedEnvironments,
            ...collaboratingEnvironments,
          ].find((environment) => environment.id === params.environmentId)}
        />
        <PlanUsage
          sessionsLength={environmentSessionData?.length || 0}
          subscription={subscriptionData}
        />
        <NativeNavigation myEnvironmentId={params.environmentId} />
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
          <SessionsDropdownList
            environmentSessions={environmentSessionData || []}
            environmentId={params.environmentId}
          />
        </ScrollArea>
      </div>
      <UserCard subscription={subscriptionData} />
    </aside>
  );
};

export default Sidebar;
