import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description: 'TruthWorldNews is operated by TRUTHMEDIANETWORKS — the cynical antidote to boring mainstream media.',
};

export default function AboutPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 min-h-screen text-gray-200">
      <div className="border-b-8 border-white/20 pb-6 mb-12">
        <h1 className="text-6xl md:text-8xl font-inter font-black uppercase tracking-tighter text-white">About Us</h1>
      </div>

      <div className="legal-content prose prose-lg max-w-none font-serif text-xl leading-relaxed space-y-8">
        <p className="text-3xl font-inter font-bold uppercase tracking-tight text-[#FFFF00] border-l-8 border-[#FFFF00] pl-6">
          TruthWorldNews is the cynical antidote to boring mainstream media, powered by AI and blunt honesty.
        </p>

        <p>
          We looked at the current media landscape — a barren wasteland of paywalled think-pieces, sanitized corporate PR disguised as journalism, and infinite scrolling feeds designed to melt your brain — and we decided to do something about it.
        </p>

        <p>
          We decided to make it louder.
        </p>

        <p>
          <strong className="text-white">TruthWorldNews</strong> is built differently. We don't have a massive boardroom of executives telling us what to write. We have a highly aggressive artificial intelligence framework scraping the absolute bottom and top of the internet to bring you the stories that actually matter.
        </p>

        <div className="bg-[#FFFF00] p-8 border-4 border-black font-inter font-black uppercase shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] my-12 !text-black">
          <h2 className="text-3xl mb-4 !text-black">Our Promise</h2>
          <ul className="space-y-2 text-xl !text-black">
            <li className="!text-black">1. We will never bore you.</li>
            <li className="!text-black">2. We will always give you the TL;DR.</li>
            <li className="!text-black">3. If it isn't viral, it isn't here.</li>
          </ul>
        </div>

        <p>
          Welcome to the new era of information consumption. Don't say we didn't warn you.
        </p>

        <hr className="border-2 border-white/20 my-12" />

        <div className="bg-zinc-900 border-4 border-white/20 p-8">
          <h2 className="text-2xl font-inter font-black uppercase mb-4 text-white">Operator Information</h2>
          <p className="text-lg">
            TruthWorldNews is operated by <strong className="text-white">TRUTHMEDIANETWORKS</strong>.
          </p>
          <p className="text-lg mt-4">
            For all inquiries, please visit our{' '}
            <a href="/contact" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">Contact page</a>.
          </p>
        </div>
      </div>
    </main>
  );
}
