"use client";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { environment, User } from "@/lib/supabase/supabase.types";
import React, { useState } from "react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Lock, Share, Plus } from "lucide-react";
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
import { useToast } from "../ui/use-toast";
import { addCollaborators, createEnvironment } from "@/lib/supabase/queries";
import { useRouter } from "next/navigation";
import CollaboratorsSearch from "./collaborators-search";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

const EnvironmentCreator = () => {
  const { user } = useSupabaseUser();
  const router = useRouter();
  const {toast} = useToast()
  const [permissions, setPermissions] = useState("private");
  const [title, setTitle] = useState("");
  const [collaborators, setCollaborators] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false)

  const addCollaborator = (user: User) => {
    setCollaborators([...collaborators, user]);
  };

  const removeCollaborator = (user: User) => {
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    );
  };

  const createItem = async () => {
    setIsLoading(true)
    const uuid = v4();
    if (user?.id) {
      const newEnvironment: environment = {
        created_at: new Date().toISOString(),
        id: uuid,
        in_trash: "",
        title,
        environment_owner: user.id,
      };
      if (permissions === "private") {
        toast({ title: "Success", description: "Created the environment" });
        await createEnvironment(newEnvironment);
        router.refresh();
      }
      if (permissions === "shared") {
        toast({ title: "Success", description: "Created the environment" });
        await createEnvironment(newEnvironment);
        await addCollaborators(collaborators, uuid);
        router.refresh();
      }
    }
    setIsLoading(false)
  };

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
            placeholder="Environment Name"
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
                      Your environment is private to you. You can choose to share it
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
      {permissions === "shared" && (
        <div>
          <CollaboratorsSearch
            existingCollaborators={collaborators}
            getCollaborator={(user) => {
              addCollaborator(user);
            }}
          >
            <Button type="button" className="mt-4 text-sm">
              <Plus />
              Add Collaborators
            </Button>
          </CollaboratorsSearch>
          <div className="mt-4">
            <span className="text-sm text-muted-foreground">
              Collaborators {collaborators.length || ""}
            </span>
            <ScrollArea className="h-[120px] overflow-y-scroll w-full rounded-md border border-muted-foreground/20">
              {collaborators.length
                ? collaborators.map((c) => (
                    <div
                      className="p-4 flex justify-between items-center"
                      key={c.id}
                    >
                      <div className="flex gap-4 items-center">
                        <Avatar>
                          <AvatarImage src=""></AvatarImage>
                          <AvatarFallback>PJ</AvatarFallback>
                        </Avatar>
                        <div className="text-sm gap-2 text-muted-foreground overflow-hidden overflow-ellipsis sm:w-[300px] w-[140px]">
                          {c.email}
                        </div>
                      </div>
                      <Button onClick={() => removeCollaborator(c)}>
                        Remove
                      </Button>
                    </div>
                  ))
                : (
                    <div className="absolute right-0 left-0 top-0 bottom-0 flex justify-center items-center">
                            <span className="text-muted-foreground text-sm">
                                You have no collaborators
                            </span>
                    </div>
                )}
            </ScrollArea>
          </div>
        </div>
      )}
      <Button
        type="button"
        disabled={
          !title || (permissions === "shared" && collaborators.length === 0) || isLoading
        }
        onClick={createItem}
      >
        Create
      </Button>
    </div>
  );
};

export default EnvironmentCreator;
