import AdminNav from '@/components/admin/AdminNav';

/**
 * Admin Layout
 * Provides the main structure for admin pages
 * Includes desktop sidebar navigation
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Navigation */}
      <AdminNav />

      {/* Main Content */}
      <main className="flex-1 overflow-auto md:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
