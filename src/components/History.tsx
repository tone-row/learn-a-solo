import { useHistoryStore } from "@/hooks/useHistoryStore";
import { Button } from "./ui/button";
import { Clock, X } from "lucide-react";

type HistoryItemProps = {
  name: string;
  videoId: string;
  startPoint: number;
  endPoint: number;
  onSelect: (item: {
    videoId: string;
    startPoint: number;
    endPoint: number;
  }) => void;
  onDelete: (videoId: string) => void;
};

function HistoryItem({
  name,
  videoId,
  startPoint,
  endPoint,
  onSelect,
  onDelete,
}: HistoryItemProps) {
  return (
    <div
      className="grid grid-cols-[auto_1fr_auto] items-center gap-4 p-4 border-2 border-black dark:border-white hover:bg-neutral-100 dark:hover:bg-neutral-800 cursor-pointer rounded-xl"
      onClick={() => onSelect({ videoId, startPoint, endPoint })}
    >
      <Clock className="h-6 w-6" />
      <div className="grid gap-1 text-left">
        <div className="text-xl font-semibold">{name}</div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 hover:bg-neutral-200"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(videoId);
        }}
      >
        <X className="h-6 w-6" />
        <span className="sr-only">Delete history item</span>
      </Button>
    </div>
  );
}

export function History() {
  const history = useHistoryStore((state) => state.history);
  const deleteHistory = useHistoryStore((state) => state.deleteHistory);

  const handleSelect = (item: {
    videoId: string;
    startPoint: number;
    endPoint: number;
  }) => {
    // Create new url using our current url as a base
    const url = new URL(window.location.href);
    url.searchParams.set("v", item.videoId);
    url.searchParams.set("start", item.startPoint.toString());
    url.searchParams.set("end", item.endPoint.toString());
    window.location.href = url.toString();
  };

  if (history.length === 0) {
    return (
      <div className="grid gap-6 p-6 max-w-[1460px] mx-auto md:p-10">
        <h2 className="text-3xl font-bold">History</h2>
        <p className="text-xl text-neutral-500">No history yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6 p-6 max-w-[1460px] mx-auto md:p-10">
      <h2 className="text-3xl font-bold">History</h2>
      <div className="grid gap-4">
        {history.map((item) => (
          <HistoryItem
            key={`${item.videoId}-${item.startPoint}-${item.endPoint}`}
            {...item}
            onSelect={handleSelect}
            onDelete={deleteHistory}
          />
        ))}
      </div>
    </div>
  );
}
