import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
};

export default function TermsPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 min-h-screen">
      <div className="border-b-8 border-black pb-6 mb-12">
        <h1 className="text-5xl md:text-7xl font-inter font-black uppercase tracking-tighter">Terms of Service</h1>
      </div>
      
      <div className="prose prose-lg max-w-none font-serif text-lg leading-relaxed text-black space-y-6">
        <p className="font-inter font-bold uppercase text-red-600">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-inter font-black uppercase mt-8">1. Acceptance of Terms</h2>
        <p>
          By accessing and using Truth World News, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please leave the website. 
        </p>

        <h2 className="text-2xl font-inter font-black uppercase mt-8">2. Content Disclaimer</h2>
        <p>
          The content on this site is provided for entertainment, outrage, and informational purposes. While we rely heavily on AI to generate summaries, we do not guarantee the absolute accuracy, completeness, or usefulness of any information presented. Take everything with a grain of salt.
        </p>

        <h2 className="text-2xl font-inter font-black uppercase mt-8">3. Intellectual Property</h2>
        <p>
          Our articles, custom graphics, and overall brutalist aesthetic are the property of Truth World News. Do not steal our layouts or pretend our content is yours. We will find out.
        </p>

        <h2 className="text-2xl font-inter font-black uppercase mt-8">4. Modifications to Service</h2>
        <p>
          We reserve the right to modify or discontinue Truth World News with or without notice to the user. We shall not be liable to you or any third party should we exercise our right to modify or discontinue the service.
        </p>
      </div>
    </main>
  );
}
