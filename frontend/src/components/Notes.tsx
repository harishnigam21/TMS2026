import useApi from "@/hooks/useApi";
import { deleteNote } from "@/redux/slices/TaskSlice";
import { AppDispatch } from "@/redux/Store";
import { Data } from "@/types/data";
import { Note } from "@/types/task";
import { Check, Pencil, Trash, X } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";

export default function Notes({
  index,
  note,
  setNotesValue,
  setInputType,
}: {
  index: number;
  note: Note;
  setNotesValue: React.Dispatch<React.SetStateAction<string>>;
  setInputType: React.Dispatch<
    React.SetStateAction<{
      type: string;
      prevValue: string;
      id: number;
    } | null>
  >;
}) {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  const handleEdit = () => {
    setNotesValue(note.note);
    setInputType({ type: "noteEdit", prevValue: note.note, id: note.id });
  };
  const dispatch = useDispatch<AppDispatch>();
  const handleMarkDone = () => {};
  const handleMarkNotDone = () => {};
  const { sendRequest: noteDeletetRequest, loading: noteDeletetLoading } =
    useApi();
  const handleDelete = (note: Note) => {
    noteDeletetRequest(
      `tasks/${note.taskId}/note/${note.id}/delete`,
      "DELETE",
    ).then((result) => {
      const data = result?.data as Data<Note> | undefined;
      if (result && result.success) {
        toast.success(data?.message || "Deleted Note");
        if (data?.data) {
          dispatch(deleteNote(data.data));
        }
      } else {
        const errMessage = data?.message || "Failed to delete note";
        toast.error(errMessage);
      }
    });
  };
  return (
    <div
      className={`relative flex items-center-safe p-2 ${showOptions ? "bg-gray-50/10" : ""} rounded-full`}
      onMouseLeave={() => setShowOptions(false)}
      onMouseEnter={() => setShowOptions((prev) => !prev)}
    >
      <div className="flex gap-2 cursor-pointer">
        <small>{index + 1}.</small>
        <small>{note.note}.</small>
      </div>
      <div
        className={`grid grid-cols-4 place-items-center place-self-center rounded-full absolute right-0 text-sm z-10 bg-black max-w-0 overflow-hidden ${showOptions ? "max-w-40 " : "max-w-0 p-0"} transition-all duration-500`}
      >
        <div className={`p-2`} onClick={handleEdit}>
          <Pencil size={15} className="text-blue-500 cursor-pointer">
            <title>Edit</title>
          </Pencil>
        </div>
        <div
          className={`p-2 ${note.completed ? "bg-green-700" : ""} cursor-pointer`}
          onClick={handleMarkDone}
        >
          <Check size={15}>
            <title>Mark Done</title>
          </Check>
        </div>
        <div
          onClick={handleMarkNotDone}
          className={`p-2 ${note.completed ? "" : "bg-red-700"} cursor-pointer`}
        >
          <X size={15}>
            <title>Mark Not Done</title>
          </X>
        </div>
        <div onClick={() => handleDelete(note)} className={`p-2`}>
          <Trash
            size={15}
            className={`text-red-500 cursor-pointer ${noteDeletetLoading ? "animate-ping duration-100" : "animate-none"}`}
          >
            <title>Remove</title>
          </Trash>
        </div>
      </div>
    </div>
  );
}
