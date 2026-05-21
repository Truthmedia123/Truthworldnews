'use client';

import { useState } from 'react';
import { Shield, Send, CheckCircle } from 'lucide-react';

type RequestType = 'access' | 'delete' | 'correct';

export default function DataRequestPage() {
    const [submitted, setSubmitted] = useState(false);
    const [form, setForm] = useState({
        name: '',
        email: '',
        requestType: 'access' as RequestType,
        details: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In production, POST to an API route that emails privacy@truthworldnews.com
        console.log('Data Request:', form);
        setSubmitted(true);
    };

    if (submitted) {
        return (
            <main className="max-w-2xl mx-auto px-6 py-16 min-h-screen text-center">
                <div className="border-4 border-[#FFFF00] bg-black text-white p-12 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
                    <CheckCircle size={48} className="mx-auto text-[#FFFF00] mb-4" />
                    <h1 className="text-3xl font-inter font-black uppercase mb-4">Request Submitted</h1>
                    <p className="text-gray-300 text-lg leading-relaxed">
                        Your data request has been received. We will respond within <strong className="text-[#FFFF00]">30 days</strong> as required by applicable law (GDPR, CCPA, PIPEDA, LGPD, APPI).
                    </p>
                    <p className="text-gray-500 mt-4 text-sm">
                        For urgent inquiries, email{' '}
                        <a href="mailto:privacy@truthworldnews.com" className="text-[#FFFF00] underline">privacy@truthworldnews.com</a>
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="max-w-2xl mx-auto px-6 py-16 min-h-screen">
            <div className="border-b-8 border-black pb-6 mb-12">
                <h1 className="text-5xl md:text-7xl font-inter font-black uppercase tracking-tighter">Data Request</h1>
                <p className="text-gray-500 mt-2 font-bold">GDPR / CCPA / PIPEDA / LGPD / APPI — Exercise Your Rights</p>
            </div>

            <div className="bg-gray-50 border-4 border-black p-6 mb-8">
                <div className="flex items-start gap-3">
                    <Shield size={20} className="text-red-600 shrink-0 mt-0.5" />
                    <div className="text-sm text-gray-600 leading-relaxed space-y-2">
                        <p>
                            Depending on your jurisdiction, you have the right to access, delete, or correct your personal data.
                            We will respond within <strong>30 days</strong> as required by law.
                        </p>
                        <p>
                            <strong>CCPA:</strong> California residents may also opt out of the "sale" of personal information.
                            We do not sell data in the traditional sense, but third-party ad cookies may qualify. Manage your preferences via our{' '}
                            <a href="/cookie-policy" className="text-red-600 underline font-bold">Cookie Policy</a>.
                        </p>
                    </div>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                    <label className="block font-inter font-black uppercase text-sm mb-2">
                        Full Name <span className="text-red-600">*</span>
                    </label>
                    <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-black font-bold text-black outline-none focus:border-[#FFFF00] transition-colors"
                        placeholder="Your full legal name"
                    />
                </div>

                {/* Email */}
                <div>
                    <label className="block font-inter font-black uppercase text-sm mb-2">
                        Email Address <span className="text-red-600">*</span>
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

                {/* Request Type */}
                <div>
                    <label className="block font-inter font-black uppercase text-sm mb-2">
                        Request Type <span className="text-red-600">*</span>
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        {(['access', 'delete', 'correct'] as RequestType[]).map((type) => (
                            <button
                                key={type}
                                type="button"
                                onClick={() => setForm({ ...form, requestType: type })}
                                className={`px-4 py-3 border-2 font-inter font-black uppercase text-sm transition-all ${form.requestType === type
                                        ? 'bg-[#FFFF00] text-black border-black'
                                        : 'bg-white text-black border-black hover:border-[#FFFF00]'
                                    }`}
                            >
                                {type === 'access' && 'Access My Data'}
                                {type === 'delete' && 'Delete My Data'}
                                {type === 'correct' && 'Correct My Data'}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Details */}
                <div>
                    <label className="block font-inter font-black uppercase text-sm mb-2">
                        Additional Details
                    </label>
                    <textarea
                        rows={4}
                        value={form.details}
                        onChange={(e) => setForm({ ...form, details: e.target.value })}
                        className="w-full px-4 py-3 border-2 border-black font-bold text-black outline-none focus:border-[#FFFF00] transition-colors resize-y"
                        placeholder="Describe your request in detail. For correction requests, specify what data is incorrect and what it should be..."
                    />
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="w-full py-4 font-inter font-black uppercase text-lg bg-[#FFFF00] text-black border-4 border-black hover:bg-black hover:text-[#FFFF00] transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 flex items-center justify-center gap-2"
                >
                    <Send size={20} />
                    Submit Data Request
                </button>
            </form>

            <p className="text-gray-400 text-sm mt-6 text-center">
                You may also email your request directly to{' '}
                <a href="mailto:privacy@truthworldnews.com" className="text-red-600 underline font-bold">privacy@truthworldnews.com</a>
            </p>
        </main>
    );
}