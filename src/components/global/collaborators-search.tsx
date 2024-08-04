"use client";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { User } from "@/lib/supabase/supabase.types";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import React, { useRef, useState, useEffect } from "react";
import { Search } from "lucide-react";
import { Input } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import { Button } from "../ui/button";
import { getUsersFromSearch } from "@/lib/supabase/queries";

interface CollaboratorsSearchProps {
  existingCollaborators: User[] | [];
  getCollaborator: (collaborator: User) => void;
  children: React.ReactNode;
}

const CollaboratorsSearch: React.FC<CollaboratorsSearchProps> = ({
  children,
  existingCollaborators,
  getCollaborator,
}) => {
  const [searchResults, setSearchResults] = useState<User[] | []>([]);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();
  const user = useSupabaseUser();

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const onChangeHandler = (e:React.ChangeEvent<HTMLInputElement>) => {
        if(timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(async() =>{
            const res = await getUsersFromSearch(e.target.value);
            setSearchResults(res);
        },450)
  };

  const addCollaborator = (user:User) => {
    getCollaborator(user)
  };

  return (
    <Sheet>
      <SheetTrigger className="w-full">{children}</SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Search Collaborator</SheetTitle>
          <SheetDescription>
            <p className="text-sm text-muted-foreground">
              You can also remove collaborators after adding them from the
              settings tab.
            </p>
          </SheetDescription>
        </SheetHeader>
        <div className="flex justify-center items-center gap-2 mt-2">
          <Search />
          <Input
            name="name"
            placeholder="Email"
            onChange={onChangeHandler}
          />
        </div>
        <ScrollArea className="mt-6 overflow-y-scroll w-full rounded-md">
          {searchResults
            .filter(
              (result) =>
                !existingCollaborators.some(
                  (existing) => existing.id === result.id
                )
            )
            .filter((result) => result.id !== user?.id)
            .map((user) => (
              <div className="p-4 flex justify-between items-center" key={user.id}>
                <div className="flex gap-4 items-center">
                    <Avatar className='w-8 h-8'>
                        <AvatarImage src=''></AvatarImage>
                        <AvatarFallback>CP</AvatarFallback>
                    </Avatar>
                    <div className="text-sm gap-2 overflow-hidden overflow-ellipsis w-[180px] text-muted-foreground">
                        {user.email}
                    </div>
                </div>
                <Button variant='secondary' onClick={() => addCollaborator(user)}>Add</Button>
              </div>
            ))}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export default CollaboratorsSearch;
