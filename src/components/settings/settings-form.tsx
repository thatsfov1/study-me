"use client";
import React, { useState, useRef, useEffect } from "react";
import { useToast } from "../ui/use-toast";
import { useAppState } from "@/lib/providers/state-provider";
import { session, User } from "@/lib/supabase/supabase.types";
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
  deleteSession,
  findUser,
  getCollaborators,
  removeCollaborators,
  updateProfile,
  updateSession,
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
  const { state, sessionId, dispatch } = useAppState();
  const {open, setOpen} = useSubscriptionModal()
  const [permissions, setPermissions] = useState("private");
  const [collaborators, setCollaborators] = useState<User[] | []>([]);
  const [openAlertMessage, setOpenAlertMessage] = useState(false);
  const [user, setUser] = useState<User | undefined>(undefined);
  const [uploadingProfilePic, setUploadingProfilePic] = useState(false);
  const [sessionDetails, setSessionDetails] = useState<session>();
  const titleTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const addCollaborator = async (user: User) => {
    if (!sessionId) return;
    await addCollaborators([user], sessionId);

    setCollaborators([...collaborators, user]);
    router.refresh();
  };

  const removeCollaborator = async (user: User) => {
    if (!sessionId) return;
    if (collaborators.length === 1) {
      setPermissions("private");
    }
    await removeCollaborators([user], sessionId);
    setCollaborators(
      collaborators.filter((collaborator) => collaborator.id !== user.id)
    );
    router.refresh();
  };

  const sessionNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!sessionId || !e.target.value) return;
    dispatch({
      type: "UPDATE_SESSION",
      payload: { session_id: sessionId, session: { title: e.target.value } },
    });

    if (titleTimerRef.current) clearTimeout(titleTimerRef.current);
    titleTimerRef.current = setTimeout(async () => {
      await updateSession({ title: e.target.value }, sessionId);
    }, 500);
  };

  const onClickAlertConfirm = async () => {
    if (!sessionId) return;

    if (collaborators.length > 0) {
      await removeCollaborators(collaborators, sessionId);
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
        if (userInfo) setUser({ ...userInfo, avatarUrl });
      }
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    const showingSession = state.sessions.find((s) => s.id === sessionId);

    if (showingSession) setSessionDetails(showingSession);
  }, []);

  useEffect(() => {
    if (!sessionId) return;

    const fetchCollaborators = async () => {
      const response = await getCollaborators(sessionId);
      if (response.length) {
        setPermissions("shared");
        setCollaborators(response);
      }
    };
    fetchCollaborators();
  }, [sessionId]);

  return (
    <div className="flex gap-4 flex-col">
      <p className="flex items-center gap-2 mt-6">
        <Briefcase />
        Session
      </p>
      <Separator />
      <div className="flex flex-col gap-2">
        <Label htmlFor="sessionName" className="text-sm text-muted-foreground">
          Name
        </Label>
        <Input
          name="sessionName"
          value={sessionDetails ? sessionDetails.title : ""}
          placeholder="Session name"
          onChange={sessionNameChange}
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
          Warning! deleting you session will permanantly delete all data related
          to this session.
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
            if (!sessionId) return;
            await deleteSession(sessionId);
            toast({ title: "Successfully deleted your session" });
            dispatch({ type: "DELETE_SESSION", payload: sessionId });
            router.replace("/dashboard");
          }}
        >
          Delete Session
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
              Changing a Shared workspace to a Private workspace will remove all
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
