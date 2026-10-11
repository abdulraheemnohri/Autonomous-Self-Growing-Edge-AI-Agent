import type {Metadata} from 'next';
import './globals.css'; // Global styles

export const metadata: Metadata = {
  title: 'LiteRT Autonomous Edge Agent',
  description: 'An offline-first autonomous AI agent powered by on-device LiteRT-LM runtime, featuring local self-learning memory, ReAct goal execution, and real-time bidirectional voice chat.',
  openGraph: {
    title: 'LiteRT Autonomous Edge Agent',
    description: 'An offline-first autonomous AI agent powered by on-device LiteRT-LM runtime, featuring local self-learning memory, ReAct goal execution, and real-time bidirectional voice chat.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LiteRT Autonomous Edge Agent',
    description: 'An offline-first autonomous AI agent powered by on-device LiteRT-LM runtime, featuring local self-learning memory, ReAct goal execution, and real-time bidirectional voice chat.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-4 focus:py-2 focus:bg-cyan-500 focus:text-slate-950 focus:rounded-lg focus:font-bold focus:text-xs"
        >
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
