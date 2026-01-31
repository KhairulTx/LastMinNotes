import Link from 'next/link';
import { Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeSwitcher } from '@/components/ThemeSwitcher';

export function Header() {
  return (
    <header className="border-b border-border bg-background sticky top-0 z-50">
      <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2 font-semibold text-foreground transition-opacity duration-200 hover:opacity-80 shrink-0">
          <div className="w-8 h-8 rounded bg-foreground flex items-center justify-center transition-transform duration-200 hover:scale-105">
            <Zap className="w-4 h-4 text-background" />
          </div>
          LastMin Notes
        </Link>
        <div className="flex items-center gap-2">
          <ThemeSwitcher />
          <Button asChild size="default" className="bg-foreground hover:bg-foreground/90 text-background">
            <Link href="/generate">Start Now</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
