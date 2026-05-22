import { Flame, Lock, Zap, Eye } from 'lucide-react';

export const metadata = {
  title: 'Premium | Truth World News',
  description: 'Exclusive content, early access, and unfiltered Zane Edge.',
};

export default function PremiumPage() {
  return (
    <main className="bg-black text-white min-h-screen">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <Flame className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Zane Edge Premium</h1>
          <p className="text-xl text-gray-400">
            The stuff too hot for the main feed. Leaked docs, early takes, no filters.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-8">
            <h2 className="text-2xl font-bold mb-4 text-red-500">Free</h2>
            <p className="text-3xl font-bold mb-6">$0<span className="text-gray-500 text-lg">/month</span></p>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex items-center gap-2"><Eye className="w-4 h-4 text-green-500" /> All public articles</li>
              <li className="flex items-center gap-2"><Eye className="w-4 h-4 text-green-500" /> Weekly newsletter</li>
              <li className="flex items-center gap-2"><Eye className="w-4 h-4 text-green-500" /> RSS feed</li>
              <li className="flex items-center gap-2 text-gray-600"><Lock className="w-4 h-4" /> No exclusive content</li>
              <li className="flex items-center gap-2 text-gray-600"><Lock className="w-4 h-4" /> No early access</li>
            </ul>
            <button disabled className="w-full py-3 bg-gray-800 text-gray-500 rounded font-bold cursor-default">
              CURRENT PLAN
            </button>
          </div>

          <div className="bg-gray-900 border-2 border-red-600 rounded-lg p-8 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-red-600 text-black text-xs font-bold px-3 py-1 rounded">
              EARLY ACCESS
            </div>
            <h2 className="text-2xl font-bold mb-4 text-red-500">Premium</h2>
            <p className="text-3xl font-bold mb-6">$5<span className="text-gray-500 text-lg">/month</span></p>
            <ul className="space-y-3 text-gray-300 mb-8">
              <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-red-500" /> Everything in Free</li>
              <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-red-500" /> Exclusive leaked docs</li>
              <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-red-500" /> 48-hour early access</li>
              <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-red-500" /> &quot;Zane Unfiltered&quot; raw takes</li>
              <li className="flex items-center gap-2"><Zap className="w-4 h-4 text-red-500" /> Discord community access</li>
            </ul>
            <button className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded font-bold transition">
              COMING SOON
            </button>
            <p className="text-xs text-gray-500 text-center mt-3">
              Stripe integration in progress. Join the waitlist.
            </p>
          </div>
        </div>

        <div className="text-center">
          <p className="text-gray-400 mb-4">Want to be notified when Premium launches?</p>
          <form className="flex max-w-md mx-auto gap-2">
            <input
              type="email"
              placeholder="your@email.com"
              className="flex-1 px-4 py-2 bg-gray-900 border border-gray-700 rounded text-white"
            />
            <button className="px-6 py-2 bg-red-600 hover:bg-red-700 rounded font-bold">
              JOIN WAITLIST
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
