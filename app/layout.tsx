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
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
