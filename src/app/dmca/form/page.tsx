'use client';

import { useState } from 'react';
import { Shield, Send, CheckCircle } from 'lucide-react';

export default function DMCAFormPage() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        copyrightedWork: '',
        infringingUrl: '',
        signature: false,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, this would POST to an API route that emails dmca@truthworldnews.com
        console.log('DMCA Takedown Request:', form);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <main className="max-w-2xl mx-auto px-6 py-16 min-h-screen text-center">
                <div className="border-4 border-[#FFFF00] bg-black text-white p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <CheckCircle size={48} className="mx-auto text-[#FFFF00] mb-4" />
                    <h1 className="text-3xl font-inter font-black uppercase mb-4">Notice Submitted</h1>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Your DMCA takedown notice has been received. Our designated agent will review it and respond within <strong className="text-[#FFFF00]">72 hours</strong>.
                    </p>
                    <p className="text-gray-500 mt-4 text-sm">
                        If you need immediate assistance, email{' '}
                        <a href="mailto:dmca@truthworldnews.com" className="text-[#FFFF00] underline">dmca@truthworldnews.com</a>
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto px-6 py-16 min-h-screen">
            <div className="border-b-8 border-black pb-6 mb-12">
                <h1 className="text-5xl md:text-7xl font-inter font-black uppercase tracking-tighter">DMCA Takedown</h1>
                <p className="text-gray-500 mt-2 font-bold">Submit a formal copyright infringement notice</p>
            </div>

            <div className="bg-gray-50 border-4 border-black p-6 mb-8">
                <div className="flex items-start gap-3">
                    <Shield size={20} className="text-red-600 shrink-0 mt-0.5" />
                    <p className="text-sm text-gray-600 leading-relaxed">
                        <strong>Important:</strong> This form constitutes a formal legal notice. By submitting, you declare under penalty of perjury that the information provided is accurate and that you are authorized to act on behalf of the copyright owner. False claims may result in legal liability.
                    </p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                    <label className="block font-inter font-black uppercase text-sm mb-2">
                        Your Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-black font-bold text-black outline-none focus:border-[#FFFF00] transition-colors"
                        placeholder="John Doe"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block font-inter font-black uppercase text-sm mb-2">
                        Contact Email <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-black font-bold text-black outline-none focus:border-[#FFFF00] transition-colors"
                        placeholder="you@example.com"
                    />
                </div>

                {/* Copyrighted Work */}
                <div>
                    <label className="block font-inter font-black uppercase text-sm mb-2">
                        Description of Copyrighted Work <span className="text-red-600">*</span>
                    </label>
                    <textarea
                        required
                        rows={3}
                        value={form.copyrightedWork}
                        onChange={(e) => setForm({ ...form, copyrightedWork: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-black font-bold text-black outline-none focus:border-[#FFFF00] transition-colors resize-y"
                        placeholder="Describe the original copyrighted work (title, URL, registration number if applicable)..."
                    />
                </div>

                {/* Infringing URL */}
                <div>
                    <label className="block font-inter font-black uppercase text-sm mb-2">
                        URL of Infringing Content <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="url"
                        required
                        value={form.infringingUrl}
                        onChange={(e) => setForm({ ...form, infringingUrl: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-black font-bold text-black outline-none focus:border-[#FFFF00] transition-colors"
                        placeholder="https://truthworldnews.com/article/..."
                    />
                </div>

                {/* Signature Checkbox */}
                <div className="border-2 border-black p-4 bg-white">
                    <label className="flex items-start gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            required
                            checked={form.signature}
                            onChange={(e) => setForm({ ...form, signature: e.target.checked })}
                            className="mt-1 w-5 h-5 border-2 border-black accent-[#FFFF00]"
                        />
                        <span className="text-sm text-gray-700 leading-relaxed">
                            I hereby declare, under penalty of perjury, that I am the copyright owner or am authorized to act on behalf of the owner of an exclusive right that is allegedly infringed. I have a good faith belief that the use of the material in the manner complained of is not authorized by the copyright owner, its agent, or the law. This electronic signature carries the same legal weight as a physical signature.
                        </span>
                    </label>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full py-4 font-inter font-black uppercase text-lg bg-[#FFFF00] text-black border-4 border-black hover:bg-black hover:text-[#FFFF00] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2"
                >
                    <Send size={20} />
                    Submit Takedown Notice
                </button>
            </form>

            <p className="text-gray-400 text-sm mt-6 text-center">
                You may also email your notice directly to{' '}
                <a href="mailto:dmca@truthworldnews.com" className="text-red-600 underline font-bold">dmca@truthworldnews.com</a>
            </p>
        </main>
    );
}