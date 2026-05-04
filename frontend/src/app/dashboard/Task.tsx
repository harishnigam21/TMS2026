import useApi from "@/hooks/useApi";
import { addNote, updateNote, updateTask } from "@/redux/slices/TaskSlice";
import { Data } from "@/types/data";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Note, Task } from "@/types/task";
import { completeDate, getDaysBetween } from "@/utils/getDate";
import { AiFillDelete } from "react-icons/ai";
import { useElementHeight } from "@/hooks/useElementHeight";
import React, { useEffect, useRef, useState } from "react";
import { IoMdSend } from "react-icons/io";
import { AppDispatch } from "@/redux/Store";
import { TbInfoOctagon } from "react-icons/tb";
import Notes from "@/components/Notes";
import { CornerRightDown } from "lucide-react";

type taskCardProps = {
  task: Task;
  deleteTaskLoading: boolean;
  deleteTheTask: (id: number) => void;
};

function TaskCard({ task, deleteTheTask, deleteTaskLoading }: taskCardProps) {
  const [ref, height] = useElementHeight();
  const [expand, setExpand] = useState<boolean>(false);
  const [taskInfo, setTaskInfo] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const [notesValue, setNotesValue] = useState<string>("");
  const [inputType, setInputType] = useState<{
    type: string;
    prevValue: string;
    id: number;
  } | null>(null);
  const { sendRequest: updateTaskRequest, loading: updateTaskLoading } =
    useApi();
  const { sendRequest: noteCreateRequest, loading: noteCreateLoading } =
    useApi();
  const { sendRequest: noteEditRequest, loading: noteEditLoading } = useApi();

  const updateTheTask = async (id: number) => {
    if (!id) {
      toast.error("Invalid Task");
      return;
    }
    updateTaskRequest(`tasks/${id}/toggle`, "PATCH").then((result) => {
      const data = result?.data as Data<Task> | undefined;
      if (result && result.success) {
        toast.success(
          data?.message ||
            `${data?.data?.completed ? "Task Completed" : "Task not completed"}`,
        );
        if (data?.data) {
          dispatch(updateTask(data?.data));
        }
      } else {
        const errMessage = data?.message || "Failed to update task";
        toast.error(errMessage);
      }
    });
  };
  const handleNotesCreate = async (id: number) => {
    if (!id) {
      toast.error("Invalid Task");
      return;
    }
    if (inputType && inputType.type && inputType.type == "noteEdit") {
      if (inputType.prevValue.trim() == notesValue.trim()) {
        toast.error("No Modification done");
        return;
      }
      if (inputType.id) {
        noteEditRequest(`tasks/${id}/note/${inputType.id}/edit`, "POST", {
          note: notesValue,
        }).then((result) => {
          const data = result?.data as Data<Note> | undefined;
          if (result && result.success) {
            toast.success(data?.message || "Updated Note");
            if (data?.data) {
              dispatch(updateNote(data.data));
            }
            setNotesValue("");
            setInputType(null);
          } else {
            const errMessage = data?.message || "Failed to update note";
            toast.error(errMessage);
          }
        });
      }
      return;
    }
    noteCreateRequest(`tasks/${id}/note`, "PATCH", { note: notesValue }).then(
      (result) => {
        const data = result?.data as Data<Note> | undefined;
        if (result && result.success) {
          toast.success(data?.message || "Added new Note");
          if (data?.data) {
            dispatch(addNote(data.data));
          }
          setNotesValue("");
        } else {
          const errMessage = data?.message || "Failed to add note";
          toast.error(errMessage);
        }
      },
    );
  };
  const noteScrollRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (noteScrollRef.current) {
      noteScrollRef.current.scrollTo({
        top: noteScrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [task.notes]);
  useEffect(() => {
    const expansion = async () => {
      if (taskInfo) {
        setExpand(true);
      } else {
        setExpand(false);
      }
    };
    expansion();
  }, [taskInfo]);
  return (
    <div
      style={{ maxHeight: `${expand ? 500 : height + 24}px` }}
      className="flex flex-col justify-between gap-2 border p-3 rounded-xl overflow-hidden transition-all duration-200"
      onMouseLeave={() => {
        setTaskInfo(null);
      }}
    >
      <div ref={ref}>
        <div
          className={` ${
            task.completed ? "line-through text-gray-400" : ""
          } m-auto  gap-2`}
        >
          <div className="min-w-fit flex gap-2 float-right">
            <CornerRightDown
              size={20}
              className={`text-blue-500 cursor-pointer hover:scale-150 transition-all ${expand?'rotate-180 ':'rotate-y-180'}`}
              onClick={() => {
                setTaskInfo("more");
              }}
            >
              <title>Expand</title>
            </CornerRightDown>
            <TbInfoOctagon
              size={20}
              className="text-blue-500 cursor-pointer hover:scale-150 transition-all"
              onClick={() => {
                setTaskInfo("info");
              }}
            >
             <title>Task Info</title>
            </TbInfoOctagon>
            {updateTaskLoading && <div className="spinner"></div>}
            <button
              disabled={updateTaskLoading}
              onClick={() => updateTheTask(task.id)}
              className={`w-8 h-4 flex items-center cursor-pointer rounded-full p-1 transition
      ${task.completed ? "bg-green-500" : "bg-gray-500"}`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow-md transform transition ${task.completed ? "translate-x-4" : "translate-x-0"}`}
              ></div>
            </button>
          </div>
          <p className={`${expand ? "" : "line-clamp-1"} cursor-pointer`}>
            {task.title}
          </p>
        </div>
        <small className="text-xs opacity-40">
          {getDaysBetween(task.createdAt)}
        </small>
      </div>
      {/* //notes */}
      {taskInfo == "info" ? (
        <div>
          <strong className="text-md text-blue-500 opacity-100 py-3">
            Task Info :
          </strong>
          <div className="opacity-40 flex flex-col">
            <small>Created At : {completeDate(task.createdAt)}</small>
            <small>Last Updated At : {completeDate(task.updatedAt)}</small>
            <small>
              Status :{" "}
              {task.completed ? (
                <span className="text-green-500">completed</span>
              ) : (
                <span className="text-red-500">InComplete</span>
              )}
            </small>
          </div>
        </div>
      ) : taskInfo == "more" ? (
        <div className="flex flex-col gap-2 grow justify-end-safe">
          <small className="text-green-500">
            Notes :{" "}
            {!task.notes ||
              (task.notes.length == 0 && (
                <span className="text-red-500">No notes !</span>
              ))}
          </small>
          {task.notes && task.notes.length > 0 && (
            <div
              ref={noteScrollRef}
              className="flex flex-col max-h-40 overflow-auto manual-scroll bg-gray-500/20 p-2 rounded-xl"
            >
              {task.notes.map((note, index) => (
                <Notes
                  key={`task/notes/${index}`}
                  note={note}
                  index={index}
                  setNotesValue={setNotesValue}
                  setInputType={setInputType}
                />
              ))}
            </div>
          )}
          {!task.completed && (
            <div className="flex gap-2 w-full items-center">
              <input
                type="text"
                name="newNote"
                id={`newNote/${task.id}`}
                value={notesValue}
                placeholder="Add Notes..."
                className="w-full py-1 text-sm px-4 rounded-full border border-gray-600/20"
                onChange={(e) => setNotesValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !noteCreateLoading) {
                    handleNotesCreate(task.id);
                  }
                }}
              />
              {noteCreateLoading || noteEditLoading ? (
                <span className="spinner"></span>
              ) : (
                <IoMdSend
                  className="cursor-pointer text-blue-700 text-xl"
                  onClick={() => handleNotesCreate(task.id)}
                />
              )}
            </div>
          )}
        </div>
      ) : (
        <></>
      )}
      <div className="flex gap-4 pt-4">
        <button
          disabled={deleteTaskLoading}
          className="text-red-500 flex items-center gap-2 cursor-pointer"
          onClick={() => deleteTheTask(task.id)}
        >
          <AiFillDelete
            className={`text-xl text-red-500 ${deleteTaskLoading ? "animate-ping duration-100" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
export default React.memo(TaskCard);
