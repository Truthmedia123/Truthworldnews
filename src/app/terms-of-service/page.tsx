import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms of Service',
    description: 'TruthWorldNews Terms of Service — rules, disclaimers, and your rights.',
};

export default function TermsOfServicePage() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-16 min-h-screen text-gray-200">
            <div className="border-b-8 border-white/20 pb-6 mb-12">
                <h1 className="text-6xl md:text-8xl font-inter font-black uppercase tracking-tighter text-white">Terms of Service</h1>
                <p className="text-gray-400 mt-4 font-bold">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="legal-content prose prose-lg max-w-none font-serif text-lg leading-relaxed space-y-8">
                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">1. Acceptance of Terms</h2>
                    <p>
                        By accessing and using <strong className="text-white">truthworldnews.com</strong> (the "Site"), operated by <strong className="text-white">TRUTHMEDIANETWORKS</strong>, you agree to be bound by these Terms of Service. If you do not agree, you must discontinue use of the Site immediately.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">2. User's Right to Leave</h2>
                    <p>
                        You have the absolute, unconditional right to stop using this Site at any time, for any reason, or for no reason at all. We will not chase you. We will not send you guilt-tripping emails. You are free. Go. Live your life. (But we'll be here if you want to come back.)
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">3. Content Disclaimer</h2>
                    <p>
                        TruthWorldNews publishes news, opinion, satire, and commentary. While we strive for accuracy, we make no representations or warranties of any kind, express or implied, about the completeness, accuracy, reliability, suitability, or availability of the information contained on the Site. Content may include AI-generated or AI-assisted material.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">4. No Responsibility for Any Type of Loss</h2>
                    <p>
                        <strong className="text-white">TRUTHMEDIANETWORKS, its operators, affiliates, and contributors shall not be held responsible or liable for any type of loss or damage</strong> — including but not limited to direct, indirect, incidental, consequential, special, punitive, or exemplary damages — arising from:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Your use of or reliance on any information on the Site</li>
                        <li>Errors, omissions, or inaccuracies in content</li>
                        <li>Third-party advertisements or links displayed on the Site</li>
                        <li>Technical issues, downtime, or data loss</li>
                        <li>Any action taken based on content from this Site</li>
                    </ul>
                    <p>
                        You use this Site at your own risk. If you lose money, sleep, or faith in humanity because of something you read here — that's on you.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">5. Third-Party Content & Ads</h2>
                    <p>
                        The Site displays advertisements served by Google AdSense and may contain links to third-party websites. We do not endorse, control, or assume responsibility for any third-party content, products, services, or privacy practices. Your interactions with third-party advertisers are solely between you and the advertiser.
                    </p>
                    <p>
                        Google AdSense uses cookies to serve ads based on your prior visits to this Site and other websites. You may opt out of personalized advertising by visiting{' '}
                        <a href="https://adssettings.google.com" className="text-[#FFFF00] underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">6. No Investment or Professional Advice</h2>
                    <p>
                        Nothing on this Site constitutes financial, investment, legal, medical, or professional advice. Any references to stocks, cryptocurrencies, or financial instruments are for informational and entertainment purposes only. Consult a qualified professional before making any financial decisions. Seriously. Don't YOLO your life savings based on a headline.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">7. Intellectual Property</h2>
                    <p>
                        All original content on this Site — including articles, graphics, logos, and the TruthWorldNews brand — is the property of TRUTHMEDIANETWORKS and is protected by applicable copyright and trademark laws. Third-party images used on the Site may be sourced from stock photo services and are used under license.
                    </p>
                    <p>
                        If you believe your copyrighted work has been infringed, please see our{' '}
                        <a href="/dmca" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">DMCA Policy</a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">8. Limitation of Liability</h2>
                    <p>
                        To the fullest extent permitted by applicable law, TRUTHMEDIANETWORKS shall not be liable for any damages whatsoever arising out of or in connection with your use of the Site. This limitation applies to all claims, whether based on warranty, contract, tort, or any other legal theory.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">9. Indemnification</h2>
                    <p>
                        You agree to indemnify, defend, and hold harmless TRUTHMEDIANETWORKS, its operators, affiliates, and contributors from and against any and all claims, liabilities, damages, losses, costs, and expenses (including reasonable legal fees) arising out of or in any way connected with your use of the Site or your violation of these Terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">10. User-Generated Content</h2>
                    <p>
                        If you submit tips, comments, or other content to the Site, you grant us a non-exclusive, royalty-free, perpetual license to use, reproduce, and display that content. You represent that you have the right to submit such content and that it does not violate any third-party rights.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">11. Termination</h2>
                    <p>
                        We reserve the right to terminate or suspend access to the Site at any time, without prior notice, for any reason, including violation of these Terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">12. Governing Law</h2>
                    <p>
                        These Terms shall be governed by and construed in accordance with applicable laws. Any disputes shall be resolved through negotiation first, and if that fails, through the appropriate legal channels.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">13. Changes to Terms</h2>
                    <p>
                        We may modify these Terms at any time. Changes will be effective immediately upon posting. Your continued use of the Site constitutes acceptance of the revised Terms.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">14. Contact</h2>
                    <p>For questions about these Terms, contact:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Email:{' '}
                            <a href="mailto:legal@truthworldnews.com" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">legal@truthworldnews.com</a>
                        </li>
                        <li>Operator: TRUTHMEDIANETWORKS</li>
                    </ul>
                </section>
            </div>
        </main>
    );
}