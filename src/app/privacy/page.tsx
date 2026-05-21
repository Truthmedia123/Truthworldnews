import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Privacy Policy',
};

export default function PrivacyPage() {
  return (
    <main className="max-w-4xl mx-auto px-6 py-16 min-h-screen">
      <div className="border-b-8 border-black pb-6 mb-12">
        <h1 className="text-5xl md:text-7xl font-inter font-black uppercase tracking-tighter">Privacy Policy</h1>
      </div>
      
      <div className="prose prose-lg max-w-none font-serif text-lg leading-relaxed text-black space-y-6">
        <p className="font-inter font-bold uppercase text-red-600">Last Updated: {new Date().toLocaleDateString()}</p>
        
        <h2 className="text-2xl font-inter font-black uppercase mt-8">1. Information We Collect</h2>
        <p>
          Truth World News collects standard analytics data so we know which of our viral headlines you fell for. We collect IP addresses, browser types, and referring URLs. If you use our Tip Line, we collect your email address. 
        </p>

        <h2 className="text-2xl font-inter font-black uppercase mt-8">2. How We Use Your Information</h2>
        <p>
          We use your data to serve you better news, optimize our AI algorithms, and occasionally display targeted advertisements because servers aren't free. We do not sell your personal emails to third parties.
        </p>

        <h2 className="text-2xl font-inter font-black uppercase mt-8">3. Cookies</h2>
        <p>
          Like literally every other website on the internet, we use cookies. They help us track your session and ensure you aren't a bot trying to scrape our highly curated, AI-generated content. You can disable them in your browser, but the site might break.
        </p>

        <h2 className="text-2xl font-inter font-black uppercase mt-8">4. Contact Us</h2>
        <p>
          If you have questions about this privacy policy, send an email to <a href="mailto:legal@truthworldnews.com" className="font-bold underline hover:text-red-600">legal@truthworldnews.com</a>.
        </p>
      </div>
    </main>
  );
}
