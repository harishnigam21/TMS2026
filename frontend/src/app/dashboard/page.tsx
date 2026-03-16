"use client";

import { useEffect, useState } from "react";
import useApi from "@/hooks/useApi";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/redux/Store";
import { addTask, setTask } from "@/redux/slices/TaskSlice";
import Loading from "@/components/loaders/Loading";
import { Data } from "@/types/data";
import { Task } from "@/types/task";
import toast from "react-hot-toast";
import TaskCard from "./Task";
export default function Dashboard() {
  const tasks = useSelector((state: RootState) => state.task.tasks);
  const [title, setTitle] = useState("");
  const dispatch = useDispatch<AppDispatch>();
  const { sendRequest: getTaskRequest, loading: getTaskLoading } = useApi();

  const { sendRequest: createTaskRequest, loading: createTaskLoading } =
    useApi();
  useEffect(() => {
    async function loadTasks() {
      await getTaskRequest("tasks", "GET").then((result) => {
        const data = result?.data as Data<Task[]> | undefined;
        if (result && result.success) {
          toast.success(data?.message || "Fetched all tasks");
          dispatch(setTask(data?.data || []));
        } else {
          const errMessage = data?.message || "Failed to fetch tasks";
          toast.error(errMessage);
        }
      });
    }

    loadTasks();
  }, [dispatch, getTaskRequest]);

  const createTask = async () => {
    if (!title || title.trim().length < 2) {
      toast.error("Invalid Task Title");
      return;
    }
    createTaskRequest("tasks", "POST", { title }).then((result) => {
      const data = result?.data as Data<Task> | undefined;
      if (result && result.success) {
        toast.success(data?.message || "Created new Task");
        if (data?.data) {
          dispatch(addTask(data?.data));
        }
        setTitle("");
      } else {
        const errMessage = data?.message || "Failed to create task";
        toast.error(errMessage);
      }
    });
  };

  return getTaskLoading ? (
    <Loading />
  ) : (
    <section className="max-w-3xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Task Dashboard</h1>

      {/* Add Task */}
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={(e) => {
            if (e.key == "Enter" && !createTaskLoading) {
              createTask();
            }
          }}
          placeholder="Add new task..."
          className="border p-2 rounded w-full"
        />

        <button
          disabled={createTaskLoading}
          className="bg-green-600 text-white px-4 rounded flex items-center gap-2 cursor-pointer"
          onClick={createTask}
        >
          Add {createTaskLoading && <span className="spinner"></span>}
        </button>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {tasks.length > 0 ? (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        ) : (
          <strong className=" text-red-700">No Task Found !</strong>
        )}
      </div>
    </section>
  );
}
