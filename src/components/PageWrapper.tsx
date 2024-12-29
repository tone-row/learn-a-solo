export function PageWrapper({ children }: { children: React.ReactNode }) {
  return <div className="h-full w-screen overflow-auto">{children}</div>;
}
