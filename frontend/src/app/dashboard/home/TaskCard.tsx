import useApi from "@/hooks/useApi";
import {
  clearpriorityChanges,
  onlyClearpriorityChange,
  starTask,
  updateTask,
} from "@/redux/slices/TaskSlice";
import { Data } from "@/types/data";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { Task } from "@/types/task";
import { completeDate, getDaysBetween } from "@/utils/getDate";
import { useElementHeight } from "@/hooks/useElementHeight";
import React, { useEffect, useState } from "react";
import { AppDispatch, RootState } from "@/redux/Store";
import {
  BadgeInfo,
  ChevronsDown,
  CornerRightDown,
  Expand,
  Info,
  Star,
  Trash,
  X,
} from "lucide-react";
import ExpandTask from "@/components/ExpandTask";

type taskCardProps = {
  task: Task;
  deleteTaskLoading: boolean;
  deleteTheTask: (id: number) => void;
};

function TaskCard({ task, deleteTheTask, deleteTaskLoading }: taskCardProps) {
  const [ref, height] = useElementHeight();
  const [expand, setExpand] = useState<boolean>(false);
  const [noteInfo, setNoteInfo] = useState<boolean>(false);
  const [fullScreen, setFullScreen] = useState<boolean>(false);
  const [taskInfo, setTaskInfo] = useState<string | null>(null);
  const dispatch = useDispatch<AppDispatch>();
  const priorityChanges = useSelector(
    (state: RootState) => state.task.priorityChanges,
  );
  const { sendRequest: updateTaskRequest, loading: updateTaskLoading } =
    useApi();
  const { sendRequest: starRequest, loading: starLoading } = useApi();
  const { sendRequest: prioritySaveRequest, loading: prioritySaveLoading } =
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
  const handleTaskStar = async (task: Task) => {
    if (task) {
      starRequest(`tasks/${task.id}/star`, "PATCH").then((result) => {
        const data = result?.data as Data<Task> | undefined;
        if (result && result.success) {
          toast.success(
            data?.message ||
              `${data?.data?.completed ? "Star Added" : "Star Removed"}`,
          );
          if (data?.data) {
            dispatch(starTask(data?.data));
          }
        } else {
          const errMessage = data?.message || "Failed to star task";
          toast.error(errMessage);
        }
      });
    }
  };
  const handlePrioritySave = async (id: number) => {
    if (id && priorityChanges.size > 0) {
      await prioritySaveRequest(`tasks/${id}/notes/priority`, "PATCH", {
        changes: JSON.stringify(Object.fromEntries(priorityChanges)),
      }).then((result) => {
        const data = result?.data as Data<null> | undefined;
        if (result && result.success && data?.status) {
          toast.success("Successfully saved changes");
          dispatch(onlyClearpriorityChange());
        } else {
          const errMess =
            data?.message || "Failed to save your changes, Please try again";
          toast.error(errMess);
        }
      });
    } else {
      toast.error("Invalid Task or No changes made");
    }
  };
  const handlePriorityReset = async (id: number) => {
    dispatch(clearpriorityChanges({ id }));
  };
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
  if (fullScreen && task) {
    return (
      <article className="fixed top-0 left-0 z-10 w-full h-full backdrop-blur-xl flex justify-center-safe items-center-safe p-2">
        <X
          size={30}
          color="red"
          strokeWidth={5}
          className="fixed top-0 right-0 cursor-pointer z-10"
          onClick={async () => {
            if (priorityChanges.size > 0) {
              const confirm = window.confirm(
                "Would You like to save changed priorities ?",
              );
              try {
                if (confirm) {
                  await handlePrioritySave(task.id);
                }
              } catch (error) {
                console.error("From confirming the priority changes", error);
              } finally {
                handlePriorityReset(task.id);
                setFullScreen(false);
              }
            } else {
              setFullScreen(false);
            }
          }}
        >
          <title>Close Task</title>
        </X>
        <ExpandTask
          task={task}
          deleteTheTask={deleteTheTask}
          deleteTaskLoading={deleteTaskLoading}
          handlePriorityReset={handlePriorityReset}
          handlePrioritySave={handlePrioritySave}
          prioritySaveLoading={prioritySaveLoading}
          priorityChanges={priorityChanges}
        />
      </article>
    );
  }
  return (
    <article className="relative flex flex-col">
      <div
        style={{ maxHeight: `${expand ? 500 : height + 24}px` }}
        className="flex relative flex-col justify-between gap-2 border border-amber-900/30 p-3 rounded-xl overflow-hidden transition-all duration-200"
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
                className={`text-green-500 cursor-pointer hover:scale-150 transition-all ${expand && taskInfo == "more" ? "rotate-180 " : "rotate-y-180"}`}
                onClick={() => {
                  setTaskInfo("more");
                }}
              >
                <title>Expand</title>
              </CornerRightDown>
              <BadgeInfo
                size={20}
                className="text-blue-500 cursor-pointer hover:scale-150 transition-all"
                onClick={() => {
                  setTaskInfo("info");
                }}
              >
                <title>Task Info</title>
              </BadgeInfo>
              {updateTaskLoading && <div className="spinner"></div>}
              <button
                disabled={updateTaskLoading}
                onClick={() => updateTheTask(task.id)}
                className={`w-8 h-4 flex items-center cursor-pointer rounded-full p-1 transition
      ${task.completed ? "bg-green-500" : "bg-gray-500"}`}
              >
                <div
                  className={`bg-amber-900 w-3 h-3 rounded-full shadow-md transform transition ${task.completed ? "translate-x-4" : "translate-x-0"}`}
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
            <small className="font-bold text-blue-500">Info :</small>
            <ol className="list-disc list-outside pl-6 text-xs">
              <li className="text-gray-200/60">
                <span className="font-bold text-white/80">Created At :</span>
                {completeDate(task.createdAt)}
              </li>
              <li className="text-gray-200/60">
                <span className="font-bold text-white/80">Updated At : </span>
                {completeDate(task.updatedAt)}
              </li>
              <li className="text-gray-200/60">
                <span className="font-bold text-white/80">Status : </span>

                {task.completed ? (
                  <span className="text-green-500">Task completed</span>
                ) : (
                  <span className="text-red-500">Task incompleted</span>
                )}
              </li>
            </ol>
          </div>
        ) : taskInfo == "more" ? (
          <div className="flex flex-col gap-2 grow justify-end-safe">
            <div className="text-green-500 flex flex-wrap gap-2 items-center">
              <b className="text-sm whitespace-nowrap">Notes :</b>
              {task?.notes.length > 0 ? (
                <div className="relative flex grow">
                  <Info
                    size={15}
                    color="red"
                    className="ping cursor-pointer"
                    onClick={() => setNoteInfo((prev) => !prev)}
                  />
                  {noteInfo && (
                    <ul
                      className="absolute list-disc list-outside pl-6 border border-red-600 marker:text-red-600 top-0 left-4 w-[95%] max-h-40 p-2 text-xs bg-black text-white rounded-xl overflow-y-auto manual-scroll"
                      onMouseLeave={() => setNoteInfo(false)}
                    >
                      <li>
                        Expand Task by clicking icon at top middle of task.
                      </li>
                      <li>
                        There you can edit, delete, update, mark the note.
                      </li>
                      <li>
                        You can prioritize the task, just by dragging them.
                      </li>
                    </ul>
                  )}
                </div>
              ) : (
                <small className="text-red-500">No notes !</small>
              )}
            </div>
            {task.notes && task.notes.length > 0 && (
              <div className="flex flex-col gap-1 max-h-40 overflow-auto manual-scroll bg-gray-500/20 p-2 rounded-xl">
                {task.notes.slice(0, 5).map((note, index) => (
                  <div
                    key={`task/notes/${index}`}
                    className="flex gap-2 cursor-pointer w-full"
                  >
                    <small>{index + 1}.</small>
                    <div
                      className={` w-full wrap-anywhere grow flex flex-col justify-start `}
                    >
                      <div className="-m-1">
                        {note.note.split("\n").map((sn, i) => (
                          <small key={`mini/sn/${i}`}>
                            {sn}
                            <br />
                          </small>
                        ))}
                      </div>
                      {noteInfo && (
                        <div className="flex flex-col">
                          <small className="font-bold text-blue-500">
                            Info :
                          </small>
                          <ol className="list-disc list-outside pl-6 text-xs">
                            <li className="text-gray-200/60">
                              <span className="font-bold text-white/80">
                                Created At :
                              </span>
                              {completeDate(note.createdAt)}
                            </li>
                            <li className="text-gray-200/60">
                              <span className="font-bold text-white/80">
                                Updated At :{" "}
                              </span>
                              {completeDate(note.updatedAt)}
                            </li>
                            <li className="text-gray-200/60">
                              <span className="font-bold text-white/80">
                                Status :{" "}
                              </span>

                              {note.completed ? (
                                <span className="text-green-500">
                                  note completed
                                </span>
                              ) : (
                                <span className="text-red-500">
                                  note incompleted
                                </span>
                              )}
                            </li>
                          </ol>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                {task.noteCount > 5 && (
                  <div className="flex justify-center items-center">
                    <ChevronsDown
                      className="animate-bounce cursor-pointer"
                      color="green"
                      onClick={() => setFullScreen(true)}
                    >
                      <title>More</title>
                    </ChevronsDown>
                  </div>
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
            <Trash
              className={`text-xl text-red-500 ${deleteTaskLoading ? "animate-ping duration-100" : ""}`}
            />
          </button>
        </div>
      </div>
      {/* Star icon */}
      <div className="sticky flex justify-end-safe -mt-3.25 -mr-2 ">
        <Star
          className={`cursor-pointer transition-all ${starLoading ? "animate-spin" : "animate-none"} text-amber-900/30`}
          size={20}
          strokeWidth={1.5}
          fill={task.star ? "yellow" : "black"}
          onClick={() => handleTaskStar(task)}
        >
          <title>Star Your Task</title>
        </Star>
      </div>
      {/* Expand icon */}
      <div className="absolute -top-2.5 self-center">
        <Expand
          className="cursor-pointer"
          color="orange"
          size={20}
          onClick={() => setFullScreen(true)}
        >
          <title>View Task in Full Screen</title>
        </Expand>
      </div>
    </article>
  );
}
export default React.memo(TaskCard);
