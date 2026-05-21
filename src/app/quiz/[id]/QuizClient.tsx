'use client';

import React, { useState } from 'react';
import Link from 'next/link';

// Dummy data
const dummyQuiz = {
  id: 'q-mock-1',
  title: 'CAN YOU SPOT THE AI DEEPFAKE?',
  description: 'Test your ability to distinguish reality from algorithmically generated propaganda.',
  questions: [
    {
      id: 'q1',
      question_text: 'Which of these details is the most common giveaway of an AI-generated image?',
      image_url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=1200&q=80',
      options: ['Perfectly symmetrical faces', 'Messed up hands and fingers', 'Hyper-realistic shadows', 'The image file size'],
      correct_option_index: 1,
      explanation_text: 'AI models famously struggle with rendering human hands, often creating 6 fingers or melted joints.'
    },
    {
      id: 'q2',
      question_text: 'What does the term "Hallucination" mean in the context of Large Language Models?',
      image_url: null,
      options: ['When the AI becomes self-aware', 'Visual patterns in code', 'Confidently faking facts', 'Server overheating'],
      correct_option_index: 2,
      explanation_text: 'LLMs are designed to predict the next word, meaning they will confidently lie and present it as absolute truth if they lack real data.'
    },
    {
      id: 'q3',
      question_text: 'True or False: AI-generated voices can now spoof a human voice with just 3 seconds of audio.',
      image_url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80',
      options: ['True', 'False', 'English Only', 'Robots Only'],
      correct_option_index: 0,
      explanation_text: 'Advanced models can clone a voice perfectly with just a 3-second sample.'
    }
  ]
};

export default function QuizClient() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [isFinished, setIsFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [flashColor, setFlashColor] = useState<string | null>(null);

  const quiz = dummyQuiz;
  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex) / quiz.questions.length) * 100;

  const handleOptionClick = (index: number) => {
    if (showExplanation) return;

    setSelectedOption(index);
    const isCorrect = index === currentQuestion.correct_option_index;

    setFlashColor(isCorrect ? 'bg-green-500' : 'bg-red-600');

    setTimeout(() => {
      setShowExplanation(true);
      if (isCorrect) {
        setScore(prev => prev + 1);
      }
    }, 400);
  };

  const handleNext = () => {
    setSelectedOption(null);
    setShowExplanation(false);
    setFlashColor(null);

    if (currentQuestionIndex + 1 < quiz.questions.length) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      setIsFinished(true);
    }
  };

  const getVerdict = (finalScore: number, total: number) => {
    const ratio = finalScore / total;
    if (ratio === 1) return { title: "ALGORITHM", subtitle: "VERDICT: YOU ARE THE ALGORITHM", desc: "Your logic circuits are fully optimized. The machines welcome you." };
    if (ratio >= 0.6) return { title: "AWAKE", subtitle: "VERDICT: NOT COMPLETELY BRAINWASHED", desc: "You see through the code. Keep your eyes open." };
    if (ratio > 0) return { title: "GLITCH", subtitle: "VERDICT: GLITCH IN THE MATRIX", desc: "You have potential, but you still believe everything on Twitter." };
    return { title: "SHEEP", subtitle: "VERDICT: YOU ARE 100% BOT", desc: "Please report to the nearest recycling center. Your programming has failed." };
  };

  const verdict = getVerdict(score, quiz.questions.length);

  return (
    <main className={`min-h-screen transition-colors duration-300 ${flashColor || 'bg-white'} text-black py-8 px-4 sm:px-6 lg:px-8`}>
      <div className="max-w-4xl mx-auto">
        {!isFinished ? (
          <>
            <div className="mb-8 bg-white border-4 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
              <div className="flex justify-between font-mono text-sm font-bold uppercase mb-2 text-black">
                <span>Verification Module: {currentQuestionIndex + 1} / {quiz.questions.length}</span>
                <span>Accuracy: {score}</span>
              </div>
              <div className="w-full h-4 bg-black border-2 border-black">
                <div
                  className="h-full bg-[#FFFF00] transition-all duration-500"
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            <div className="border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] bg-white mb-8 overflow-hidden">
              {currentQuestion.image_url && (
                <div className="w-full h-[30vh] sm:h-[40vh] border-b-4 border-black relative">
                  <img src={currentQuestion.image_url} alt="Question Context" className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-8 md:p-12 text-center">
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tight leading-tight">
                  {currentQuestion.question_text}
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-8">
              {currentQuestion.options.map((option, index) => {
                let buttonStyle = "bg-white text-black hover:bg-black hover:text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1";

                if (showExplanation) {
                  if (index === currentQuestion.correct_option_index) {
                    buttonStyle = "bg-green-400 text-black border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]";
                  } else if (index === selectedOption) {
                    buttonStyle = "bg-black text-white border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] line-through decoration-red-500 decoration-4";
                  } else {
                    buttonStyle = "bg-gray-100 text-gray-400 border-4 border-gray-300 opacity-50";
                  }
                }

                return (
                  <button
                    key={index}
                    onClick={() => handleOptionClick(index)}
                    disabled={showExplanation}
                    className={`w-full text-center p-8 md:p-12 font-inter font-black text-xl md:text-2xl uppercase transition-all ${buttonStyle}`}
                  >
                    {option}
                  </button>
                );
              })}
            </div>

            {showExplanation && (
              <div className="animate-shuffle bg-white">
                <div className={`p-8 border-4 border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] mb-8 ${selectedOption === currentQuestion.correct_option_index ? 'bg-green-400 text-black' : 'bg-red-600 text-white'}`}>
                  <h3 className="text-4xl md:text-5xl font-black uppercase mb-4 text-center">
                    {selectedOption === currentQuestion.correct_option_index ? 'FACT VERIFIED' : 'TOTAL PROPAGANDA'}
                  </h3>
                  <div className="article-body text-center max-w-2xl mx-auto">
                    <p className="font-bold">{currentQuestion.explanation_text}</p>
                  </div>
                </div>

                <button
                  onClick={handleNext}
                  className="w-full block text-center bg-[#FFFF00] text-black border-4 border-black font-black uppercase text-2xl py-6 hover:bg-black hover:text-[#FFFF00] transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2"
                >
                  {currentQuestionIndex + 1 === quiz.questions.length ? 'CALCULATING RESULTS...' : 'NEXT QUESTION'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="animate-shuffle">
            <div className="border-8 border-black shadow-[16px_16px_0px_0px_rgba(0,0,0,1)] bg-[#FFFF00] overflow-hidden mb-8 relative">
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-black via-transparent to-transparent"></div>

              <div className="p-12 text-center relative z-10 border-b-8 border-black bg-white">
                <h2 className="font-mono font-bold text-gray-500 uppercase mb-4 tracking-widest text-lg border-2 border-black inline-block px-4 py-1">Final Score</h2>
                <div className="text-8xl sm:text-[12rem] font-black tracking-tighter leading-none mb-4 text-black drop-shadow-lg">
                  {score}<span className="text-6xl sm:text-8xl text-gray-300">/{quiz.questions.length}</span>
                </div>
                <h3 className="text-3xl md:text-5xl font-black uppercase tracking-widest text-red-600">
                  {verdict.title}
                </h3>
              </div>

              <div className="p-8 md:p-12 text-center bg-black text-white">
                <h4 className="text-2xl md:text-3xl font-black uppercase mb-4 text-[#FFFF00] underline decoration-4 underline-offset-8">
                  {verdict.subtitle}
                </h4>
                <p className="text-xl font-bold uppercase max-w-2xl mx-auto leading-relaxed">
                  {verdict.desc}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <button className="bg-red-600 text-white border-4 border-black font-black uppercase text-xl px-8 py-6 hover:bg-black transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 flex-1">
                SHARE TO EXPOSE THE TRUTH
              </button>
              <Link href="/quizzes" className="bg-white text-black border-4 border-black font-black uppercase text-xl px-8 py-6 text-center hover:bg-[#FFFF00] transition-colors shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 flex-1">
                BACK TO QUIZ HUB
              </Link>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
