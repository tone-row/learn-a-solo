import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-yellow-400 flex flex-col items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-semibold mb-4">404</h1>
        <h2 className="text-2xl font-semibold mb-8">Page Not Found</h2>
        <p className="text-lg mb-8">
          Oops! The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Button asChild>
          <Link href="/">Go Back Home</Link>
        </Button>
      </div>
    </div>
  );
}
