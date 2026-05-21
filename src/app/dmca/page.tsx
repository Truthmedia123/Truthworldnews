import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'DMCA Takedown Policy',
    description: 'TruthWorldNews DMCA Copyright Takedown Policy and designated agent information.',
};

export default function DMCAPage() {
    return (
        <main className="max-w-4xl mx-auto px-6 py-16 min-h-screen text-gray-200">
            <div className="border-b-8 border-white/20 pb-6 mb-12">
                <h1 className="text-6xl md:text-8xl font-inter font-black uppercase tracking-tighter text-white">DMCA Policy</h1>
                <p className="text-gray-400 mt-4 font-bold">Digital Millennium Copyright Act — Takedown Policy</p>
            </div>

            <div className="legal-content prose prose-lg max-w-none font-serif text-lg leading-relaxed space-y-8">
                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">1. Copyright Infringement Notification</h2>
                    <p>
                        TruthWorldNews, operated by <strong className="text-white">TRUTHMEDIANETWORKS</strong>, respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998 (DMCA), we will respond expeditiously to claims of copyright infringement committed using our Site.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">2. Designated DMCA Agent</h2>
                    <div className="bg-zinc-900 text-white p-8 border-4 border-[#FFFF00] my-8">
                        <p className="font-inter font-black uppercase text-sm tracking-widest text-[#FFFF00] mb-2">Designated Agent</p>
                        <p className="text-2xl font-inter font-black break-all">
                            <a href="mailto:dmca@truthworldnews.com" className="text-white hover:text-[#FFFF00] transition-colors underline decoration-[#FFFF00] decoration-2 underline-offset-4">
                                dmca@truthworldnews.com
                            </a>
                        </p>
                        <p className="text-sm text-gray-400 mt-4">
                            TRUTHMEDIANETWORKS has designated a DMCA agent at the above email address. While we are not formally registered with the US Copyright Office, we will respond to valid DMCA takedown notices within <strong className="text-white">72 hours</strong>. For US safe harbor immunity under 17 U.S.C. § 512, formal registration with the Copyright Office is required; however, we will comply with DMCA procedures to the best of our ability.
                        </p>
                    </div>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">3. Filing a DMCA Takedown Notice</h2>
                    <p>
                        To file a DMCA takedown notice, you must provide a written communication that includes substantially the following:
                    </p>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>A physical or electronic signature of the copyright owner or a person authorized to act on their behalf.</li>
                        <li>Identification of the copyrighted work claimed to have been infringed.</li>
                        <li>Identification of the material that is claimed to be infringing, including the URL(s) where it appears on our Site.</li>
                        <li>Your contact information: name, address, telephone number, and email address.</li>
                        <li>A statement that you have a good faith belief that use of the material is not authorized by the copyright owner, its agent, or the law.</li>
                        <li>A statement, under penalty of perjury, that the information in the notification is accurate and that you are authorized to act on behalf of the copyright owner.</li>
                    </ol>
                    <a
                        href="/dmca/form"
                        className="block w-full bg-[#FFFF00] border-4 border-black p-6 my-6 font-inter font-black uppercase !text-black text-center text-lg hover:bg-white hover:!text-black transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                    >
                        Use our DMCA Takedown Form →
                    </a>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">4. Counter-Notification</h2>
                    <p>
                        If you believe that material you posted was removed in error, you may file a counter-notification containing:
                    </p>
                    <ol className="list-decimal pl-6 space-y-2">
                        <li>Your physical or electronic signature.</li>
                        <li>Identification of the material that was removed and its location before removal.</li>
                        <li>A statement under penalty of perjury that you have a good faith belief the material was removed as a result of mistake or misidentification.</li>
                        <li>Your name, address, and telephone number, and a statement consenting to the jurisdiction of the federal court in your district.</li>
                    </ol>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">5. Repeat Infringers</h2>
                    <p>
                        In accordance with the DMCA, we will terminate the accounts of users who are determined to be repeat infringers.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-inter font-black uppercase border-l-8 border-[#FFFF00] pl-4 text-white">6. Contact</h2>
                    <p>
                        All DMCA-related correspondence should be directed to:{' '}
                        <a href="mailto:dmca@truthworldnews.com" className="text-[#FFFF00] underline font-bold hover:text-white transition-colors">dmca@truthworldnews.com</a>
                    </p>
                </section>
            </div>
        </main>
    );
}