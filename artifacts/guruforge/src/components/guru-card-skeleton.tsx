export default function GuruCardSkeleton() {
  return (
    <div className="border border-[#e0e0e0] bg-white p-6 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-4 w-20 bg-[#f0f0f0]" />
        <div className="h-4 w-12 bg-[#f0f0f0]" />
      </div>
      <div className="h-5 w-3/4 bg-[#f0f0f0] mb-2" />
      <div className="h-4 w-full bg-[#f5f5f5] mb-1" />
      <div className="h-4 w-2/3 bg-[#f5f5f5] mb-4" />
      <div className="h-1 w-full bg-[#f0f0f0] mb-4" />
      <div className="flex items-center justify-between pt-4 border-t border-[#f0f0f0]">
        <div className="h-3 w-24 bg-[#f5f5f5]" />
        <div className="h-3 w-16 bg-[#f5f5f5]" />
      </div>
    </div>
  );
}
