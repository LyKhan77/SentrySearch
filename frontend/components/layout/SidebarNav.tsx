import Link from 'next/link';
import { Home, Search, Library, Settings, History } from 'lucide-react';

export function SidebarNav() {
  return (
    <aside className="w-64 border-r border-border h-screen flex flex-col p-4 bg-background">
      <div className="font-semibold text-xl mb-8 px-4 tracking-tight">SentrySearch</div>
      <nav className="flex flex-col gap-2">
        <Link href="/" className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-md transition-colors text-sm font-medium">
          <Home className="w-4 h-4" /> Dashboard
        </Link>
        <Link href="/search" className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-md transition-colors text-sm font-medium">
          <Search className="w-4 h-4" /> Search
        </Link>
        <Link href="/library" className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-md transition-colors text-sm font-medium">
          <Library className="w-4 h-4" /> Library
        </Link>
        <Link href="/history" className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-md transition-colors text-sm font-medium">
          <History className="w-4 h-4" /> History
        </Link>
      </nav>
      <div className="mt-auto">
        <Link href="/settings" className="flex items-center gap-3 px-4 py-2 hover:bg-muted rounded-md transition-colors text-sm font-medium text-muted-foreground">
          <Settings className="w-4 h-4" /> Settings
        </Link>
      </div>
    </aside>
  );
}
