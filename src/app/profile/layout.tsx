export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-muted/40">
      <main className="container p-6">{children}</main>
    </div>
  );
}

