import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-slate-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-slate-900 mb-6">
            LineaBlu Legal Value Score™
          </h1>
          <p className="text-xl text-slate-600 mb-8">
            Discover how much value is waiting to be unlocked in your legal function. Most businesses find €200K-€500K in untapped opportunities.
          </p>
          <Link
            href="/assessment"
            className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 rounded-lg transition-colors shadow-lg"
          >
            Calculate Your Value Potential
          </Link>
          <p className="text-sm text-slate-500 mt-4">
            8 questions • 5 minutes • Instant results
          </p>
        </div>
      </div>
    </main>
  );
}
