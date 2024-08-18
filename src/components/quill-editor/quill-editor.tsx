"use client";
import { useAppState } from "@/lib/providers/state-provider";
import { Session, environment } from "@/lib/supabase/supabase.types";
import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import "quill/dist/quill.snow.css";
import { Button } from "../ui/button";
import {
  deleteSession,
  findUser,
  getSessionDetails,
  getEnvironmentDetails,
  updateSession,
  updateEnvironment,
} from "@/lib/supabase/queries";
import { usePathname, useRouter } from "next/navigation";
import {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "../ui/tooltip";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { useSocket } from "@/lib/providers/socket-provider";
import { useSupabaseUser } from "@/lib/providers/supabase-user-provider";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { Plus, PlusIcon } from "lucide-react";
import Task from "../task/task-setup";

interface QuillEditorProps {
  dirType: "environment" | "session";
  dirDetails: Session | environment;
  fileId: string;
}

const TOOLBAR_OPTIONS = [
  [{ list: "ordered" }, { list: "bullet" }],
  [{ indent: "-1" }, { indent: "+1" }],
  [{ direction: "rtl" }],
  [{ size: ["small", false, "large", "huge"] }],
  [{ color: [] }, { background: [] }],
  [{ font: [] }],
  [{ align: [] }],
];

const QuillEditor: React.FC<QuillEditorProps> = ({
  dirType,
  dirDetails,
  fileId,
}) => {
  const { state, environmentId, sessionId, dispatch } = useAppState();
  const [quill, setQuill] = useState<any>(null);
  const supabase = createClientComponentClient();
  const { socket } = useSocket();
  const [collaborators, setCollaborators] = useState<
    { id: string; email: string; avatarUrl: string }[]
  >([]);
  const { user } = useSupabaseUser();
  const [saving, setSaving] = useState(false);
  const [localCursors, setLocalCursors] = useState<any>([]);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const router = useRouter();
  const pathname = usePathname();

  const details = useMemo(() => {
    let selectedDir;

    if (dirType === "environment") {
      selectedDir = state.environments.find(
        (environment) => environment.id === environmentId
      );
    }
    if (dirType === "session") {
      selectedDir = state.environments
        .find((environment) => environment.id === environmentId)
        ?.sessions.find((session) => session.id === fileId);
    }

    if (selectedDir) return selectedDir;

    return {
      title: dirDetails.title,
      created_at: dirDetails.created_at,
      data: dirDetails.data,
      in_trash: dirDetails.in_trash,
    } as environment | Session;
  }, [state, environmentId, sessionId]);

  const breadCrumps = useMemo(() => {
    if (!pathname || !state.environments || !environmentId) return;

    const segments = pathname
      .split("/")
      .filter((value) => value !== "dashboard" && value);
    const environmentDetails = state.environments.find(
      (environment) => environment.id === environmentId
    );
    const environmentBreadCrump = environmentDetails
      ? environmentDetails.title
      : "";

    if (segments.length === 1) {
      return environmentBreadCrump;
    }

    const sessionSegment = segments[1];

    const sessionDetails = environmentDetails?.sessions.find(
      (session) => session.id === sessionSegment
    );

    const sessionBreadCrump = sessionDetails ? sessionDetails.title : "";

    if (segments.length === 2) {
      return `${environmentBreadCrump} / ${sessionBreadCrump}`;
    }
  }, [state, pathname, environmentId]);

  const wrapperRef = useCallback(async (wrapper: any) => {
    if (typeof window !== "undefined") {
      if (wrapper === null) return;
      wrapper.innerHTML = "";
      const editor = document.createElement("div");
      wrapper.append(editor);
      const Quill = (await import("quill")).default;
      const QuillCursors = (await import("quill-cursors")).default;
      Quill.register("modules/cursors", QuillCursors);
      const q = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
        placeholder: "Write your plan for the work...",
      });
      setQuill(q);
    }
  }, []);

  const restoreFileHandler = async () => {
    if (!environmentId) return;
    dispatch({
      type: "UPDATE_SESSION",
      payload: {
        session: { in_trash: "" },
        sessionId: fileId,
        environment_id: environmentId,
      },
    });
    await updateSession({ in_trash: "" }, fileId);
  };

  const deleteFileHandler = async () => {
    if (!environmentId) return;
    dispatch({
      type: "DELETE_SESSION",
      payload: {
        sessionId: fileId,
        environment_id: environmentId,
      },
    });
    await deleteSession(fileId);
    router.replace(`/dashboard/${environmentId}`);
  };
  // this useEffect isn't updating after making changes
  useEffect(() => {
    if (!fileId) return;
    let selectedDir;
    const fetchInformation = async () => {
      if (dirType === "session") {
        const { data: selectedDir, error } = await getSessionDetails(fileId);
        if (error || !selectedDir) {
          return router.replace("/dashboard");
        }

        if (!selectedDir[0]) {
          router.replace(`/dashboard/${environmentId}`);
        }
        if (quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ""));
        dispatch({
          type: "UPDATE_SESSION",
          payload: {
            sessionId: fileId,
            session: { data: selectedDir[0].data },
            environment_id: selectedDir[0].environment_id,
          },
        });
      }
      if (dirType === "environment") {
        const { data: selectedDir, error } = await getEnvironmentDetails(
          fileId
        );
        if (error || !selectedDir) {
          return router.replace("/dashboard");
        }
        if (!selectedDir[0] || quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ""));
        dispatch({
          type: "UPDATE_ENVIRONMENT",
          payload: {
            environment: { data: selectedDir[0].data },
            environment_id: fileId,
          },
        });
      }
    };
    fetchInformation();
  }, [fileId, environmentId, quill, dirType]);

  useEffect(() => {
    if (quill === null || socket === null || !fileId || !localCursors.length)
      return;
    const socketHandler = (range: any, roomId: string, cursorId: string) => {
      if (roomId === fileId) {
        const cursorToMove = localCursors.find(
          (c: any) => c.cursors()?.[0].id === cursorId
        );
        if (cursorToMove) {
          cursorToMove.moveCursor(cursorId, range);
        }
      }
    };
    socket.on("receive-cursor-move", socketHandler);
    return () => {
      socket.off("receive-cursor-move", socketHandler);
    };
  }, [quill, socket, fileId, localCursors]);

  useEffect(() => {
    if (socket === null || quill === null || !fileId) return;
    socket.emit("create-room", fileId);
  }, [socket, quill, fileId]);

  useEffect(() => {
    if (quill === null || socket === null || !fileId || !user) return;

    const selectionChangeHandler = (cursorId: string) => {
      return (range: any, oldRange: any, source: any) => {
        if (source === "user" && cursorId) {
          socket.emit("send-cursor-move", range, fileId, cursorId);
        }
      };
    };
    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== "user") return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength !== 1 && fileId) {
          if (dirType == "environment") {
            dispatch({
              type: "UPDATE_ENVIRONMENT",
              payload: {
                environment: { data: JSON.stringify(contents) },
                environment_id: fileId,
              },
            });
            await updateEnvironment({ data: JSON.stringify(contents) }, fileId);
          }
          if (dirType == "session") {
            if (!environmentId) return;
            dispatch({
              type: "UPDATE_SESSION",
              payload: {
                session: { data: JSON.stringify(contents) },
                environment_id: environmentId,
                sessionId: fileId,
              },
            });
            await updateSession({ data: JSON.stringify(contents) }, fileId);
          }
        }
        setSaving(false);
      }, 850);
      socket.emit("send-changes", delta, fileId);
    };
    quill.on("text-change", quillHandler);
    quill.on("selection-change", selectionChangeHandler(user.id));

    return () => {
      quill.off("text-change", quillHandler);
      quill.off("selection-change", selectionChangeHandler);
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, [
    quill,
    socket,
    fileId,
    user,
    details,
    sessionId,
    environmentId,
    dispatch,
  ]);

  useEffect(() => {
    if (quill === null || socket === null) return;
    const socketHandler = (deltas: any, id: string) => {
      if (id === fileId) {
        quill.updateContents(deltas);
      }
    };
    socket.on("receive-changes", socketHandler);
    return () => {
      socket.off("receive-changes", socketHandler);
    };
  }, [quill, socket, fileId]);

  useEffect(() => {
    if (!fileId || quill === null) return;
    const room = supabase.channel(fileId);
    const subscription = room
      .on("presence", { event: "sync" }, () => {
        const newState = room.presenceState();
        const newCollaborators = Object.values(newState).flat() as any;
        setCollaborators(newCollaborators);
        if (user) {
          const allCursors: any = [];
          newCollaborators.forEach(
            (collaborator: { id: string; email: string; avatar: string }) => {
              if (collaborator.id !== user.id) {
                const userCursor = quill.getModule("cursors");
                userCursor.createCursor(
                  collaborator.id,
                  collaborator.email.split("@")[0],
                  `#${Math.random().toString(16).slice(2, 8)}`
                );
                allCursors.push(userCursor);
              }
            }
          );
          setLocalCursors(allCursors);
        }
      })
      .subscribe(async (status) => {
        if (status !== "SUBSCRIBED" || !user) return;
        const response = await findUser(user.id);
        if (!response) return;

        room.track({
          id: user.id,
          email: user.email?.split("@")[0],
          avatar_url: response.avatar_url
            ? supabase.storage.from("avatars").getPublicUrl(response.avatar_url)
                .data.publicUrl
            : "",
        });
      });
    return () => {
      supabase.removeChannel(room);
    };
  }, [fileId, quill, supabase, user]);

  return (
    <>
      <div className="relative">
        {details.in_trash && (
          <article
            className="py-2 
            z-40 
            bg-[#EB5757] 
            flex  
            md:flex-row 
            flex-col 
            justify-center 
            items-center 
            gap-4 
            flex-wrap"
          >
            <div
              className="flex 
            flex-col 
            md:flex-row 
            gap-2 
            justify-center 
            items-center"
            >
              <span className="text-white">This {dirType} is in the trash</span>

              <Button
                size="sm"
                variant="outline"
                className="bg-transparent
                border-white
                text-white
                hover:bg-white
                hover:text-[#EB5757]
                "
                onClick={restoreFileHandler}
              >
                Restore
              </Button>

              <Button
                size="sm"
                variant="outline"
                className="bg-transparent
                border-white
                text-white
                hover:bg-white
                hover:text-[#EB5757]
                "
                onClick={deleteFileHandler}
              >
                Delete
              </Button>
            </div>
            <span className="text-sm text-white">{details.in_trash}</span>
          </article>
        )}
        <div
          className="flex 
        flex-col-reverse 
        sm:flex-row 
        sm:justify-between 
        justify-center 
        sm:items-center 
        sm:p-2 
        p-8"
        >
          <div>{breadCrumps}</div>
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center h-10">
              {collaborators?.map((collaborator) => (
                <TooltipProvider key={collaborator.id}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Avatar
                        className="-ml-3 
                    bg-background 
                    border-2 
                    flex 
                    items-center 
                    justify-center 
                    border-slate-300
                    text-slate-500
                    h-8 
                    w-8 
                    rounded-full"
                      >
                        <AvatarImage
                          className="rounded-full"
                          src={collaborator.avatarUrl || ""}
                        />
                        <AvatarFallback>
                          {collaborator.email.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </TooltipTrigger>
                    <TooltipContent>{collaborator.email}</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ))}
            </div>
            {saving ? (
              <Badge
                variant="secondary"
                className="bg-orange-600 top-4
                text-white
                right-4
                z-50
                "
              >
                Saving...
              </Badge>
            ) : (
              <Badge
                variant="secondary"
                className="bg-emerald-600 
                top-4
              text-white
              right-4
              z-50
              "
              >
                Saved
              </Badge>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-center items-center flex-col mt-2 relative">
        <div
          className="w-full 
        self-center 
        max-w-[800px] 
        flex 
        flex-col
         px-7 
         lg:my-8"
        >
          <span className="text-muted-foreground text-3xl font-bold h-9">
            {details.title}
          </span>
        </div>
        <Task>
          <div className="text-muted-foreground flex rounded-md hover:bg-muted items-center transition-all gap-2 p-2 cursor-pointer my-2">
            <PlusIcon size="16" /> Create a task for the session
          </div>
        </Task>
        {/* <div id="container" className="max-w-[800px]" ref={wrapperRef}></div> */}
      </div>
    </>
  );
};

export default QuillEditor;
