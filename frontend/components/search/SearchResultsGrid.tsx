import { ClipCard, type Clip } from "@/components/video/ClipCard";

export function SearchResultsGrid({ results }: { results: Clip[] }) {
  if (!results.length) {
    return (
      <div className="col-span-full h-64 flex flex-col items-center justify-center text-muted-foreground border border-dashed rounded-xl">
        <p>No results found.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {results.map((result) => (
        <ClipCard key={result.id} clip={result} />
      ))}
    </div>
  );
}
