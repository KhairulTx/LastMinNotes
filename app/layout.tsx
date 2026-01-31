import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'LastMin Notes — Exam-Ready Flashcards in Minutes',
  description: 'Turn your notes into exam-ready flashcards. RM1 per generation. No sign-up. Mobile-first.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={outfit.variable} suppressHydrationWarning>
      <body className="font-sans min-h-screen">
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var t=localStorage.getItem('lastmin-theme');if(t&&['light','dark','purple','ocean','forest'].indexOf(t)>=0){document.documentElement.setAttribute('data-theme',t);}})();`,
          }}
        />
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
