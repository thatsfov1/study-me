"use client";
import React, { useState, useRef, useEffect } from "react";
import { useToast } from "../ui/use-toast";
import { useAppState } from "@/lib/providers/state-provider";
import { environment, User } from "@/lib/supabase/supabase.types";
import { useRouter } from "next/navigation";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import {
  Briefcase,
  Share,
  Lock,
  Plus,
  User as UserIcon,
  LogOut,
  CreditCard,
  ExternalLink,
} from "lucide-react";
import { Separator } from "@radix-ui/react-select";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import {
  addCollaborators,
  deleteEnvironment,
  findUser,
  getCollaborators,
  removeCollaborators,
  updateProfile,
  updateEnvironment,
} from "@/lib/supabase/queries";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectValue,
} from "../ui/select";
import CollaboratorsSearch from "../global/collaborators-search";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Alert, AlertDescription } from "../ui/alert";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { v4 } from "uuid";
import LogoutButton from "../global/logout-button";
import Link from "next/link";
import { useSubscriptionModal } from "@/lib/providers/subscription-modal-provider";

const SettingsForm = () => {
  const { toast } = useToast();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const { subscription } = useSupabaseUser();
  const { state, environmentId, dispatch } = useAppState();
  const {open, setOpen} = useSubscriptionModal()
  const [permissions, setPermissions] = useState("private");
  const [collaborators, setCollaborators] = useState<User[] | []>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [environmentDetails, setEnvironmentDetails] = useState<environment>();
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const addCollaborator = async (user: User) => {
    if (!environmentId) return;
    await addCollaborators([user], environmentId);

    setCollaborators([...collaborators, user]);
    router.refresh();
  };

  const removeCollaborator = async (user: User) => {
    if (!environmentId) return;
    if (collaborators.length === 1) {
      setPermissions("private");
    }
    await removeCollaborators([user], environmentId);
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    );
    router.refresh();
  };

  const environmentNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!environmentId || !e.target.value) return;
    dispatch({
      type: "UPDATE_ENVIRONMENT",
      payload: { environmentId, environment: { title: e.target.value } },
    });

    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      await updateEnvironment({ title: e.target.value }, environmentId);
    }, 500);
  };

  const onClickAlertConfirm = async () => {
    if (!environmentId) return;

    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, environmentId);
    }

    setPermissions("private");
    setOpenAlertMessage(false);
  };

  const onPermissionsChange = (val: string) => {
    if (val === "private") {
      setOpenAlertMessage(true);
    } else {
      setPermissions(val);
    }
  };

  const onChangeProfilePicture = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!user) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingProfilePic(true);
    const uuid = v4();
    const { data, error } = await supabase.storage
      .from("avatars")
      .upload(`avatar.${user.id}.${uuid}`, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (!error) {
      await updateProfile({ avatar_url: data.path }, user.id);
      setUploadingProfilePic(false);
      setUser({
        ...user,
        avatar_url: supabase.storage.from("avatars").getPublicUrl(data.path)
          ?.data.publicUrl,
      });
      router.refresh();
    }
  };

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const userInfo = await findUser(user.id);
        const avatarUrl = userInfo?.avatar_url
          ? supabase.storage.from("avatars").getPublicUrl(userInfo.avatar_url)
              ?.data.publicUrl
          : null;
        if (userInfo) setUser({ ...userInfo, avatar_url:avatarUrl });
      }
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    const showingEnvironment = state.environments.find((s) => s.id === environmentId);

    if (showingEnvironment) setEnvironmentDetails(showingEnvironment);
  }, []);

  useEffect(() => {
    if (!environmentId) return;

    const fetchCollaborators = async () => {
      const response = await getCollaborators(environmentId);
      if (response.length) {
        setPermissions("shared");
        setCollaborators(response);
      }
    };
    fetchCollaborators();
  }, [environmentId]);

  return (
    <div className="flex gap-4 flex-col">
      <p className="flex items-center gap-2 mt-6">
        <Briefcase />
        Environment
      </p>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label htmlFor="environmentName" className="text-sm text-muted-foreground">
          Name
        </Label>
        <Input
          name="environmentName"
          value={environmentDetails ? environmentDetails.title : ""}
          placeholder="Environment name"
          onChange={environmentNameChange}
        />
      </div>

      <>
        <Label htmlFor="permissions">Permissions</Label>
        <Select
          onValueChange={(value) => {
            setPermissions(value);
          }}
          value={permissions}
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
              {collaborators.length ? (
                collaborators.map((c) => (
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
              ) : (
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
      <Alert variant="destructive">
        <AlertDescription>
          Warning! deleting you environment will permanantly delete all data related
          to this environment.
        </AlertDescription>
        <Button
          type="submit"
          size={"sm"}
          variant={"destructive"}
          className="mt-4 
            text-sm
            bg-destructive/40 
            border-2 
            border-destructive"
          onClick={async () => {
            if (!environmentId) return;
            await deleteEnvironment(environmentId);
            toast({ title: "Successfully deleted your environment" });
            dispatch({ type: "DELETE_ENVIRONMENT", payload: environmentId });
            router.replace("/dashboard");
          }}
        >
          Delete Environment
        </Button>
      </Alert>
      <p className="flex items-center gap-2 mt-6">
        <UserIcon size={20} /> Profile
      </p>
      <Separator />
      <div className="flex items-center">
        <Avatar>
          <AvatarImage src={user?.avatar_url || ""} />
          <AvatarFallback>
            <UserIcon />
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col mt-6">
          <small className="text-muted-foreground cursor-not-allowed">
            {user ? user.email : ""}
          </small>
          <Label
            htmlFor="profilePicture"
            className="text-sm text-muted-foreground"
          ></Label>

          <Input
            name="profilePicture"
            type="file"
            accept="image/*"
            placeholder="Profile picture"
            onChange={onChangeProfilePicture}
            disabled={uploadingProfilePic}
          />
        </div>
      </div>
      <LogoutButton>
        <div className="flex items-center">
          <LogOut />
        </div>
      </LogoutButton>
      <p className="flex items-center gap-2 mt-6">
        <CreditCard size={20} /> Billing & Plan
      </p>
      <Separator />
      <p className="text-muted-foreground">
        You are currently on a{" "}
        {subscription?.status === "active" ? "Pro" : "Free"} Plan
      </p>

      <Link
        href="/"
        target="_blank"
        className="text-muted-foreground
      flex flex-row items-center gap-2"
      >
        View plans <ExternalLink size={16} />
      </Link>
      {subscription?.status === "active" ? (
        <div>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            //disabled={loadingPortal}
            className="text-sm"
            //onClick={redirectToCustomerPortal}
          >
            Manage subscription
          </Button>
        </div>
      ) : (
        <div>
          <Button
            type="button"
            size="sm"
            variant={"secondary"}
            className="text-sm"
            onClick={() => setOpen(true)}
          >
            Start Plan
          </Button>
        </div>
      )}
      <AlertDialog open={openAlertMessage}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDescription>
              Changing a Shared environment to a Private environment will remove all
              collaborators permanantly.
            </AlertDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setOpenAlertMessage(false)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={onClickAlertConfirm}>
              Change to Private
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default SettingsForm;
