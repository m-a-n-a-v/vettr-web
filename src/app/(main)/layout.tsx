import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Navigation } from '@/components/Navigation';

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-primary">
        <Navigation />
        {/* Main content area - offset for desktop sidebar and mobile bottom bar */}
        <main className="md:ml-64 pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </ProtectedRoute>
  );
}
