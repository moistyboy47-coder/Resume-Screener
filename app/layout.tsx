import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'AI Resume Screener MVP',
  description: 'Batch evaluate candidate resumes against job postings using Gemini 2.5 Flash and Vercel AI SDK',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen font-sans antialiased text-gray-900">
        <header className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
            <h1 className="text-xl font-bold text-indigo-600">AI Resume Screener</h1>
            <span className="text-xs bg-indigo-100 text-indigo-800 font-medium px-2.5 py-0.5 rounded-full">
              Gemini 2.5 Flash
            </span>
          </div>
        </header>
        <main className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          {children}
        </main>
      </body>
    </html>
  );
}
