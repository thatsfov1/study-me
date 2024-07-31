"use client";
import { session } from "@/lib/supabase/supabase.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import React from "react";

interface SelectedSessionProps {
  session: session;
  onClick?: (option:session) => void;
}

const SelectedSession: React.FC<SelectedSessionProps> = ({
  session,
  onClick,
}) => {
  const supabase = createClientComponentClient();
  return (
    <Link
      href={`/dashboard/${session.id}`}
      onClick={() => {
        if (onClick) onClick(session);
      }}
      className="flex rounded-md hover:bg-muted transition-all flex-row p-2 gap-4 justify-center items-center cursor-pointer my-2"
    >
      <div className="flex flex-col">
        <p className="text-lg w-[170px] pl-2 overflow-hidden overflow-ellipsis whitespace-nowrap">{session.title}</p>
      </div>
    </Link>
  );
};

export default SelectedSession;
