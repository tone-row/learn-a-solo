"use client";

import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";

import { cn } from "@/lib/utils";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
    onThumbDragStart?: (index: number) => void;
    onThumbDragEnd?: (index: number) => void;
  }
>(({ className, onThumbDragStart, onThumbDragEnd, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-2 w-full grow overflow-hidden rounded-full bg-gradient-to-b from-neutral-100 to-neutral-200 dark:bg-neutral-800">
      <SliderPrimitive.Range className="absolute h-full bg-neutral-900 dark:bg-neutral-50" />
    </SliderPrimitive.Track>
    {props.value?.map((_, index) => (
      <SliderPrimitive.Thumb
        key={index}
        className="block h-5 w-5 rounded-full border-2 border-neutral-900 bg-white ring-offset-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:border-neutral-50 dark:bg-neutral-950 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300"
        onDragStart={() => onThumbDragStart?.(index)}
        onDragEnd={() => onThumbDragEnd?.(index)}
      />
    ))}
  </SliderPrimitive.Root>
));
Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
