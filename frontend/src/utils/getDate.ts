import { formatDistanceToNow } from "date-fns";

export const getDaysBetween = (dateString?: string): string => {
  if (!dateString) return "";

  return formatDistanceToNow(new Date(dateString), { addSuffix: true });
};
export const formatMessageDate = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMs: number = now.getTime() - date.getTime();
  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  const isSameDay = date.toDateString() === now.toDateString();
  if (isSameDay) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  }
  if (diffInDays < 7) {
    return date.toLocaleTimeString("en-US", { weekday: "long" }).split(" ")[0];
    // Returns: "Monday", "Tuesday", etc.
  }
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);
  return `${day}/${month}/${year}`;
};
export const completeDate = (dateString: string) => {
  const date = new Date(dateString);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  const weekday = date.toLocaleDateString("en-IN", {
    weekday: "long",
  });

  return `${day}/${month}/${year}, ${hours}:${minutes}, ${weekday}`;
};
