import Link from 'next/link';
import { Zap, Clock, CreditCard, Target, Smartphone, Shield, Sparkles, FileText, Brain, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Badge variant="secondary" className="mb-6 font-normal text-muted-foreground transition-all duration-200 hover:bg-muted">
          <Zap className="w-3.5 h-3.5 mr-1" />
          For exam week emergencies
        </Badge>
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-foreground mb-4">
          Turn your notes into{' '}
          <span className="text-accent">flashcards</span>
          {' '}in under 2 minutes
        </h1>
        <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
          Paste your lecture notes. Get exam-ready flashcards. No signup. No subscription. Just <strong>RM1</strong> (+ small payment fee at checkout).
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild size="lg" className="bg-foreground hover:bg-foreground/90 text-background h-12 px-8">
            <Link href="/generate" className="gap-2">
              Start Revising
              <span>→</span>
            </Link>
          </Button>
          <span className="text-sm text-muted-foreground">Takes less than 60 seconds</span>
        </div>
        <div className="flex flex-wrap justify-center gap-6 mt-12 text-muted-foreground">
          <span className="flex items-center gap-2 transition-colors duration-150 hover:text-foreground">
            <Zap className="w-4 h-4" />
            Instant AI processing
          </span>
          <span className="flex items-center gap-2 transition-colors duration-150 hover:text-foreground">
            <Clock className="w-4 h-4" />
            Ready in 2 minutes
          </span>
          <span className="flex items-center gap-2 transition-colors duration-150 hover:text-foreground">
            <CreditCard className="w-4 h-4" />
            RM1 per use (~RM2 at checkout)
          </span>
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">How It Works</h2>
          <p className="text-muted-foreground text-center mb-12">From notes to flashcards in four simple steps</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: 1, icon: FileText, title: 'Paste Your Notes', desc: 'Copy your lecture notes, slides, or study material directly into the app.' },
              { num: 2, icon: Brain, title: 'AI Processes', desc: 'Our AI extracts key concepts, definitions, and exam-relevant content.' },
              { num: 3, icon: CreditCard, title: 'Pay RM1', desc: 'Quick payment via ToyyibPay (~RM2 total at checkout). No account needed.' },
              { num: 4, icon: Check, title: 'Get Flashcards', desc: 'Swipe through exam-ready flashcards optimized for quick recall.' },
            ].map(({ num, icon: Icon, title, desc }) => (
              <Card key={num} className="relative overflow-visible transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <div className="absolute -top-3 -left-3 w-6 h-6 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold">
                  {num}
                </div>
                <CardContent className="pt-8 pb-6 px-6">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4 mx-auto">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Built for Last-Minute Revision */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">Built for Last-Minute Revision</h2>
          <p className="text-muted-foreground text-center mb-12">Not another learning platform. A fast, focused tool for exam week.</p>
          <div className="grid sm:grid-cols-2 gap-6">
            {[
              { icon: Target, title: 'Exam-Focused', desc: 'AI trained to extract only what matters for your exams - definitions, key concepts, and important processes.' },
              { icon: Smartphone, title: 'Mobile-First', desc: 'Designed for on-the-go revision. Swipe through flashcards anywhere - in the library, on the bus, or before entering the exam hall.' },
              { icon: Shield, title: 'No Data Stored', desc: 'Your notes are processed and discarded. No accounts, no tracking, no data retention. Privacy by design.' },
              { icon: Sparkles, title: 'One Concept, One Card', desc: 'Each flashcard contains exactly one idea. Optimized for memory recall, not information overload.' },
            ].map(({ icon: Icon, title, desc }) => (
              <Card key={title} className="transition-all duration-200 hover:shadow-md hover:-translate-y-0.5">
                <CardContent className="pt-6 pb-6 px-6">
                  <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
                    <Icon className="w-6 h-6 text-foreground" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Simple Pricing */}
      <section className="bg-muted/50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-foreground mb-2">Simple Pricing</h2>
          <p className="text-muted-foreground text-center mb-12">Pay only when you need it. No commitments.</p>
          <Card className="max-w-md mx-auto overflow-hidden transition-all duration-200 hover:shadow-lg">
            <div className="bg-muted/80 px-6 py-8 text-center">
              <span className="text-muted-foreground text-sm">RM</span>
              <span className="text-4xl font-bold text-foreground ml-1">1</span>
              <p className="text-sm text-muted-foreground mt-1">per generation</p>
              <p className="text-xs text-muted-foreground mt-0.5">~RM2 at checkout (RM1 + payment fee)</p>
            </div>
            <CardContent className="pt-6 pb-6 px-6">
              <ul className="space-y-3 mb-6">
                {[
                  'Unlimited text input',
                  'AI-powered extraction',
                  'Exam-optimized flashcards',
                  'Mobile swipe viewer',
                  'PDF export option',
                  'No account required',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-sm">
                    <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <Check className="w-3 h-3 text-green-600" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
              <Button asChild className="w-full bg-foreground hover:bg-foreground/90 text-background h-12">
                <Link href="/generate">Generate Flashcards</Link>
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">Secure payment via ToyyibPay.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      <Footer />
    </main>
  );
}
