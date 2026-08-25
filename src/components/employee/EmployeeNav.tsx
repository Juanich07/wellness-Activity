'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Dumbbell,
  TrendingUp,
  BookOpen,
  Trophy,
  MessageSquare,
  Menu,
  X,
  LogOut,
} from 'lucide-react';
import Button from '@/components/common/Button';

/**
 * EmployeeNav Component
 * Provides both mobile bottom navigation and desktop sidebar navigation
 * Mobile-first responsive design with Lucide icons
 */
export default function EmployeeNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', Icon: LayoutDashboard },
    { label: 'Activities', href: '/activities', Icon: Dumbbell },
    { label: 'Education', href: '/education', Icon: BookOpen },
    { label: 'Progress', href: '/progress', Icon: TrendingUp },
    { label: 'Challenges', href: '/challenges', Icon: Trophy },
    { label: 'Feedback', href: '/feedback', Icon: MessageSquare },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogout = async () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    router.push('/login');
  };

  return (
    <>
      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-200 bg-white md:hidden">
        <div className="flex justify-around">
          {navItems.slice(0, 4).map((item) => {
            const Icon = item.Icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center justify-center gap-1 border-t-2 px-2 py-3 text-xs font-medium transition-colors ${
                  isActive(item.href)
                    ? 'border-teal-600 text-teal-600'
                    : 'border-transparent text-slate-600 hover:text-slate-900'
                }`}
                aria-label={item.label}
              >
                <Icon className="h-6 w-6" strokeWidth={1.5} />
                <span className="text-center">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:z-40 md:block md:h-screen md:w-64 md:overflow-auto md:bg-slate-900 md:pt-20">
        <nav className="space-y-1 px-4">
          {navItems.map((item) => {
            const Icon = item.Icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                  isActive(item.href)
                    ? 'bg-teal-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={1.5} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-700 p-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full border-red-300 text-red-400 hover:bg-red-950"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900">Wellness App</h1>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-lg p-2 hover:bg-slate-100"
            aria-label="Toggle menu"
          >
            {sidebarOpen ? (
              <X className="h-6 w-6" strokeWidth={1.8} />
            ) : (
              <Menu className="h-6 w-6" strokeWidth={1.8} />
            )}
          </button>
        </div>

        {/* Mobile Sidebar Menu */}
        {sidebarOpen && (
          <div className="border-t border-slate-200 px-4 py-3">
            <div className="space-y-2">
              {navItems.map((item) => {
                const Icon = item.Icon;

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                      isActive(item.href)
                        ? 'bg-teal-600 text-white'
                        : 'text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="mr-2 h-4 w-4" strokeWidth={1.8} />
                    {item.label}
                  </Link>
                );
              })}

              <hr className="my-2 border-slate-200" />
              <button
                onClick={() => {
                  setSidebarOpen(false);
                  handleLogout();
                }}
                className="flex w-full items-center rounded-lg px-3 py-2 text-left text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </button>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
