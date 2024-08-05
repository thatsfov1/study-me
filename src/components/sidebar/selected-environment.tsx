"use client";
import { environment } from "@/lib/supabase/supabase.types";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Link from "next/link";
import React from "react";

interface SelectedEnvironmentProps {
  environment: environment;
  onClick?: (option:environment) => void;
}

const SelectedEnvironment: React.FC<SelectedEnvironmentProps> = ({
  environment,
  onClick,
}) => {
  const supabase = createClientComponentClient();
  return (
    <Link
      href={`/dashboard/${environment.id}`}
      onClick={() => {
        if (onClick) onClick(environment);
      }}
      className="flex rounded-md hover:bg-muted transition-all flex-row p-2 gap-4 justify-center items-center cursor-pointer my-2"
    >
      <div className="flex flex-col">
        <p className="text-lg w-[170px] pl-2 overflow-hidden overflow-ellipsis whitespace-nowrap">{environment.title}</p>
      </div>
    </Link>
  );
};

export default SelectedEnvironment;
