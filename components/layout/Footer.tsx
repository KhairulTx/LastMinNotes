import Link from 'next/link';
import { Zap } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-background mt-auto">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <Link href="/" className="flex items-center gap-2 font-semibold text-foreground w-fit transition-opacity duration-200 hover:opacity-80">
            <div className="w-8 h-8 rounded bg-foreground flex items-center justify-center transition-transform duration-200 hover:scale-105">
              <Zap className="w-4 h-4 text-background" />
            </div>
            LastMin Notes
          </Link>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/privacy" className="hover:text-foreground transition-colors duration-150">Privacy</Link>
            <Link href="/terms" className="hover:text-foreground transition-colors duration-150">Terms</Link>
            <Link href="/contact" className="hover:text-foreground transition-colors duration-150">Contact</Link>
          </div>
          <span className="text-sm text-muted-foreground">© 2026 by KhairulTX</span>
        </div>
        <p className="text-sm text-muted-foreground text-center sm:text-left max-w-2xl">
          LastMin Notes is designed for revision support only. We do not generate leaked exam content or encourage academic dishonesty.
        </p>
      </div>
    </footer>
  );
}
