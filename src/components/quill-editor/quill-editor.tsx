"use client";
import { useAppState } from "@/lib/providers/state-provider";
import { Folder, session } from "@/lib/supabase/supabase.types";
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
  deleteFolder,
  getFolderDetails,
  getSessionDetails,
  updateFolder,
  updateSession,
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

interface QuillEditorProps {
  dirType: "session" | "folder";
  dirDetails: Folder | session;
  fileId: string;
}

const TOOLBAR_OPTIONS = [
  ["bold", "italic", "underline", "strike"], // toggled buttons
  ["blockquote", "code-block"],

  [{ header: 1 }, { header: 2 }], // custom button values
  [{ list: "ordered" }, { list: "bullet" }],
  [{ script: "sub" }, { script: "super" }], // superscript/subscript
  [{ indent: "-1" }, { indent: "+1" }], // outdent/indent
  [{ direction: "rtl" }], // text direction

  [{ size: ["small", false, "large", "huge"] }], // custom dropdown
  [{ header: [1, 2, 3, 4, 5, 6, false] }],

  [{ color: [] }, { background: [] }], // dropdown with defaults from theme
  [{ font: [] }],
  [{ align: [] }],

  ["clean"], // remove formatting button
];

const QuillEditor: React.FC<QuillEditorProps> = ({
  dirType,
  dirDetails,
  fileId,
}) => {
  const { state, sessionId, folderId, dispatch } = useAppState();
  const [quill, setQuill] = useState<any>(null);
  const { socket } = useSocket();
  const [collaborators, setCollaborators] = useState<
    { id: string; email: string; avatarUrl: string }[]
  >([]);
  const { user } = useSupabaseUser();
  const [saving, setSaving] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const router = useRouter();
  const pathname = usePathname();
  const details = useMemo(() => {
    let selectedDir;

    if (dirType === "session") {
      selectedDir = state.sessions.find((session) => session.id === sessionId);
    }
    if (dirType === "folder") {
      selectedDir = state.sessions
        .find((session) => session.id === sessionId)
        ?.folders.find((folder) => folder.id === fileId);
    }

    if (selectedDir) return selectedDir;

    return {
      title: dirDetails.title,
      created_at: dirDetails.created_at,
      data: dirDetails.data,
      in_trash: dirDetails.in_trash,
    } as session | Folder;
  }, [state, sessionId, folderId]);

  const breadCrumps = useMemo(() => {
    if (!pathname || !state.sessions || !sessionId) return;

    const segments = pathname
      .split("/")
      .filter((value) => value !== "dashboard" && value);
    const sessionDetails = state.sessions.find(
      (session) => session.id === sessionId
    );
    const sessionBreadCrump = sessionDetails ? sessionDetails.title : "";

    if (segments.length === 1) {
      return sessionBreadCrump;
    }

    const folderSegment = segments[1];

    const folderDetails = sessionDetails?.folders.find(
      (folder) => folder.id === folderSegment
    );

    const folderBreadCrump = folderDetails ? folderDetails.title : "";

    if (segments.length === 2) {
      return `${sessionBreadCrump} ${folderBreadCrump}`;
    }
  }, [state, pathname, sessionId]);

  const wrapperRef = useCallback(async (wrapper: any) => {
    if (typeof window !== "undefined") {
      if (wrapper === null) return;
      wrapper.innerHTML = "";
      const editor = document.createElement("div");
      wrapper.append(editor);
      const Quill = (await import("quill")).default;
      const q = new Quill(editor, {
        theme: "snow",
        modules: {
          toolbar: TOOLBAR_OPTIONS,
          cursors: {
            transformOnTextChange: true,
          },
        },
      });
      setQuill(q);
    }
  }, []);

  const restoreFileHandler = async () => {
    if (!sessionId) return;
    dispatch({
      type: "UPDATE_FOLDER",
      payload: {
        folder: { in_trash: "" },
        folderId: fileId,
        session_id: sessionId,
      },
    });
    await updateFolder({ in_trash: "" }, fileId);
  };

  const deleteFileHandler = async () => {
    if (!sessionId) return;
    dispatch({
      type: "DELETE_FOLDER",
      payload: {
        folderId: fileId,
        session_id: sessionId,
      },
    });
    await deleteFolder(fileId);
    router.replace(`/dashboard/${sessionId}`);
  };

  useEffect(() => {
    if (!fileId) return;
    let selectedDir;
    const fetchInformation = async () => {
      if (dirType === "folder") {
        const { data: selectedDir, error } = await getFolderDetails(fileId);

        if (!error || !selectedDir) {
          return router.replace("/dashboard");
        }

        if (!selectedDir[0]) {
          router.replace(`/dashboard/${sessionId}`);
        }

        if (quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ""));

        dispatch({
          type: "UPDATE_FOLDER",
          payload: {
            folderId: fileId,
            folder: { data: selectedDir[0].data },
            session_id: selectedDir[0].session_id,
          },
        });
      }
      if (dirType === "session") {
        const { data: selectedDir, error } = await getSessionDetails(fileId);
        if (error || !selectedDir) {
          return router.replace("/dashboard");
        }
        if (!selectedDir[0] || quill === null) return;
        if (!selectedDir[0].data) return;
        quill.setContents(JSON.parse(selectedDir[0].data || ""));
        dispatch({
          type: "UPDATE_SESSION",
          payload: {
            session: { data: selectedDir[0].data },
            session_id: fileId,
          },
        });
      }
    };
    fetchInformation();
  }, [fileId, sessionId, quill, dirType]);

  useEffect(() => {
    if (socket === null || quill === null || !fileId) return;

    socket.emit("create-room", fileId);
  }, [socket, quill, fileId]);

  useEffect(() => {
    if (quill === null || socket === null || !fileId || !user || !sessionId) return;

    const selectionChangeHandler = () => {};
    const quillHandler = (delta: any, oldDelta: any, source: any) => {
      if (source !== "user") return;
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      setSaving(true);
      const contents = quill.getContents();
      const quillLength = quill.getLength();
      saveTimerRef.current = setTimeout(async () => {
        if (contents && quillLength === 1 && fileId) {
          if (dirType === "session") {
              dispatch({
                type: "UPDATE_SESSION",
                payload: {
                  session_id: sessionId,
                  session: { data: JSON.stringify(contents) },
                },
              });

              await updateSession({data: JSON.stringify(contents)}, fileId)
          }
          
          if (dirType === "folder") {
              dispatch({
                type: "UPDATE_FOLDER",
                payload: {
                  folder:{data: JSON.stringify(contents)},
                  session_id: sessionId,
                  folderId: fileId
                },
              });

              await updateFolder({data: JSON.stringify(contents)}, fileId)
          }
        }
        setSaving(false)
      }, 850);
      socket.emit('send-changes', delta, fileId)
    };
    quill.on('text-change', quillHandler)

    return () => {
      quill.off('text-change', quillHandler)

      if(saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [quill, socket, fileId, user, details, folderId, sessionId]);

  useEffect(() => {
    if(quill === null || socket === null) return
    const socketHandler = (deltas:any, id:string) => {
      if(id===fileId){
        quill.updateContents(deltas)
      } 
    }
    socket.on('receive-changes', socketHandler )
    return () => {
      socket.off('receive-changes', socketHandler )
    }
  }, [quill, socket, fileId])
  

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
            <span className="text-sm text-white">
              Deleted by {details.in_trash}
            </span>
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
                    border-white 
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
                    <TooltipContent></TooltipContent>
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
        <div id="container" className="max-w-[800px]" ref={wrapperRef}></div>
      </div>
    </>
  );
};

export default QuillEditor;
