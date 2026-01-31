'use client';

import { useState, useRef, useEffect } from 'react';
import { Palette, Sun, Moon, Flower2, Waves, Trees, Check } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { cn } from '@/lib/utils';

const LABELS: Record<string, { label: string; icon: typeof Sun }> = {
  light: { label: 'Light', icon: Sun },
  dark: { label: 'Dark', icon: Moon },
  purple: { label: 'Purple', icon: Flower2 },
  ocean: { label: 'Ocean', icon: Waves },
  forest: { label: 'Forest', icon: Trees },
};

export function ThemeSwitcher() {
  const { theme, setTheme, themes } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center justify-center w-9 h-9 rounded-lg border border-border bg-background hover:bg-muted transition-colors"
        aria-label="Choose theme"
        aria-expanded={open}
      >
        <Palette className="w-4 h-4 text-foreground" />
      </button>
      {open && (
        <div
          className={cn(
            'absolute right-0 top-full mt-1 py-1 min-w-[140px] rounded-lg border border-border bg-popover shadow-lg',
            'animate-in fade-in-0 zoom-in-95 duration-150'
          )}
        >
          {themes.map((id) => {
            const { label, icon: Icon } = LABELS[id] ?? { label: id, icon: Sun };
            const isActive = theme === id;
            return (
              <button
                key={id}
                type="button"
                onClick={() => {
                  setTheme(id);
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2 px-3 py-2 text-left text-sm transition-colors',
                  isActive ? 'bg-muted text-foreground' : 'text-muted-foreground hover:bg-muted/70 hover:text-foreground'
                )}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {isActive && <Check className="w-4 h-4 shrink-0 text-accent" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
