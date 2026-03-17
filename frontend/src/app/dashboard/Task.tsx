import useApi from "@/hooks/useApi";
import { addNote, updateTask } from "@/redux/slices/TaskSlice";
import { Data } from "@/types/data";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Task } from "@/types/task";
import { getDaysBetween } from "@/utils/getDate";
import { AiFillDelete } from "react-icons/ai";
import { useElementHeight } from "@/hooks/useElementHeight";
import React, { useState } from "react";
import { IoMdSend } from "react-icons/io";
import { AppDispatch } from "@/redux/Store";

type taskCardProps = {
  task: Task;
  deleteTaskLoading: boolean;
  deleteTheTask: (id: number) => void;
};

function TaskCard({ task, deleteTheTask, deleteTaskLoading }: taskCardProps) {
  const [ref, height] = useElementHeight();
  const [expand, setExpand] = useState<boolean>(false);
  const dispatch = useDispatch<AppDispatch>();
  const [notesValue, setNotesValue] = useState<string>("");
  const { sendRequest: updateTaskRequest, loading: updateTaskLoading } =
    useApi();
  const { sendRequest: noteCreateRequest, loading: noteCreateLoading } =
    useApi();

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
    noteCreateRequest(`tasks/${id}/note`, "PATCH", { note: notesValue }).then(
      (result) => {
        const data = result?.data as
          | Data<{ id: number; note: string }>
          | undefined;
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
  return (
    <div
      style={{ maxHeight: `${expand ? 500 : height + 24}px` }}
      className="flex flex-col justify-between gap-2 border p-3 rounded-xl overflow-hidden transition-all duration-200"
      onMouseLeave={() => setExpand(false)}
    >
      <div ref={ref}>
        <div
          className={` ${
            task.completed ? "line-through text-gray-400" : ""
          } m-auto  gap-2`}
        >
          <div className="min-w-fit flex gap-2 float-right">
            {updateTaskLoading && <div className="spinner"></div>}
            <button
              disabled={updateTaskLoading}
              onClick={() => updateTheTask(task.id)}
              className={`w-8 h-4 flex items-center cursor-pointer rounded-full p-1 transition
      ${task.completed ? "bg-green-500" : "bg-gray-500"}`}
            >
              <div
                className={`bg-white w-3 h-3 rounded-full shadow-md transform transition
        ${task.completed ? "translate-x-4" : "translate-x-0"}`}
              />
            </button>
          </div>
          <p
            className={`${expand ? "" : "line-clamp-1"} cursor-pointer`}
            onClick={() => setExpand((prev) => !prev)}
          >
            {task.title}
          </p>
        </div>
        <small className="text-xs opacity-40">
          {getDaysBetween(task.createdAt)}
        </small>
      </div>
      {/* //notes */}
      <div className="flex flex-col gap-2 grow justify-end-safe">
        <small className="text-green-500">
          Notes :{" "}
          {!task.notes ||
            (task.notes.length == 0 && (
              <span className="text-red-500">No notes !</span>
            ))}
        </small>
        {task.notes && task.notes.length > 0 && (
          <div className="flex flex-col">
            {task.notes.map((note, index) => (
              <div className="flex gap-2" key={`task/notes/${index}`}>
                <small>{index + 1}.</small>
                <small>{note}.</small>
              </div>
            ))}
          </div>
        )}
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
          {noteCreateLoading ? (
            <span className="spinner"></span>
          ) : (
            <IoMdSend
              className="cursor-pointer text-blue-700"
              onClick={() => handleNotesCreate(task.id)}
            />
          )}
        </div>
      </div>
      <div className="flex gap-4 pt-4">
        <button
          disabled={deleteTaskLoading}
          className="text-red-500 flex items-center gap-2 cursor-pointer"
          onClick={() => deleteTheTask(task.id)}
        >
          <AiFillDelete
            className={`text-xl text-red-500 ${deleteTaskLoading ? "animate-pulse duration-100" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
export default React.memo(TaskCard);
