import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy',
    description: 'TruthWorldNews Privacy Policy — GDPR, CCPA, PIPEDA, LGPD, APPI compliant.',
};

export default function PrivacyPolicyPage() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-16 min-h-screen text-gray-200">
            <div className="border-b-8 border-white/20 pb-6 mb-12">
                <h1 className="text-6xl md:text-8xl font-inter font-black uppercase tracking-tighter text-white">Privacy Policy</h1>
                <p className="text-gray-400 mt-4 font-bold">Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            </div>

            <div className="legal-content prose prose-lg max-w-none font-serif text-lg leading-relaxed space-y-8">
                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">1. Introduction</h2>
                    <p>
                        TruthWorldNews ("we," "our," or "us"), operated by <strong className="text-white">TRUTHMEDIANETWORKS</strong>, is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website{' '}
                        <a href="https://truthworldnews.com" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">truthworldnews.com</a> (the "Site").
                    </p>
                    <p>
                        This policy complies with the following data protection regulations:
                    </p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><strong className="text-white">GDPR</strong> (General Data Protection Regulation — EU/EEA)</li>
                        <li><strong className="text-white">CCPA/CPRA</strong> (California Consumer Privacy Act — California, USA)</li>
                        <li><strong className="text-white">PIPEDA</strong> (Personal Information Protection and Electronic Documents Act — Canada)</li>
                        <li><strong className="text-white">LGPD</strong> (Lei Geral de Proteção de Dados — Brazil)</li>
                        <li><strong className="text-white">APPI</strong> (Act on the Protection of Personal Information — Japan)</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">2. Information We Collect</h2>
                    <h3 className="text-xl font-inter font-bold mt-4 text-white">2.1 Information You Provide</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Email address (when subscribing to our newsletter or submitting tips)</li>
                        <li>Name and contact information (when submitting a DMCA notice, data request, or contact form)</li>
                        <li>Any other information you voluntarily provide</li>
                    </ul>
                    <h3 className="text-xl font-inter font-bold mt-4 text-white">2.2 Information Collected Automatically</h3>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>IP address, browser type, operating system</li>
                        <li>Pages visited, time spent, referring URLs</li>
                        <li>Device information and screen resolution</li>
                        <li>Cookies and similar tracking technologies (see our{' '}
                            <a href="/cookie-policy" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">Cookie Policy</a>)
                        </li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">3. How We Use Your Information</h2>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>To operate and maintain the Site</li>
                        <li>To send newsletters and updates (with your consent)</li>
                        <li>To display personalized advertisements via Google AdSense</li>
                        <li>To analyze traffic and improve our content (via Google Analytics, Microsoft Clarity)</li>
                        <li>To respond to your inquiries, DMCA notices, and data requests</li>
                        <li>To comply with legal obligations</li>
                    </ul>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">4. Cookies and Tracking</h2>
                    <p>
                        We use cookies and similar technologies for advertising, analytics, and essential site functionality. You can manage your cookie preferences at any time through our cookie consent banner. For detailed information, see our{' '}
                        <a href="/cookie-policy" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">Cookie Policy</a>.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">5. Third-Party Services</h2>
                    <p>We may share data with the following third-party service providers:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><strong className="text-white">Google AdSense</strong> — for displaying advertisements (Privacy Policy:{' '}
                            <a href="https://policies.google.com/privacy" className="text-[#FFFF00] underline hover:text-white transition-colors" target="_blank" rel="noopener noreferrer">policies.google.com/privacy</a>)
                        </li>
                        <li><strong className="text-white">Google Analytics</strong> — for traffic analysis</li>
                        <li><strong className="text-white">Microsoft Clarity</strong> — for user behavior analytics</li>
                        <li><strong className="text-white">Supabase</strong> — for database hosting</li>
                    </ul>
                    <p>These third parties have their own privacy policies governing the use of your data.</p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">6. Your Data Subject Rights</h2>
                    <p>Depending on your jurisdiction, you may have the following rights:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li><strong className="text-white">Right to Access</strong> — Request a copy of your personal data</li>
                        <li><strong className="text-white">Right to Rectification</strong> — Correct inaccurate data</li>
                        <li><strong className="text-white">Right to Erasure</strong> ("Right to be Forgotten") — Request deletion of your data</li>
                        <li><strong className="text-white">Right to Restrict Processing</strong> — Limit how we use your data</li>
                        <li><strong className="text-white">Right to Data Portability</strong> — Receive your data in a structured format</li>
                        <li><strong className="text-white">Right to Object</strong> — Object to processing based on legitimate interests</li>
                        <li><strong className="text-white">Right to Withdraw Consent</strong> — Withdraw consent at any time</li>
                    </ul>
                    <p>
                        <strong className="text-white">CCPA-Specific Rights:</strong> California residents have the right to know what personal information is collected, to delete it, to opt out of its sale, and to not be discriminated against for exercising these rights.
                    </p>
                    <div className="bg-[#FFFF00] border-4 border-black p-6 my-6 !text-black">
                        <p className="font-inter font-black uppercase text-lg !text-black">
                            <a href="/data-request" className="!text-black hover:!text-gray-700 transition-colors underline">
                                Do Not Sell My Personal Information
                            </a>
                        </p>
                        <p className="text-sm mt-2 !text-black">
                            We do not sell personal information in the traditional sense. However, third-party advertising cookies (such as Google AdSense) may process data for personalized advertising, which may be considered a "sale" under CCPA. You can opt out by managing your cookie preferences.
                        </p>
                    </div>
                    <p>
                        To exercise any of these rights, please visit our{' '}
                        <a href="/data-request" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">Data Request page</a> or email{' '}
                        <a href="mailto:privacy@truthworldnews.com" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">privacy@truthworldnews.com</a>.
                        We will respond within 30 days as required by applicable law.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">7. Data Breach Notification</h2>
                    <p>
                        In the event of a data breach involving your personal information, we will notify affected users and relevant supervisory authorities within <strong className="text-white">72 hours</strong> of becoming aware of the breach, as required by GDPR. However, TRUTHMEDIANETWORKS assumes no liability for damages arising from any data breach beyond what is required by applicable law.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">8. Data Retention</h2>
                    <p>
                        We retain personal data only for as long as necessary to fulfill the purposes outlined in this policy, or as required by law. Newsletter subscription data is retained until you unsubscribe. Analytics data is retained for up to 26 months.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">9. Children's Privacy</h2>
                    <p>
                        Our Site is not intended for children under 13 years of age (or 16 in the EU). We do not knowingly collect personal information from children. If you believe we have inadvertently collected such data, please contact us immediately.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">10. International Data Transfers</h2>
                    <p>
                        Your information may be transferred to and processed in countries outside your jurisdiction. We take appropriate safeguards to ensure your data remains protected in accordance with this policy and applicable law.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">11. Changes to This Policy</h2>
                    <p>
                        We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date. We encourage you to review this policy periodically.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">12. Contact Us</h2>
                    <p>For privacy-related inquiries, contact our Data Protection Officer:</p>
                    <ul className="list-disc pl-6 space-y-1">
                        <li>Email:{' '}
                            <a href="mailto:privacy@truthworldnews.com" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">privacy@truthworldnews.com</a>
                        </li>
                        <li>Operator: TRUTHMEDIANETWORKS</li>
                        <li>Website:{' '}
                            <a href="https://truthworldnews.com" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">truthworldnews.com</a>
                        </li>
                    </ul>
                </section>
            </div>
        </main>
    );
}