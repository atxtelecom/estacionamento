export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <div className="h-14 bg-blue-700 animate-pulse" />
      <div className="flex-1 p-4 max-w-2xl mx-auto w-full space-y-4">
        <div className="grid grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-48 bg-gray-200 rounded-2xl animate-pulse" />
        <div className="h-40 bg-gray-200 rounded-2xl animate-pulse" />
      </div>
    </div>
  );
}
