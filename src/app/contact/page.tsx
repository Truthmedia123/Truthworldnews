import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us',
  description: 'Get in touch with TruthWorldNews. Tips, DMCA, privacy, and general inquiries.',
};

export default function ContactPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 min-h-screen text-gray-200">
      <div className="border-b-8 border-white/20 pb-6 mb-12">
        <h1 className="text-6xl md:text-8xl font-inter font-black uppercase tracking-tighter text-white">Contact</h1>
      </div>

      <div className="font-serif text-xl leading-relaxed space-y-8">
        <p>
          Have a story that the mainstream media is too afraid to touch? Found a leaked document from a tech giant? Did your local politician get caught at an underground rave?
        </p>

        <p className="font-bold text-2xl text-white">
          We want to hear about it.
        </p>

        {/* Tips */}
        <div className="bg-zinc-900 text-white p-12 text-center border-8 border-[#FFFF00] shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] my-12 transform -rotate-1">
          <p className="font-inter font-black uppercase tracking-widest text-sm mb-4 text-[#FFFF00]">Secure Tip Line</p>
          <a href="mailto:tips@truthworldnews.com" className="text-3xl md:text-5xl font-inter font-black break-all hover:text-[#FFFF00] transition-colors underline decoration-[#FFFF00] decoration-4 underline-offset-8">
            tips@truthworldnews.com
          </a>
        </div>

        {/* General Contact */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-12">
          <div className="border-4 border-white/20 p-6 bg-zinc-900">
            <h3 className="font-inter font-black uppercase text-lg mb-2 text-white">General Inquiries</h3>
            <a href="mailto:contact@truthworldnews.com" className="text-[#FFFF00] font-bold hover:text-white transition-colors break-all">
              contact@truthworldnews.com
            </a>
          </div>
          <div className="border-4 border-white/20 p-6 bg-zinc-900">
            <h3 className="font-inter font-black uppercase text-lg mb-2 text-white">DMCA / Copyright</h3>
            <a href="mailto:dmca@truthworldnews.com" className="text-[#FFFF00] font-bold hover:text-white transition-colors break-all">
              dmca@truthworldnews.com
            </a>
          </div>
          <div className="border-4 border-white/20 p-6 bg-zinc-900">
            <h3 className="font-inter font-black uppercase text-lg mb-2 text-white">Privacy / Data Requests</h3>
            <a href="mailto:privacy@truthworldnews.com" className="text-[#FFFF00] font-bold hover:text-white transition-colors break-all">
              privacy@truthworldnews.com
            </a>
          </div>
          <div className="border-4 border-white/20 p-6 bg-zinc-900">
            <h3 className="font-inter font-black uppercase text-lg mb-2 text-white">Legal</h3>
            <a href="mailto:legal@truthworldnews.com" className="text-[#FFFF00] font-bold hover:text-white transition-colors break-all">
              legal@truthworldnews.com
            </a>
          </div>
        </div>

        <p className="text-gray-400 italic">
          Disclaimer: Do not send us PR pitches for your startup's new crypto wallet. We will publicly mock you.
        </p>
      </div>
    </main>
  );
}
