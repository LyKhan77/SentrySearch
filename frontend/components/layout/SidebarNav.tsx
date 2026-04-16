'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Library, Settings, History } from 'lucide-react';

function NavLink({ href, icon: Icon, children }: { href: string; icon: any; children: React.ReactNode }) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));

  return (
    <Link 
      href={href} 
      className={`flex items-center gap-3 px-4 py-2 rounded-md transition-colors text-sm font-medium ${
        isActive 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-muted text-foreground'
      }`}
    >
      <Icon className="w-4 h-4" /> {children}
    </Link>
  );
}

export function SidebarNav() {
  return (
    <aside className="w-64 border-r border-border h-screen flex flex-col p-4 bg-background">
      <div className="font-semibold text-xl mb-8 px-4 tracking-tight">SentrySearch</div>
      <nav className="flex flex-col gap-2">
        <NavLink href="/" icon={Home}>Dashboard</NavLink>
        <NavLink href="/search" icon={Search}>Search</NavLink>
        <NavLink href="/library" icon={Library}>Library</NavLink>
        <NavLink href="/history" icon={History}>History</NavLink>
      </nav>
      <div className="mt-auto">
        <NavLink href="/settings" icon={Settings}>Settings</NavLink>
      </div>
    </aside>
  );
}
