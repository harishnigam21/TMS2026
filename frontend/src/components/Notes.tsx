import { Note } from "@/types/task";
import { useState } from "react";
import { MdModeEdit } from "react-icons/md";
import { MdDelete } from "react-icons/md";

export default function Notes({ index, note }: { index: number; note: Note }) {
  const [showOptions, setShowOptions] = useState<boolean>(false);
  return (
    <div
      className="relative"
      onClick={() => setShowOptions((prev) => !prev)}
      onMouseLeave={() => setShowOptions(false)}
    >
      <div className="flex gap-2 cursor-pointer">
        <small>{index + 1}.</small>
        <small>{note.note}.</small>
      </div>
      <div
        className={`flex items-center gap-3 flex-nowrap rounded-full absolute right-0 -top-1.5 text-md z-10 bg-black max-w-0 overflow-hidden ${showOptions ? "max-w-40 py-1 px-3" : "max-w-0 p-0"} transition-all`}
      >
        <MdModeEdit title="edit" className="text-blue-500 cursor-pointer" />
        <b title="mark done" className="text-green-500 cursor-pointer">
          ✔
        </b>
        <b title="mark not done" className="cursor-pointer">
          ❌
        </b>
        <MdDelete title="remove" className="text-red-500 cursor-pointer" />
      </div>
    </div>
  );
}
