"use client";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { session, User } from "@/lib/supabase/supabase.types";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Lock, Share,Plus } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectGroup,
} from "@/components/ui/select";
import { Button } from "../ui/button";
import { v4 } from "uuid";
import { toast } from "../ui/use-toast";
import { addCollaborators, createSession } from "@/lib/supabase/queries";
import { useRouter } from "next/navigation";
import CollaboratorsSearch from "./collaborators-search";

const SessionCreator = () => {
  const { user } = useSupabaseUser();
const router = useRouter()
  const [permissions, setPermissions] = useState("private");
  const [title, setTitle] = useState("");
  const [collaborators, setCollaborators] = useState<User[]>([]);

  const addCollaborator = (user: User) => {
    setCollaborators([...collaborators, user]);
  };

  const removeCollaborator = (user: User) => {
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    );
  };

  const createItem = async() => {
    const uuid = v4()
    if(user?.id){
        const newSession: session = {
            data: null,
            created_at: new Date().toISOString(),
            id: uuid,
            in_trash: '',
            title,
            session_owner: user.id,
          };
          if (permissions === 'private') {
            toast({ title: 'Success', description: 'Created the session' });
            await createSession(newSession);
            router.refresh();
          }
          if (permissions === 'shared') {
            toast({ title: 'Success', description: 'Created the session' });
            await createSession(newSession);
            await addCollaborators(collaborators, uuid);
            router.refresh();
          }
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Label htmlFor="name" className="text-sm">
          Name
        </Label>
        <div className="flex justify-center items-center gap-2">
          <Input
            name="name"
            value={title}
            placeholder="Session Name"
            onChange={(e) => {
              setTitle(e.target.value);
            }}
          />
        </div>
      </div>
      <>
        <Label htmlFor="permissions" className="text-sm">
          Permissions
        </Label>
        <Select
          onValueChange={(value) => {
            setPermissions(value);
          }}
          defaultValue={permissions}
        >
          <SelectTrigger className="w-full h-26 -mt-3">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem value="private">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Lock />
                  <article className="text-left flex flex-col">
                    <span>Private</span>
                    <p className="text-muted-foreground">
                      Your session is private to you. You can choose to share it
                      later.
                    </p>
                  </article>
                </div>
              </SelectItem>
              <SelectItem value="shared">
                <div className="p-2 flex gap-4 justify-center items-center">
                  <Share />
                  <article className="text-left flex flex-col">
                    <span>Shared</span>
                    <p className="text-muted-foreground">
                      You can invite collaborators.
                    </p>
                  </article>
                </div>
              </SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </>
      {permissions === "shared" && <div>
        <CollaboratorsSearch existingCollaborators={collaborators} getCollaborator={(user) => {
            addCollaborator(user)
        }}>
            <Button type='button' className="mt-4 text-sm">
                <Plus/>
                Add Collaborators
            </Button>
        </CollaboratorsSearch>
        </div>}
      <Button
        type="button"
        disabled={
          !title || (permissions === "shared" && collaborators.length === 0)
        }
        onClick={createItem}
      >
        Create
      </Button>
    </div>
  );
};

export default SessionCreator;
