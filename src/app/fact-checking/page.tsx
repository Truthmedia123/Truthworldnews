import Link from 'next/link';

export const metadata = {
  title: 'Fact-Checking Policy | Truth World News',
  description: 'How we verify information and handle corrections.',
};

export default function FactCheckingPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <h1 className="text-4xl font-bold mb-4">Fact-Checking Policy</h1>
        <p className="text-gray-400 mb-8">Last updated: May 2026</p>

        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-bold text-red-500 mb-3">1. Source Requirements</h2>
            <p className="text-gray-300 leading-relaxed">
              Every claim in our articles must be attributed to a credible source. We require a minimum
              of two independent sources for breaking news. Single-source stories are explicitly labeled
              as &quot;RUMOR&quot; in the TL;DR section. We do not publish unsourced claims.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-red-500 mb-3">2. Source Credibility Tiers</h2>
            <ul className="space-y-2 text-gray-300">
              <li><span className="text-green-400 font-bold">Tier 1 (High):</span> BBC, Reuters, AP, NYT, WSJ, The Guardian, Nature, Science, Hacker News</li>
              <li><span className="text-yellow-400 font-bold">Tier 2 (Medium):</span> TechCrunch, The Verge, Wired, Bloomberg, Forbes, CNN</li>
              <li><span className="text-red-400 font-bold">Tier 3 (Low):</span> Twitter/X, Facebook, personal blogs, Medium, Substack — require corroboration</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-red-500 mb-3">3. Verification Process</h2>
            <ol className="list-decimal list-inside space-y-2 text-gray-300">
              <li>Scraper aggregates from 5+ sources</li>
              <li>Safety layer checks source count and credibility</li>
              <li>NewsAPI corroboration for 2nd source</li>
              <li>Human editor verifies claims against original sources</li>
              <li>Editorial log documents reviewer and timestamp</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-red-500 mb-3">4. Correction Policy</h2>
            <p className="text-gray-300 leading-relaxed">
              Errors happen. When we get something wrong, we:
            </p>
            <ol className="list-decimal list-inside space-y-2 text-gray-300 mt-2">
              <li>Update the article with a correction note at the top</li>
              <li>Document the correction in the editorial log</li>
              <li>Notify newsletter subscribers if the error was significant</li>
              <li>Never silently edit — transparency is mandatory</li>
            </ol>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-red-500 mb-3">5. AI Disclosure</h2>
            <p className="text-gray-300 leading-relaxed">
              Our articles are AI-assisted, not AI-generated. LLMs draft content based on verified sources.
              Human editors review, fact-check, and approve every article. We disclose AI involvement on
              every article page. See our <Link href="/editorial-log/" className="text-red-400 hover:underline">Editorial Log</Link> for reviewer details.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
