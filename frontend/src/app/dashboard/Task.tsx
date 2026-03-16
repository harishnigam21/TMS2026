import useApi from "@/hooks/useApi";
import { deleteTask, updateTask } from "@/redux/slices/TaskSlice";
import { Data } from "@/types/data";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { Task } from "@/types/task";

type taskCardProps = {
  task: Task;
};

export default function TaskCard({ task }: taskCardProps) {
  const dispatch = useDispatch();
  const { sendRequest: deleteTaskRequest, loading: deleteTaskLoading } =
    useApi();
  const { sendRequest: updateTaskRequest, loading: updateTaskLoading } =
    useApi();
  const deleteTheTask = async (id: number) => {
    if (!id) {
      toast.error("Invalid Task");
      return;
    }
    deleteTaskRequest(`tasks/${id}`, "DELETE").then((result) => {
      const data = result?.data as Data<number> | undefined;
      if (result && result.success) {
        toast.success(data?.message || "Task Deleted");
        if (data?.data) {
          dispatch(deleteTask(data?.data));
        }
      } else {
        const errMessage = data?.message || "Failed to delete task";
        toast.error(errMessage);
      }
    });
  };
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
    <div className="flex justify-between items-center border p-3 rounded">
      <div
        className={`cursor-pointer ${
          task.completed ? "line-through text-gray-400" : ""
        } flex items-center gap-2`}
      >
        {task.title} {updateTaskLoading && <span className="spinner"></span>}
      </div>
      <div className="flex items-center gap-4">
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

        <button
          disabled={deleteTaskLoading}
          className="text-red-500 flex items-center gap-2 cursor-pointer"
          onClick={() => deleteTheTask(task.id)}
        >
          Delete {deleteTaskLoading && <span className="spinner"></span>}
        </button>
      </div>
    </div>
  );
}
