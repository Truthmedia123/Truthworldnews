import BreakingNewsTicker from '@/components/BreakingNewsTicker';
import Link from 'next/link';
import { Flame, Play, ArrowRight } from 'lucide-react';

export default async function Home() {
  const dummyHeadlines = [
    "TECH CEO CLAIMS AI CAN NOW READ MINDS",
    "NEW MARS ROVER FINDS UNEXPLAINED ARTIFACTS",
    "STOCK MARKET CRASHES AS MEMECOIN REACHES $1 TRILLION MARKET CAP",
    "SCIENTISTS WARN OF INCOMING SOLAR STORM",
    "LOCAL MAN DISCOVERS SECRET TO IMMORTALITY IN HIS GARAGE"
  ];

  // ── Viral Feed Data ──────────────────────────────────────────────
  const mainViral = {
    id: "mock-1",
    category: "AI",
    title: "AGI IN 2026? EX-OPENAI RESEARCHER LEAKS INTERNAL TIMELINE THAT CHANGES EVERYTHING",
    image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80",
    author_name: "Zane Edge",
    author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80",
  };

  const secondaryViral = [
    { id: "mock-2", category: "UK POLITICS", title: "PRIME MINISTER SPOTTED AT UNDERGROUND RAVE WHILE PARLIAMENT DEBATES ECONOMY", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=400&q=80", time: "2 hrs ago" },
    { id: "mock-3", category: "TECH", title: "NEW SILICON CHIP USES HUMAN BRAIN CELLS – IS THIS THE END?", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=400&q=80", time: "4 hrs ago" },
    { id: "mock-5", category: "AI", title: "YOU'RE USING CHATGPT WRONG: 5 PROMPTS THAT WILL DO YOUR ENTIRE JOB", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=400&q=80", time: "6 hrs ago" },
  ];

  const tertiaryViral = [
    { id: "mock-4", category: "UK POLITICS", title: "LONDON POLICE REPLACING PATROL OFFICERS WITH DRONES NEXT MONTH", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80" },
    { id: "mock-6", category: "TECH", title: "THE METAVERSE ISN'T DEAD: ZUCKERBERG'S SECRET PROJECT REVEALED", image: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&w=400&q=80" },
    { id: "mock-7", category: "WORLD", title: "SCIENTISTS DISCOVER NEW OCEAN CURRENT THAT COULD CHANGE GLOBAL WEATHER", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80" },
    { id: "mock-8", category: "AI", title: "GOOGLE'S SECRET AI LAB BUILDS ROBOT THAT CAN ARGUE BETTER THAN LAWYERS", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80" },
  ];

  // ── Tech Section ──────────────────────────────────────────────────
  const techTop = { id: "mock-3", category: "TECH", title: "NEW SILICON CHIP USES HUMAN BRAIN CELLS – IS THIS THE END OF TRADITIONAL COMPUTING?", image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80", author_name: "Leo Vault", author_avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80" };
  const techGrid = [
    { id: "mock-6", category: "TECH", title: "THE METAVERSE ISN'T DEAD: ZUCKERBERG'S SECRET BILLION-DOLLAR PROJECT REVEALED", image: "https://images.unsplash.com/photo-1614729939124-032f0b56c9ce?auto=format&fit=crop&w=400&q=80", time: "5 hrs ago" },
    { id: "mock-9", category: "TECH", title: "APPLE'S NEW VR HEADSET ACCIDENTALLY REVEALED IN LEAKED MEMO", image: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=400&q=80", time: "8 hrs ago" },
    { id: "mock-10", category: "TECH", title: "QUANTUM COMPUTING BREAKTHROUGH: STARTUP CLAIMS 1000-QUBIT CHIP", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=400&q=80", time: "12 hrs ago" },
    { id: "mock-11", category: "TECH", title: "TESLA'S HUMANOID ROBOT NOW SERVING COFFEE IN SAN FRANCISCO CAFES", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=400&q=80", time: "1 day ago" },
  ];

  // ── Politics Section ──────────────────────────────────────────────
  const politicsTop = { id: "mock-2", category: "UK POLITICS", title: "PRIME MINISTER SPOTTED AT UNDERGROUND RAVE WHILE PARLIAMENT DEBATES ECONOMY", image: "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80", author_name: "Mia Fench", author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80" };
  const politicsGrid = [
    { id: "mock-4", category: "UK POLITICS", title: "LONDON POLICE REPLACING PATROL OFFICERS WITH DRONES NEXT MONTH", image: "https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=400&q=80", time: "3 hrs ago" },
    { id: "mock-12", category: "UK POLITICS", title: "NEW BILL PROPOSES MANDATORY AI ETHICS TRAINING FOR ALL MPS", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=400&q=80", time: "7 hrs ago" },
    { id: "mock-13", category: "WORLD", title: "UN SECRETARY GENERAL WARNS OF 'DIGITAL COLD WAR' BETWEEN NATIONS", image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=400&q=80", time: "10 hrs ago" },
    { id: "mock-14", category: "UK POLITICS", title: "LEAKED DOCUMENTS REVEAL GOVERNMENT'S SECRET AI SURVEILLANCE PROGRAM", image: "https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=400&q=80", time: "14 hrs ago" },
  ];

  // ── Quizzes & Entertainment ───────────────────────────────────────
  const quizFeatured = { id: "quiz-1", category: "QUIZ", title: "CAN YOU SPOT THE AI-GENERATED HEADLINE? TAKE THE VIRAL QUIZ", image: "https://images.unsplash.com/photo-1516110833967-0b5716ca1387?auto=format&fit=crop&w=600&q=80" };
  const quizGrid = [
    { id: "quiz-2", category: "QUIZ", title: "WHICH TECH BILLIONAIRE ARE YOU? (HINT: NONE OF THEM ARE GOOD)", image: "https://images.unsplash.com/photo-1553484771-371a605b060b?auto=format&fit=crop&w=400&q=80" },
    { id: "mock-15", category: "ENTERTAINMENT", title: "NETFLIX'S AI-WRITTEN SHOW BECOMES MOST-WATCHED SERIES GLOBALLY", image: "https://images.unsplash.com/photo-1522869635100-9f4c5c86aa37?auto=format&fit=crop&w=400&q=80" },
    { id: "quiz-3", category: "QUIZ", title: "FAKE NEWS OR REAL? THE ULTIMATE 2026 BS DETECTOR TEST", image: "https://images.unsplash.com/photo-1504711434969-e33886168d6c?auto=format&fit=crop&w=400&q=80" },
    { id: "mock-16", category: "ENTERTAINMENT", title: "TIKTOK STAR EXPOSED: ENTIRE PERSONA WAS AI-GENERATED DEEPFAKE", image: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&w=400&q=80" },
    { id: "mock-17", category: "ENTERTAINMENT", title: "HOLLYWOOD WRITERS REPLACED BY CHATGPT — AUDIENCES DON'T NOTICE", image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=400&q=80" },
    { id: "quiz-4", category: "QUIZ", title: "ARE YOU SMARTER THAN AN AI? THE BENCHMARK TEST", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80" },
  ];

  // ── More Latest News ──────────────────────────────────────────────
  const latestNews = [
    { id: "mock-18", category: "AI", title: "CHATGPT-6 LEAKED: IT CAN NOW NEGOTIATE YOUR SALARY BETTER THAN YOU", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=600&q=80", author_name: "Zane Edge", author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80", time: "1 hr ago" },
    { id: "mock-19", category: "TECH", title: "SPACEX'S STARSHIP LANDS ON MARS — ELON CLAIMS 'FIRST CITY BY 2030'", image: "https://images.unsplash.com/photo-1517976487492-5750f3195933?auto=format&fit=crop&w=600&q=80", author_name: "Leo Vault", author_avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80", time: "2 hrs ago" },
    { id: "mock-20", category: "WORLD", title: "ANTARCTICA'S 'DOOMSDAY GLACIER' MELTING FASTER THAN PREDICTED", image: "https://images.unsplash.com/photo-1585409677983-0f6c41ca9c3b?auto=format&fit=crop&w=600&q=80", author_name: "Mia Fench", author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", time: "3 hrs ago" },
    { id: "mock-21", category: "UK POLITICS", title: "KING CHARLES APPROVES FIRST AI-ADVISED ROYAL DECREE", image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?auto=format&fit=crop&w=600&q=80", author_name: "Zane Edge", author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80", time: "4 hrs ago" },
    { id: "mock-22", category: "AI", title: "MICROSOFT'S AI CEO SAYS 'HUMANS SHOULD NOT TRUST THEIR OWN JUDGMENT'", image: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=600&q=80", author_name: "Leo Vault", author_avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80", time: "5 hrs ago" },
    { id: "mock-23", category: "TECH", title: "NEW BATTERY TECH CHARGES EV IN 5 MINUTES — OIL INDUSTRY IN PANIC", image: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?auto=format&fit=crop&w=600&q=80", author_name: "Mia Fench", author_avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80", time: "6 hrs ago" },
    { id: "mock-24", category: "WORLD", title: "JAPAN UNVEILS FLYING CAR HIGHWAY SYSTEM FOR 2028 LAUNCH", image: "https://images.unsplash.com/photo-1535223289827-42f1e9919769?auto=format&fit=crop&w=600&q=80", author_name: "Zane Edge", author_avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80", time: "7 hrs ago" },
    { id: "mock-25", category: "AI", title: "DEEPFAKE DETECTION NOW IMPOSSIBLE — EVEN AI CAN'T TELL WHAT'S REAL", image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=600&q=80", author_name: "Leo Vault", author_avatar: "https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=100&q=80", time: "8 hrs ago" },
  ];

  return (
    <main className="min-h-screen bg-white text-black">
      {/* ── 2. Breaking News Ticker ────────────────────────────────── */}
      <BreakingNewsTicker headlines={dummyHeadlines} />

      {/* ── 3. THE VIRAL FEED — Headlines Grid ──────────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 pt-8 pb-4">
        <div className="mb-6">
          <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter text-black border-b-[6px] border-black pb-2 inline-block">
            THE VIRAL FEED
          </h2>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 mb-4">
          {/* Left 60% — Main Viral Card */}
          <div className="lg:w-[60%]">
            <Link
              href={`/article/${mainViral.id}`}
              className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
            >
              <div className="bg-zinc-900 w-full relative aspect-video min-h-[350px] md:min-h-[480px]">
                <img
                  src={mainViral.image}
                  alt={mainViral.title}
                  className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                <div className="absolute top-4 left-4 z-20 flex gap-2">
                  <span className="bg-[#FFFF00] text-black font-black uppercase px-2 py-1 text-xs flex items-center gap-1 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] border-2 border-black">
                    <Flame size={14} className="fill-current" /> HOT
                  </span>
                  <span className="bg-red-600 text-white font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                    {mainViral.category}
                  </span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-6 pt-24 flex flex-col justify-end z-10">
                  <h2 className="text-2xl md:text-4xl lg:text-5xl font-inter font-black text-white leading-tight mb-4 drop-shadow-md line-clamp-3">
                    {mainViral.title}
                  </h2>
                  <div className="flex items-center gap-3">
                    <img
                      src={mainViral.author_avatar}
                      alt={mainViral.author_name}
                      className="w-8 h-8 rounded-full border-2 border-[#FFFF00] object-cover"
                    />
                    <span className="text-white text-xs font-bold uppercase">{mainViral.author_name}</span>
                  </div>
                </div>
              </div>
            </Link>
          </div>

          {/* Right 40% — Secondary Viral Stack */}
          <div className="lg:w-[40%] flex flex-col gap-4">
            {secondaryViral.map((article) => (
              <Link
                key={article.id}
                href={`/article/${article.id}`}
                className="group flex gap-3 border-4 border-black hover:border-[#FFFF00] transition-colors p-0 overflow-hidden flex-1"
              >
                <div className="w-[40%] min-w-[120px] relative overflow-hidden">
                  <img
                    src={article.image}
                    alt={article.title}
                    className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="flex flex-col justify-center py-3 pr-3 flex-1">
                  <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">{article.category}</span>
                  <h3 className="text-sm md:text-base font-bold leading-snug line-clamp-3 group-hover:underline">
                    {article.title}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-500 uppercase mt-2">{article.time}</span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Tertiary Row — 4 small square cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {tertiaryViral.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden"
            >
              <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                <img
                  src={article.image}
                  alt={article.title}
                  className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-3 flex flex-col flex-1">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">{article.category}</span>
                <h3 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">{article.title}</h3>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4A. TECH SECTION ────────────────────────────────────────── */}
      <section className="bg-gray-50 mt-10 py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter border-b-[6px] border-[#FFFF00] pb-2">
              TECH
            </h2>
            <Link href="/" className="hidden sm:inline-flex items-center gap-1 text-sm font-black uppercase text-black hover:text-[#FFFF00] transition-colors bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00]">
              MORE TECH <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left 50% — Top Story */}
            <div className="md:w-1/2">
              <Link
                href={`/article/${techTop.id}`}
                className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
              >
                <div className="bg-zinc-900 w-full relative aspect-video min-h-[300px]">
                  <img
                    src={techTop.image}
                    alt={techTop.title}
                    className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-red-600 text-white font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {techTop.category}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-5 pt-20 flex flex-col justify-end z-10 border-l-4 border-[#FFFF00]">
                    <h3 className="text-xl md:text-2xl font-inter font-black text-white leading-tight mb-3 drop-shadow-md line-clamp-3">
                      {techTop.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <img
                        src={techTop.author_avatar}
                        alt={techTop.author_name}
                        className="w-6 h-6 rounded-full border border-[#FFFF00] object-cover"
                      />
                      <span className="text-white text-xs font-bold uppercase">{techTop.author_name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right 50% — 2×2 Grid */}
            <div className="md:w-1/2 grid grid-cols-2 gap-4">
              {techGrid.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.id}`}
                  className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">{article.category}</span>
                    <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">{article.title}</h4>
                    <span className="text-[10px] font-bold text-gray-500 uppercase mt-auto pt-2">{article.time}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="mt-6 sm:hidden">
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-black uppercase text-black bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00] transition-colors">
              MORE TECH <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4B. POLITICS SECTION (mirrored layout) ──────────────────── */}
      <section className="bg-white py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter border-b-[6px] border-[#FFFF00] pb-2">
              POLITICS
            </h2>
            <Link href="/" className="hidden sm:inline-flex items-center gap-1 text-sm font-black uppercase text-black hover:text-[#FFFF00] transition-colors bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00]">
              MORE POLITICS <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left 50% — 2×2 Grid (mirrored: grid on left) */}
            <div className="md:w-1/2 grid grid-cols-2 gap-4 order-2 md:order-1">
              {politicsGrid.map((article) => (
                <Link
                  key={article.id}
                  href={`/article/${article.id}`}
                  className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-gray-50"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">{article.category}</span>
                    <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">{article.title}</h4>
                    <span className="text-[10px] font-bold text-gray-500 uppercase mt-auto pt-2">{article.time}</span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Right 50% — Top Story (mirrored: top story on right) */}
            <div className="md:w-1/2 order-1 md:order-2">
              <Link
                href={`/article/${politicsTop.id}`}
                className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
              >
                <div className="bg-zinc-900 w-full relative aspect-video min-h-[300px]">
                  <img
                    src={politicsTop.image}
                    alt={politicsTop.title}
                    className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                  />
                  <div className="absolute top-4 right-4 z-20">
                    <span className="bg-red-600 text-white font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {politicsTop.category}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-5 pt-20 flex flex-col justify-end z-10 border-r-4 border-[#FFFF00]">
                    <h3 className="text-xl md:text-2xl font-inter font-black text-white leading-tight mb-3 drop-shadow-md line-clamp-3">
                      {politicsTop.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <img
                        src={politicsTop.author_avatar}
                        alt={politicsTop.author_name}
                        className="w-6 h-6 rounded-full border border-[#FFFF00] object-cover"
                      />
                      <span className="text-white text-xs font-bold uppercase">{politicsTop.author_name}</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="mt-6 sm:hidden">
            <Link href="/" className="inline-flex items-center gap-1 text-sm font-black uppercase text-black bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00] transition-colors">
              MORE POLITICS <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4C. QUIZZES & ENTERTAINMENT SECTION ─────────────────────── */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl md:text-4xl font-inter font-black uppercase tracking-tighter border-b-[6px] border-[#FFFF00] pb-2">
              QUIZZES & ENTERTAINMENT
            </h2>
            <Link href="/quizzes" className="hidden sm:inline-flex items-center gap-1 text-sm font-black uppercase text-black hover:text-[#FFFF00] transition-colors bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00]">
              MORE QUIZZES <ArrowRight size={16} />
            </Link>
          </div>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Left 33% — Featured Quiz */}
            <div className="md:w-1/3">
              <Link
                href={`/quiz/${quizFeatured.id}`}
                className="group relative flex flex-col overflow-hidden border-4 border-black hover:border-[#FFFF00] transition-colors h-full"
              >
                <div className="bg-zinc-900 w-full relative aspect-[4/5] min-h-[350px]">
                  <img
                    src={quizFeatured.image}
                    alt={quizFeatured.title}
                    className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500 opacity-80 group-hover:opacity-100"
                  />
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <div className="w-16 h-16 bg-[#FFFF00] rounded-full flex items-center justify-center border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:scale-110 transition-transform">
                      <Play size={28} className="fill-black text-black ml-1" />
                    </div>
                  </div>
                  <div className="absolute top-4 left-4 z-20">
                    <span className="bg-[#FFFF00] text-black font-black uppercase px-2 py-1 text-xs border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                      {quizFeatured.category}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-5 pt-20 flex flex-col justify-end z-10">
                    <h3 className="text-lg md:text-xl font-inter font-black text-white leading-tight drop-shadow-md line-clamp-3">
                      {quizFeatured.title}
                    </h3>
                  </div>
                </div>
              </Link>
            </div>

            {/* Right 66% — 3×2 Grid */}
            <div className="md:w-2/3 grid grid-cols-2 md:grid-cols-3 gap-4">
              {quizGrid.map((article) => (
                <Link
                  key={article.id}
                  href={article.id.startsWith('quiz-') ? `/quiz/${article.id}` : `/article/${article.id}`}
                  className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
                >
                  <div className="aspect-[4/3] relative overflow-hidden bg-zinc-200">
                    <img
                      src={article.image}
                      alt={article.title}
                      className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                    />
                    {article.id.startsWith('quiz-') && (
                      <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="w-10 h-10 bg-[#FFFF00] rounded-full flex items-center justify-center border-2 border-black">
                          <Play size={18} className="fill-black text-black ml-0.5" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-1">
                    <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-1">{article.category}</span>
                    <h4 className="text-sm font-bold leading-snug line-clamp-3 group-hover:underline">{article.title}</h4>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Mobile CTA */}
          <div className="mt-6 sm:hidden">
            <Link href="/quizzes" className="inline-flex items-center gap-1 text-sm font-black uppercase text-black bg-[#FFFF00] px-4 py-2 border-2 border-black hover:bg-black hover:text-[#FFFF00] transition-colors">
              MORE QUIZZES <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. MORE LATEST NEWS — 4-Column Card Grid ────────────────── */}
      <section className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6 border-b-4 border-black pb-2">
          <h3 className="text-2xl md:text-3xl font-inter font-black uppercase tracking-tight flex items-center gap-2">
            <Flame size={24} className="text-red-600" /> MORE LATEST NEWS
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {latestNews.map((article) => (
            <Link
              key={article.id}
              href={`/article/${article.id}`}
              className="group flex flex-col border-4 border-black hover:border-[#FFFF00] transition-colors overflow-hidden bg-white"
            >
              <div className="aspect-video relative overflow-hidden bg-zinc-200">
                <img
                  src={article.image}
                  alt={article.title}
                  className="absolute inset-0 object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 flex flex-col flex-1">
                <span className="text-[10px] font-black text-red-600 uppercase tracking-wider mb-2">{article.category}</span>
                <h3 className="text-base font-bold leading-snug line-clamp-2 group-hover:underline mb-3">
                  {article.title}
                </h3>
                <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-200">
                  <img
                    src={article.author_avatar}
                    alt={article.author_name}
                    className="w-5 h-5 rounded-full object-cover"
                  />
                  <span className="text-[10px] font-bold text-gray-500 uppercase">{article.author_name}</span>
                  <span className="text-[10px] font-bold text-gray-400 ml-auto">{article.time}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Load More Button */}
        <div className="mt-8 flex justify-center">
          <button className="inline-flex items-center gap-2 font-inter font-black uppercase text-base px-8 py-3 border-2 border-[#FFFF00] text-black bg-transparent hover:bg-[#FFFF00] transition-colors">
            LOAD MORE <ArrowRight size={18} />
          </button>
        </div>
      </section>
    </main>
  );
}
