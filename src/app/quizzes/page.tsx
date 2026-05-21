import React from 'react';
import Link from 'next/link';

export default function QuizHub() {
  const dummyQuizzes = [
    {
      id: 'q-mock-1',
      title: 'CAN YOU SPOT THE AI DEEPFAKE?',
      image: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
      difficulty: 'HARD',
      category: 'AI'
    },
    {
      id: 'q-mock-2',
      title: 'ARE YOU A SHEEP? THE CONSPIRACY TEST',
      image: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80',
      difficulty: 'EXTREME',
      category: 'POLITICS'
    },
    {
      id: 'q-mock-3',
      title: 'WHO ACTUALLY RUNS THE WORLD?',
      image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80',
      difficulty: 'MEDIUM',
      category: 'POP CULTURE'
    },
    {
      id: 'q-mock-4',
      title: 'THE FRIDAY TRUTH TEST: WEEK 11',
      image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=800&q=80',
      difficulty: 'EASY',
      category: 'WEEKLY'
    }
  ];

  const categories = ['ALL', 'AI', 'POLITICS', 'POP CULTURE'];

  return (
    <main className="min-h-screen bg-white text-black pb-20">
      {/* Hero Section */}
      <section className="relative w-full h-[60vh] md:h-[70vh] border-b-8 border-black overflow-hidden flex items-end">
        <img
          src="https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1600&q=80"
          alt="Featured Quiz"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent"></div>

        <div className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <span className="bg-red-600 text-white font-mono font-bold uppercase px-3 py-1 text-sm border-2 border-black mb-4 inline-block shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] animate-pulse">
            NEW EXCLUSIVE
          </span>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter text-white leading-none mb-8 drop-shadow-lg max-w-4xl">
            THE FRIDAY TRUTH TEST: WEEK 12
          </h2>
          <Link href="/quiz/q-mock-featured" className="inline-block bg-[#FFFF00] text-black border-4 border-black font-black uppercase text-xl md:text-2xl px-10 py-4 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 hover:bg-black hover:text-[#FFFF00] transition-all">
            START QUIZ
          </Link>
        </div>
      </section>

      {/* Main Hub Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
        {/* The Filter Bar */}
        <div className="flex overflow-x-auto gap-4 pb-4 mb-12 scrollbar-hide border-b-4 border-black border-dashed">
          {categories.map((cat, idx) => (
            <button
              key={idx}
              className={`whitespace-nowrap px-6 py-2 border-4 border-black font-black uppercase text-sm transition-all ${idx === 0 ? 'bg-black text-[#FFFF00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]' : 'bg-white text-black hover:bg-[#FFFF00] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* The Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {dummyQuizzes.map((quiz) => (
            <Link
              key={quiz.id}
              href={`/quiz/${quiz.id}`}
              className="group flex flex-col bg-white border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 hover:shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] transition-all overflow-hidden"
            >
              <div className="w-full aspect-video border-b-4 border-black relative overflow-hidden bg-black">
                <img
                  src={quiz.image}
                  alt={quiz.title}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500"
                />
                <div className="absolute top-4 left-4">
                  <span className={`font-mono text-xs font-bold uppercase px-2 py-1 border-2 border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] ${quiz.difficulty === 'HARD' || quiz.difficulty === 'EXTREME' ? 'bg-red-600 text-white' : 'bg-[#FFFF00] text-black'}`}>
                    {quiz.difficulty}
                  </span>
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col justify-between">
                <h3 className="text-2xl font-black uppercase leading-tight mb-4 group-hover:text-red-600 transition-colors">
                  {quiz.title}
                </h3>
                <span className="font-bold text-gray-400 text-sm uppercase">Category: {quiz.category}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
