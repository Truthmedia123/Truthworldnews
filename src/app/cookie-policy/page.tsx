import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Cookie Policy',
    description: 'TruthWorldNews Cookie Policy — how we use cookies and how you can control them.',
};

export default function CookiePolicyPage() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-16 min-h-screen text-gray-200">
            <div className="border-b-8 border-white/20 pb-6 mb-12">
                <h1 className="text-6xl md:text-8xl font-inter font-black uppercase tracking-tighter text-white">Cookie Policy</h1>
                <p className="text-gray-400 mt-4 font-bold">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="legal-content prose prose-lg max-w-none font-serif text-lg leading-relaxed space-y-8">
                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">1. What Are Cookies?</h2>
                    <p>
                        Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work efficiently, provide analytics, and deliver personalized advertising. Cookies may be "session" (deleted when you close your browser) or "persistent" (remain until they expire or you delete them).
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">2. How We Use Cookies</h2>
                    <p>TruthWorldNews, operated by TRUTHMEDIANETWORKS, uses cookies for the following purposes:</p>

                    <h3 className="text-xl font-inter font-bold mt-4 text-white">2.1 Necessary Cookies (Always Active)</h3>
                    <p>These cookies are essential for the Site to function properly. They enable core functionality such as security, network management, and accessibility. The Site cannot function without them.</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Cookie consent preferences (localStorage)</li>
                        <li>Session management</li>
                    </ul>

                    <h3 className="text-xl font-inter font-bold mt-4 text-white">2.2 Marketing / Advertising Cookies</h3>
                    <p>
                        These cookies are used to deliver advertisements that are relevant to you. They are placed by our advertising partner, <strong className="text-white">Google AdSense</strong>. They track your browsing habits across websites to build a profile of your interests.
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Google AdSense cookies (third-party)</li>
                        <li>Frequency capping</li>
                        <li>Ad performance measurement</li>
                    </ul>
                    <p>
                        You can opt out of personalized advertising by visiting{' '}
                        <a href="https://adssettings.google.com" className="text-[#FFFF00] underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>{' '}
                        or{' '}
                        <a href="https://optout.aboutads.info" className="text-[#FFFF00] underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">aboutads.info</a>.
                    </p>

                    <h3 className="text-xl font-inter font-bold mt-4 text-white">2.3 Analytics Cookies</h3>
                    <p>
                        These cookies help us understand how visitors interact with the Site by collecting and reporting information anonymously. We use:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><strong className="text-white">Google Analytics</strong> — page views, session duration, bounce rate</li>
                        <li><strong className="text-white">Microsoft Clarity</strong> — heatmaps, session recordings, user behavior insights</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">3. Managing Your Cookie Preferences</h2>
                    <p>
                        When you first visit our Site, you will see a cookie consent banner allowing you to:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><strong className="text-white">Accept All</strong> — enable all cookie categories</li>
                        <li><strong className="text-white">Reject All</strong> — only necessary cookies will be active</li>
                        <li><strong className="text-white">Manage Preferences</strong> — choose which categories to allow</li>
                    </ul>
                    <p>
                        Your preferences are stored in your browser's localStorage and will be remembered for 30 days. After that, you will be prompted again.
                    </p>
                    <p>
                        You can also control cookies through your browser settings. Most browsers allow you to block or delete cookies. Note that blocking necessary cookies may affect Site functionality.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">4. Third-Party Cookies</h2>
                    <p>
                        Third-party services used on this Site may place their own cookies on your device. We do not control these cookies. Please review the privacy policies of these third parties:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>
                            <a href="https://policies.google.com/technologies/cookies" className="text-[#FFFF00] underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Google Cookie Policy</a>
                        </li>
                        <li>
                            <a href="https://privacy.microsoft.com/en-us/privacystatement" className="text-[#FFFF00] underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Microsoft Privacy Statement</a>
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">5. Changes to This Policy</h2>
                    <p>
                        We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated date.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">6. Contact</h2>
                    <p>
                        For questions about this Cookie Policy, contact:{' '}
                        <a href="mailto:privacy@truthworldnews.com" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">privacy@truthworldnews.com</a>
                    </p>
                </section>
            </div>
        </main>
    );
}