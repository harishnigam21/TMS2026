export default function TaskSkeleton() {
  return (
    <div className="p-6 animate-pulse">
      {/* Task Cards Grid */}
      <div className="grid grid-cols-3 gap-4 max-w-5xl mx-auto">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="border border-gray-700 rounded-lg p-4 space-y-3"
          >
            <div className="h-4 w-3/4 bg-gray-700 rounded"></div>
            <div className="h-3 w-1/2 bg-gray-800 rounded"></div>

            <div className="flex justify-end">
              <div className="h-5 w-10 bg-gray-700 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2 mt-6">
        <div className="h-8 w-8 bg-gray-700 rounded"></div>
        <div className="h-8 w-8 bg-gray-700 rounded"></div>
        <div className="h-8 w-8 bg-gray-700 rounded"></div>
      </div>
    </div>
  );
}
