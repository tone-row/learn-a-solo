import { useHistoryStore } from "@/hooks/useHistoryStore";
import { Button } from "./ui/button";
import { Clock } from "lucide-react";
import { useRouter } from "next/navigation";

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
};

function HistoryItem({
  name,
  videoId,
  startPoint,
  endPoint,
  onSelect,
}: HistoryItemProps) {
  return (
    <Button
      variant="ghost"
      className="w-full grid grid-cols-[auto_1fr] items-center gap-3 h-auto p-4"
      onClick={() => onSelect({ videoId, startPoint, endPoint })}
    >
      <Clock className="h-4 w-4 opacity-50" />
      <div className="grid gap-1 text-left">
        <div className="font-medium">{name}</div>
        <div className="text-xs text-neutral-500">
          Loop: {startPoint.toFixed(1)}% - {endPoint.toFixed(1)}%
        </div>
      </div>
    </Button>
  );
}

export function History() {
  const history = useHistoryStore((state) => state.history);
  const router = useRouter();

  const handleSelect = (item: {
    videoId: string;
    startPoint: number;
    endPoint: number;
  }) => {
    // Reset any existing state and load the new video
    router.push(
      `/?v=${item.videoId}&start=${item.startPoint}&end=${item.endPoint}`,
    );
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
      <div className="grid gap-2">
        {history.map((item) => (
          <HistoryItem
            key={`${item.videoId}-${item.startPoint}-${item.endPoint}`}
            {...item}
            onSelect={handleSelect}
          />
        ))}
      </div>
    </div>
  );
}
