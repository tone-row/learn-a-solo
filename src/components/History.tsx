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
      className="grid grid-cols-[auto_1fr_auto] items-center gap-3 h-auto py-3 border-b hover:bg-neutral-100 cursor-pointer px-4"
      onClick={() => onSelect({ videoId, startPoint, endPoint })}
    >
      <Clock className="h-4 w-4 opacity-50" />
      <div className="grid gap-1 text-left">
        <div className="font-medium">{name}</div>
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={(e) => {
          e.stopPropagation();
          onDelete(videoId);
        }}
      >
        <X className="h-4 w-4" />
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
      <div className="grid gap-4 p-4 bg-gray-50">
        <h2 className="text-lg font-medium">History</h2>
        <p className="text-neutral-500">No history yet</p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 p-4 bg-gray-50">
      <h2 className="text-lg font-medium">History</h2>
      <div className="grid">
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
