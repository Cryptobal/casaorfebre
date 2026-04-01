interface ReviewHighlightsProps {
  highlights: string[] | null;
  max?: number;
}

export function ReviewHighlights({ highlights, max }: ReviewHighlightsProps) {
  if (!highlights || highlights.length === 0) return null;

  const items = max ? highlights.slice(0, max) : highlights;

  return (
    <div className="flex flex-wrap gap-1.5 overflow-x-auto">
      {items.map((tag) => (
        <span
          key={tag}
          className="inline-flex items-center gap-1 whitespace-nowrap rounded-sm bg-[#f0ede8] px-2.5 py-1 text-[0.72rem] font-normal text-accent"
        >
          <span className="text-[0.6rem]">✦</span>
          {tag}
        </span>
      ))}
    </div>
  );
}
