/** Force /unlock to be dynamic so useSearchParams works during build. */
export const dynamic = 'force-dynamic';

export default function UnlockLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
