export function ProjectDetailSkeleton() {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="pb-6 border-b border-slate-200 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="h-8 w-64 bg-slate-200 rounded mb-3" />
            <div className="h-4 w-48 bg-slate-100 rounded" />
          </div>
          <div className="flex gap-2">
            <div className="h-9 w-24 bg-slate-200 rounded" />
            <div className="h-9 w-24 bg-slate-200 rounded" />
          </div>
        </div>
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Description */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="h-5 w-28 bg-slate-200 rounded mb-3" />
          <div className="space-y-2">
            <div className="h-4 w-full bg-slate-100 rounded" />
            <div className="h-4 w-5/6 bg-slate-100 rounded" />
            <div className="h-4 w-4/6 bg-slate-100 rounded" />
          </div>
        </div>

        {/* Budget */}
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="h-5 w-20 bg-slate-200 rounded mb-3" />
          <div className="h-8 w-40 bg-slate-200 rounded" />
        </div>
      </div>

      {/* Progress */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 mb-6">
        <div className="h-5 w-28 bg-slate-200 rounded mb-6" />
        <div className="flex justify-between">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex flex-col items-center">
              <div className="w-10 h-10 rounded-full bg-slate-200" />
              <div className="h-3 w-16 bg-slate-100 rounded mt-2" />
            </div>
          ))}
        </div>
      </div>

      {/* Team and Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="h-5 w-24 bg-slate-200 rounded mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-200" />
                <div className="flex-1">
                  <div className="h-4 w-32 bg-slate-200 rounded mb-1" />
                  <div className="h-3 w-24 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <div className="h-5 w-28 bg-slate-200 rounded mb-4" />
          <div className="space-y-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded bg-slate-200" />
                <div className="flex-1">
                  <div className="h-4 w-40 bg-slate-200 rounded mb-1" />
                  <div className="h-3 w-16 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
