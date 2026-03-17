import useApi from "@/hooks/useApi";
import { updateTask } from "@/redux/slices/TaskSlice";
import { Data } from "@/types/data";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Task } from "@/types/task";
import { getDaysBetween } from "@/utils/getDate";
import { AiFillDelete } from "react-icons/ai";
import { useElementHeight } from "@/hooks/useElementHeight";
import React, { useState } from "react";

type taskCardProps = {
  task: Task;
  deleteTaskLoading: boolean;
  deleteTheTask: (id: number) => void;
};

function TaskCard({
  task,
  deleteTheTask,
  deleteTaskLoading,
}: taskCardProps) {
  const [ref, height] = useElementHeight();
  const [expand, setExpand] = useState(false);
  const dispatch = useDispatch();

  const { sendRequest: updateTaskRequest, loading: updateTaskLoading } =
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
            `${data?.data.completed ? "Task Completed" : "Task not completed"}`,
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
  return (
    <div
      style={{ maxHeight: `${expand ? 500 : height + 24}px` }}
      className="flex flex-col justify-between gap-2 border p-3 rounded-xl overflow-hidden transition-all duration-200"
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
      <div className="flex flex-col grow">
        <p>{task.description}</p>
      </div>
      <div className="flex gap-4 grow">
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