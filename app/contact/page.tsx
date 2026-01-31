import Link from 'next/link';
import { Mail, MessageCircle } from 'lucide-react';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function ContactPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">← Back</Link>
        <h1 className="text-2xl font-bold text-foreground mb-2">Contact</h1>
        <p className="text-muted-foreground mb-8">
          Have a question, feedback, or need help? Get in touch.
        </p>

        <div className="space-y-6">
          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <Mail className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-1">Email</h2>
                <p className="text-sm text-muted-foreground mb-2">
                  For support, refunds, or general enquiries.
                </p>
                <a
                  href="mailto:support@lastminnotes.com"
                  className="text-sm text-accent hover:underline"
                >
                  khairultxart@gmail.com
                </a>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                <MessageCircle className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <h2 className="font-semibold text-foreground mb-1">Response time</h2>
                <p className="text-sm text-muted-foreground">
                  We aim to reply within 1–2 business days. For payment or access issues, include your session or payment reference if you have one.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
