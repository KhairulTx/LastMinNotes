import Link from 'next/link';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 max-w-2xl mx-auto px-4 py-12 w-full">
        <Link href="/" className="text-sm text-muted-foreground hover:text-foreground mb-6 inline-block">← Back</Link>
        <h1 className="text-2xl font-bold text-foreground mb-2">Privacy Policy</h1>
        <p className="text-sm text-muted-foreground mb-8">Last updated: 2026</p>

        <div className="prose prose-sm text-foreground space-y-6">
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">What we collect</h2>
            <p className="text-muted-foreground">
              When you use LastMin Notes, we process the notes you paste or upload only to generate flashcards. We do not store your notes permanently. Payment is handled by ToyyibPay; we do not store your card or banking details.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">How we use it</h2>
            <p className="text-muted-foreground">
              Your notes are sent to our AI provider (OpenAI) solely to create your flashcards. Session data (e.g. pending notes, payment status) is kept temporarily in memory and is not used for marketing or shared with third parties.
            </p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-2">Your rights</h2>
            <p className="text-muted-foreground">
              You are not required to create an account. You can use the service without signing up. If you have questions about your data, contact us using the details on the Contact page.
            </p>
          </section>
        </div>
      </div>
      <Footer />
    </main>
  );
}
