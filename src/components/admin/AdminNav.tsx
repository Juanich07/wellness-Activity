'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  UserCog,
  Target,
  BookOpen,
  Goal,
  TrendingUp,
  MessageSquare,
  LogOut,
  Building2,
  Menu,
  X,
} from 'lucide-react';
import Button from '@/components/common/Button';

/**
 * AdminNav Component
 * Desktop-first navigation for admin dashboard with Lucide icons
 * Includes role indicator and analytics header
 */
export default function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const adminNavItems = [
    { label: 'Dashboard', href: '/admin/dashboard', Icon: LayoutDashboard },
    { label: 'Users', href: '/admin/users', Icon: UserCog },
    { label: 'Participation', href: '/admin/participation', Icon: Users },
    { label: 'Activities', href: '/admin/activities', Icon: Target },
    { label: 'Education', href: '/admin/education', Icon: BookOpen },
    { label: 'Progress', href: '/admin/progress', Icon: Goal },
    { label: 'Reports', href: '/admin/reports', Icon: TrendingUp },
    { label: 'Feedback', href: '/admin/feedback', Icon: MessageSquare },
  ];

  const isActive = (href: string) => pathname === href;

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = async () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    document.cookie = 'role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    setMobileMenuOpen(false);
    router.push('/admin/login');
  };

  const navContent = (
    <>
      <div className="border-b border-slate-700 px-6 py-6">
        <h1 className="flex items-center gap-2 text-xl font-bold">
          <Building2 className="h-6 w-6 text-teal-400" />
          Admin Panel
        </h1>
        <p className="mt-2 text-xs text-slate-400">Employee Wellness</p>
      </div>

      <nav className="space-y-1 px-3 py-6">
        {adminNavItems.map((item) => {
          const IconComponent = item.Icon;
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
              <IconComponent className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="absolute bottom-0 left-0 right-0 border-t border-slate-700 p-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="flex w-full items-center justify-center gap-2 border-red-300 text-red-400 hover:bg-red-950"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 bg-slate-900 text-white md:block">
        {navContent}
      </aside>

      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white md:hidden">
        <div className="flex items-center justify-between px-4 py-4">
          <h1 className="text-lg font-bold text-slate-900">Admin Panel</h1>
          <button
            type="button"
            onClick={() => setMobileMenuOpen((value) => !value)}
            className="rounded-lg p-2 text-slate-700 hover:bg-slate-100"
            aria-label="Toggle admin menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </header>

      {mobileMenuOpen ? (
        <div className="fixed inset-0 z-40 md:hidden">
          <button
            type="button"
            aria-label="Close admin menu"
            className="absolute inset-0 bg-slate-950/50"
            onClick={() => setMobileMenuOpen(false)}
          />

          <aside className="absolute left-0 top-0 h-full w-72 bg-slate-900 text-white shadow-2xl">
            {navContent}
          </aside>
        </div>
      ) : null}
    </>
  );
}
