import EmployeeNav from '@/components/employee/EmployeeNav';

/**
 * Employee Layout
 * Provides the main structure for all employee pages
 * Includes responsive navigation (mobile bottom nav + desktop sidebar)
 */
export default function EmployeeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen flex-col md:flex-row">
      {/* Navigation */}
      <EmployeeNav />

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20 md:ml-64 md:pb-0">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-6 md:py-8">
          {children}
        </div>
      </main>
    </div>
  );
}
