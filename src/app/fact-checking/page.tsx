import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Fact-Checking Policy | Truth World News',
  description: 'How we verify information and handle corrections.',
};

export default function FactCheckingPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 min-h-screen text-gray-200">
      <div className="border-b-8 border-white/20 pb-6 mb-12">
        <h1 className="text-6xl md:text-8xl font-inter font-black uppercase tracking-tighter text-white">Fact Checking</h1>
      </div>

      <div className="legal-content prose prose-lg max-w-none font-serif text-xl leading-relaxed space-y-8">
        <p className="text-3xl font-inter font-bold uppercase tracking-tight text-[#FFFF00] border-l-8 border-[#FFFF00] pl-6">
          Every claim must be attributed. We demand evidence because we know you do too.
        </p>

        <p className="text-gray-400 font-inter font-bold">Last updated: May 2026</p>

        <div className="bg-[#FFFF00] p-8 border-4 border-black font-inter font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12 !text-black">
          <h2 className="text-3xl mb-4 !text-black">1. Source Requirements</h2>
          <p className="text-xl !text-black font-serif normal-case font-bold">
            Every claim in our articles must be attributed to a credible source. We require a minimum
            of two independent sources for breaking news. Single-source stories are explicitly labeled
            as &quot;RUMOR&quot; in the TL;DR section. We do not publish unsourced claims.
          </p>
        </div>

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mt-12 mb-6">2. Source Credibility Tiers</h2>
        <ul className="space-y-4">
          <li className="p-4 border-l-4 border-green-500 bg-zinc-900">
            <strong className="text-green-400 font-inter font-black uppercase text-xl block mb-2">Tier 1 (High)</strong>
            BBC, Reuters, AP, NYT, WSJ, The Guardian, Nature, Science, Hacker News
          </li>
          <li className="p-4 border-l-4 border-yellow-500 bg-zinc-900">
            <strong className="text-yellow-400 font-inter font-black uppercase text-xl block mb-2">Tier 2 (Medium)</strong>
            TechCrunch, The Verge, Wired, Bloomberg, Forbes, CNN
          </li>
          <li className="p-4 border-l-4 border-red-500 bg-zinc-900">
            <strong className="text-red-400 font-inter font-black uppercase text-xl block mb-2">Tier 3 (Low)</strong>
            Twitter/X, Facebook, personal blogs, Medium, Substack — require corroboration
          </li>
        </ul>

        <hr className="border-2 border-white/20 my-12" />

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mb-6">3. Verification Process</h2>
        <div className="bg-zinc-900 border-4 border-white/20 p-8 space-y-4">
          <div className="flex items-start gap-4">
            <span className="bg-[#FFFF00] text-black font-black w-8 h-8 flex items-center justify-center shrink-0">1</span>
            <p className="pt-1">Scraper aggregates from 5+ sources</p>
          </div>
          <div className="flex items-start gap-4">
            <span className="bg-[#FFFF00] text-black font-black w-8 h-8 flex items-center justify-center shrink-0">2</span>
            <p className="pt-1">Safety layer checks source count and credibility</p>
          </div>
          <div className="flex items-start gap-4">
            <span className="bg-[#FFFF00] text-black font-black w-8 h-8 flex items-center justify-center shrink-0">3</span>
            <p className="pt-1">NewsAPI corroboration for 2nd source</p>
          </div>
          <div className="flex items-start gap-4">
            <span className="bg-[#FFFF00] text-black font-black w-8 h-8 flex items-center justify-center shrink-0">4</span>
            <p className="pt-1">Human editor verifies claims against original sources</p>
          </div>
        </div>

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mt-12 mb-6">4. Correction Policy</h2>
        <p>Errors happen. When we get something wrong, we:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
          <li>Update the article with a correction note at the top</li>
          <li>Document the correction internally</li>
          <li>Notify newsletter subscribers if the error was significant</li>
          <li>Never silently edit — transparency is mandatory</li>
        </ul>

        <div className="mt-12 p-6 border-2 border-white/20 bg-zinc-900">
          <h2 className="text-2xl font-inter font-black uppercase text-white mb-4">5. AI Disclosure</h2>
          <p className="text-gray-300">
            Our articles are AI-assisted, not AI-generated. LLMs draft content based on verified sources.
            Human editors review, fact-check, and approve every article. We disclose AI involvement on
            every article page.
          </p>
        </div>
      </div>
    </main>
  );
}
