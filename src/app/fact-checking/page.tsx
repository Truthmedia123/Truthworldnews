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
          At TruthWorldNews, we fact-check claims because we believe people deserve accurate information.
        </p>
        
        <p>
          Misinformation spreads quickly, and we want to do our part in slowing it down.
          This page explains how we work — not in complicated terms, but in plain language.
        </p>

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mt-12 mb-6">Why We Do Fact Checks</h2>
        <p>
          We don&apos;t fact-check everything. We focus on claims that matter — ones that are widely shared, made by public figures, or have the potential to mislead people on important issues like health, economy, politics, or governance.
        </p>
        <p>
          We don&apos;t do this to &quot;win&quot; arguments or push any agenda. Our only goal is to separate what&apos;s supported by evidence from what isn&apos;t.
        </p>

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mt-12 mb-6">How We Choose What to Check</h2>
        <p>We usually pick claims that meet at least one of these conditions:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
          <li>The claim is being shared widely on social media or in the news.</li>
          <li>It comes from someone in a position of influence (politicians, officials, celebrities, or major media).</li>
          <li>It could affect how people think or act on important matters.</li>
        </ul>
        <p>
          We generally avoid checking pure opinions, satire, or vague statements that can&apos;t be clearly verified.
        </p>

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mt-12 mb-6">Our Fact-Checking Process</h2>
        <p>When we decide to check a claim, here&apos;s what we usually do:</p>
        <div className="bg-zinc-900 border-4 border-white/20 p-8 space-y-6">
          <div>
            <strong className="text-xl text-[#FFFF00] font-inter uppercase block">Understand the exact claim</strong>
            <p>We first make sure we know precisely what&apos;s being said and in what context.</p>
          </div>
          <div>
            <strong className="text-xl text-[#FFFF00] font-inter uppercase block">Look for evidence</strong>
            <p>We go to the original source whenever possible — government data, official reports, research papers, court documents, or direct statements from the people involved.</p>
          </div>
          <div>
            <strong className="text-xl text-[#FFFF00] font-inter uppercase block">Cross-check from multiple angles</strong>
            <p>We don&apos;t rely on just one source. We try to verify the information from different reliable places.</p>
          </div>
          <div>
            <strong className="text-xl text-[#FFFF00] font-inter uppercase block">Talk to experts (if needed)</strong>
            <p>For complex topics, we reach out to people who actually work in that field to understand the issue better.</p>
          </div>
          <div>
            <strong className="text-xl text-[#FFFF00] font-inter uppercase block">Give a clear verdict</strong>
            <p>Based on the evidence, we assign a rating (explained below).</p>
          </div>
          <div>
            <strong className="text-xl text-[#FFFF00] font-inter uppercase block">Explain our reasoning</strong>
            <p>We write the fact check in a way that&apos;s easy to understand, and we always share the sources we used.</p>
          </div>
        </div>

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mt-12 mb-6">How We Rate Claims</h2>
        <p>We use these ratings:</p>
        <ul className="space-y-4">
          <li className="p-4 border-l-4 border-green-500 bg-zinc-900">
            <strong className="text-green-400 font-inter font-black uppercase text-xl block mb-2">True</strong>
            The claim is accurate and well supported by evidence.
          </li>
          <li className="p-4 border-l-4 border-yellow-500 bg-zinc-900">
            <strong className="text-yellow-400 font-inter font-black uppercase text-xl block mb-2">Mostly True</strong>
            The main point is correct, but some important details or context are missing.
          </li>
          <li className="p-4 border-l-4 border-orange-500 bg-zinc-900">
            <strong className="text-orange-400 font-inter font-black uppercase text-xl block mb-2">Misleading</strong>
            The claim uses facts selectively or leaves out crucial information that changes the picture.
          </li>
          <li className="p-4 border-l-4 border-red-500 bg-zinc-900">
            <strong className="text-red-400 font-inter font-black uppercase text-xl block mb-2">False</strong>
            The claim is not supported by evidence or is clearly wrong.
          </li>
          <li className="p-4 border-l-4 border-gray-500 bg-zinc-900">
            <strong className="text-gray-400 font-inter font-black uppercase text-xl block mb-2">Unverifiable</strong>
            We couldn&apos;t find enough reliable information to reach a conclusion.
          </li>
        </ul>

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mt-12 mb-6">Our Approach to Sources</h2>
        <p>
          We give more weight to primary sources — things like official government data, peer-reviewed research, and original documents.
        </p>
        <p>
          We&apos;re more cautious with single news reports or social media posts. Whenever possible, we try to go back to the original data instead of relying on someone else&apos;s interpretation.
        </p>

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mt-12 mb-6">Corrections & Updates</h2>
        <p>
          We&apos;re not perfect. If we make a mistake or new evidence comes to light, we correct the article and clearly mention what was changed and when.
        </p>
        <p>
          Significant corrections are noted at the top of the page so readers can see them easily.
        </p>

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mt-12 mb-6">We&apos;re Independent</h2>
        <div className="bg-[#FFFF00] p-8 border-4 border-black font-inter font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12 !text-black">
          <p className="text-xl !text-black font-serif normal-case font-bold">
            TruthWorldNews is currently self-funded. We don&apos;t take money from political parties, governments, or corporations that could influence our work. Our fact-checking decisions are based only on evidence, not on who benefits or loses from the result.
          </p>
        </div>

        <h2 className="text-4xl font-inter font-black uppercase tracking-tight text-white mt-12 mb-6">What We Can&apos;t Do</h2>
        <p>We want to be honest about our limits:</p>
        <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
          <li>We can&apos;t check every claim that&apos;s circulating.</li>
          <li>We&apos;re not a substitute for scientific research or legal investigations.</li>
          <li>Our conclusions are based on the best information available at the time of publishing.</li>
          <li>Sometimes new evidence can change our understanding, and we&apos;re open to updating our work when that happens.</li>
        </ul>

        <div className="mt-12 p-6 border-2 border-white/20 bg-zinc-900">
          <h2 className="text-2xl font-inter font-black uppercase text-white mb-4">Have Feedback or Found an Error?</h2>
          <p className="text-gray-300">
            We genuinely appreciate it when readers point out mistakes or suggest claims worth checking.
            <br />
            You can reach us at: <a href="mailto:factcheck@truthworldnews.com" className="text-[#FFFF00] hover:underline">factcheck@truthworldnews.com</a>
            <br />
            We read every message.
          </p>
        </div>
      </div>
    </main>
  );
}
