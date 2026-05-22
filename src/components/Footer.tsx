import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-white border-t-8 border-[#FFFF00] pt-12 pb-8 px-6 font-serif">
      <div className="max-w-[1280px] mx-auto">
        {/* Newsletter Signup */}
        <div className="border-b-2 border-zinc-800 pb-10 mb-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-inter font-black uppercase tracking-tighter text-white mb-1">
                GET THE TRUTH DAILY
              </h3>
              <p className="text-gray-400 font-bold text-sm">No BS. No fluff. Just the stories that matter.</p>
            </div>
            <div className="flex w-full md:w-auto gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 md:w-72 px-4 py-3 bg-zinc-900 border-2 border-zinc-700 text-white font-bold uppercase text-sm outline-none focus:border-[#FFFF00] transition-colors placeholder-gray-500"
              />
              <button className="bg-[#FFFF00] text-black font-inter font-black uppercase px-6 py-3 border-2 border-[#FFFF00] hover:bg-black hover:text-[#FFFF00] transition-colors text-sm tracking-wider">
                SUBSCRIBE
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column Link Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {/* The Publication */}
          <div className="flex flex-col">
            <h3 className="text-[#FFFF00] font-inter font-black uppercase text-sm mb-4 tracking-widest">The Publication</h3>
            <ul className="space-y-2 font-bold text-sm">
              <li><Link href="/" className="hover:text-[#FFFF00] transition-colors">Front Page</Link></li>
              <li><Link href="/about" className="hover:text-[#FFFF00] transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-[#FFFF00] transition-colors">Contact</Link></li>
              <li><Link href="/submit-tip" className="hover:text-[#FFFF00] transition-colors">Tip Line</Link></li>
            </ul>
          </div>

          {/* Sections */}
          <div className="flex flex-col">
            <h3 className="text-[#FFFF00] font-inter font-black uppercase text-sm mb-4 tracking-widest">Sections</h3>
            <ul className="space-y-2 font-bold text-sm">
              <li><Link href="/" className="hover:text-[#FFFF00] transition-colors">Latest</Link></li>
              <li><Link href="/" className="hover:text-[#FFFF00] transition-colors">Trending</Link></li>
              <li><Link href="/" className="hover:text-[#FFFF00] transition-colors">Tech</Link></li>
              <li><Link href="/" className="hover:text-[#FFFF00] transition-colors">Politics</Link></li>
              <li><Link href="/quizzes" className="hover:text-[#FFFF00] transition-colors">Quizzes</Link></li>
            </ul>
          </div>

          {/* Legal */}
          <div className="flex flex-col">
            <h3 className="text-[#FFFF00] font-inter font-black uppercase text-sm mb-4 tracking-widest">Legal</h3>
            <ul className="space-y-2 font-bold text-sm">
              <li><Link href="/editorial-log/" className="hover:text-[#FFFF00] transition-colors">Editorial Log</Link></li>
              <li><Link href="/fact-checking/" className="hover:text-[#FFFF00] transition-colors">Fact-Checking</Link></li>
              <li><Link href="/privacy-policy" className="hover:text-[#FFFF00] transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms-of-service" className="hover:text-[#FFFF00] transition-colors">Terms of Service</Link></li>
              <li><Link href="/cookie-policy" className="hover:text-[#FFFF00] transition-colors">Cookie Policy</Link></li>
              <li><Link href="/dmca" className="hover:text-[#FFFF00] transition-colors">DMCA Policy</Link></li>
              <li><Link href="/data-request" className="hover:text-[#FFFF00] transition-colors">Data Request</Link></li>
            </ul>
          </div>

          {/* Socials */}
          <div className="flex flex-col">
            <h3 className="text-[#FFFF00] font-inter font-black uppercase text-sm mb-4 tracking-widest">Socials</h3>
            <div className="flex gap-3">
              <a href="#" className="w-10 h-10 bg-white text-black flex items-center justify-center font-inter font-black text-lg hover:bg-[#FFFF00] hover:scale-110 transition-all" aria-label="X (Twitter)">X</a>
              <a href="#" className="w-10 h-10 bg-white text-black flex items-center justify-center font-inter font-black text-lg hover:bg-[#FFFF00] hover:scale-110 transition-all" aria-label="Instagram">IG</a>
              <a href="#" className="w-10 h-10 bg-white text-black flex items-center justify-center font-inter font-black text-lg hover:bg-[#FFFF00] hover:scale-110 transition-all" aria-label="TikTok">TT</a>
            </div>
          </div>
        </div>

        {/* Trust Seals Row */}
        <div className="border-t-2 border-zinc-800 pt-6 mb-6 flex flex-wrap justify-center gap-6">
          {/* DMCA Protection Badge */}
          <a
            href="//www.dmca.com/Protection/Status.aspx?ID=YOUR_ID"
            title="DMCA.com Protection Status"
            className="dmca-badge inline-flex items-center gap-2 opacity-50 hover:opacity-80 transition-opacity"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img
              src="https://images.dmca.com/Badges/dmca_protected_sml_120n.png?ID=YOUR_ID"
              alt="DMCA.com Protection Status"
              className="h-6 w-auto grayscale"
            />
          </a>

          {/* SSL Seal */}
          <div className="inline-flex items-center gap-2 text-[10px] font-inter font-black uppercase tracking-widest text-gray-600 opacity-50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            256-BIT SSL ENCRYPTED
          </div>

          {/* Verified Operation Seal */}
          <div className="inline-flex items-center gap-2 text-[10px] font-inter font-black uppercase tracking-widest text-gray-600 opacity-50">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            TRUTHMEDIA VERIFIED | 2026
          </div>
        </div>

        {/* Bottom Row */}
        <div className="border-t-2 border-zinc-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-sm font-bold text-gray-500">
          <p>&copy; {new Date().getFullYear()} TruthWorldNews. Operated by TRUTHMEDIANETWORKS.</p>
          <p className="uppercase tracking-widest text-[#FFFF00]">Accept The Truth</p>
        </div>
      </div>
    </footer>
  );
}
