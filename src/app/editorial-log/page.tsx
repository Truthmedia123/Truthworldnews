import { supabase } from '@/lib/supabase';
import { CheckCircle, Clock, AlertTriangle } from 'lucide-react';

export const metadata = {
  title: 'Editorial Log | Truth World News',
  description: 'Transparency in our editorial process. Every article reviewed, documented, and accountable.',
};

export default async function EditorialLogPage() {
  const { data: logs, error } = await supabase
    .from('posts')
    .select('id, title, reviewed_by, reviewed_at, editorial_notes, status, is_rumor, safety_score, created_at')
    .order('created_at', { ascending: false })
    .limit(50);

  if (error) {
    console.error('Editorial log fetch error:', error);
  }

  return (
    <main className="bg-black text-white min-h-screen">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <h1 className="text-4xl font-bold mb-2">Editorial Log</h1>
        <p className="text-gray-400 mb-8">
          Every article we publish goes through human review. Here&apos;s the proof.
        </p>

        <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-bold mb-4 text-red-500">Our Process</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">1</div>
              <p className="font-bold">Scrape</p>
              <p className="text-gray-500">Multi-source aggregation</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">2</div>
              <p className="font-bold">Safety Check</p>
              <p className="text-gray-500">Toxicity + source verification</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">3</div>
              <p className="font-bold">AI Draft</p>
              <p className="text-gray-500">LLM-assisted, not LLM-only</p>
            </div>
            <div className="text-center">
              <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center mx-auto mb-2">4</div>
              <p className="font-bold">Human Review</p>
              <p className="text-gray-500">Editor approval required</p>
            </div>
          </div>
        </div>

        {(!logs || logs.length === 0) ? (
          <p className="text-gray-500">No editorial records yet. Pipeline is running.</p>
        ) : (
          <div className="space-y-4">
            {logs.map((log: any) => (
              <div key={log.id} className="bg-gray-900 border border-gray-800 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{log.title}</h3>
                    <div className="flex items-center gap-3 mt-2 text-sm">
                      <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                        log.status === 'published' ? 'bg-green-900 text-green-400' :
                        log.status === 'draft' ? 'bg-yellow-900 text-yellow-400' :
                        'bg-gray-800 text-gray-400'
                      }`}>
                        {log.status?.toUpperCase()}
                      </span>
                      {log.is_rumor && (
                        <span className="px-2 py-0.5 rounded text-xs font-bold bg-yellow-900 text-yellow-400">
                          RUMOR
                        </span>
                      )}
                      {log.safety_score && (
                        <span className="text-gray-500">
                          Safety: {log.safety_score}/100
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-500">
                    {log.reviewed_by ? (
                      <div className="flex items-center gap-1 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span>Reviewed by {log.reviewed_by}</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-400">
                        <Clock className="w-4 h-4" />
                        <span>Awaiting review</span>
                      </div>
                    )}
                    {log.reviewed_at && (
                      <p className="text-xs mt-1">
                        {new Date(log.reviewed_at).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
                {log.editorial_notes && (
                  <p className="mt-3 text-sm text-gray-400 border-t border-gray-800 pt-2">
                    <span className="text-gray-500">Notes:</span> {log.editorial_notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 p-6 bg-gray-900 border border-gray-800 rounded-lg">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-500" />
            AI Disclosure
          </h2>
          <p className="text-gray-300 text-sm leading-relaxed">
            Truth World News uses AI-assisted content generation. Our pipeline scrapes news sources,
            verifies facts, and generates drafts using large language models (DeepSeek, Groq, Claude).
            Every article is then reviewed by a human editor before publication. We disclose AI involvement
            on every article. This is not &quot;AI-generated content&quot; — it&apos;s AI-assisted journalism with human oversight.
          </p>
        </div>
      </div>
    </main>
  );
}
