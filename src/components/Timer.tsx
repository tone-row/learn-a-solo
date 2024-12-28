import { useRef, useEffect } from "react";
import { useTimingStore } from "../hooks/useTimingStore";

export function Timer() {
  // Get initial time
  const timeRef = useRef(useTimingStore.getState().currentTime);

  useEffect(() => {
    // Subscribe to time updates
    const unsubscribe = useTimingStore.subscribe((state) => {
      timeRef.current = state.currentTime;
      // Directly update the DOM element
      const timerElement = document.getElementById("timer");
      if (timerElement) {
        // Format time as MM:SS
        const minutes = Math.floor(timeRef.current / 60);
        const seconds = Math.floor(timeRef.current % 60);
        timerElement.textContent = `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  return (
    <div id="timer" className="text-2xl font-bold">
      00:00
    </div>
  );
}
