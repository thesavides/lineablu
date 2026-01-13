import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            LineaBlu Legal Impact Score™
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Assess your legal function's operational maturity and strategic impact in 8 questions
          </p>
          <Link
            href="/assessment"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors"
          >
            Start Assessment
          </Link>
        </div>
      </div>
    </main>
  );
}
