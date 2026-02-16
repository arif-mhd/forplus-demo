import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Send } from 'lucide-react';

interface AIPromptPageProps {
    onBack: () => void;
    onGenerate: (prompt: string) => void;
}

export default function AIPromptPage({ onBack, onGenerate }: AIPromptPageProps) {
    const [prompt, setPrompt] = useState('');
    const [isThinking, setIsThinking] = useState(false);

    const handleSubmit = () => {
        if (!prompt.trim()) return;
        setIsThinking(true);
        // Simulate "thinking" delay before actually calling the parent handler
        setTimeout(() => {
            setIsThinking(false);
            onGenerate(prompt);
        }, 1500);
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
            >
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                <span className="text-sm font-medium">Back to Options</span>
            </button>

            <div className="bg-[#111] border border-white/10 rounded-3xl p-1 md:p-12 overflow-hidden relative">
                {/* Background Glow */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

                <div className="relative z-10">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-indigo-500/20">
                        <Sparkles size={32} className="text-white" />
                    </div>

                    <h1 className="text-3xl font-bold text-white mb-4">Describe your invoice</h1>
                    <p className="text-gray-400 mb-8 max-w-xl">
                        Just tell us who it's for, what you sold, and how much it costs.
                        We'll format it perfectly for you.
                    </p>

                    <div className="relative mb-6">
                        <textarea
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g. Create an invoice for John Doe for web design services. 10 hours at $50/hr, plus a $100 server setup fee. Due in 7 days."
                            className="w-full h-48 bg-black/20 border border-white/10 rounded-xl p-6 text-lg text-white placeholder:text-gray-600 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all resize-none"
                        />
                        <div className="absolute bottom-4 right-4 text-xs text-gray-600">
                            {prompt.length} chars
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            AI Ready
                        </div>

                        <button
                            onClick={handleSubmit}
                            disabled={!prompt.trim() || isThinking}
                            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-white transition-all transform ${!prompt.trim() || isThinking
                                    ? 'bg-gray-800 text-gray-500 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:scale-105 shadow-lg shadow-indigo-500/25'
                                }`}
                        >
                            {isThinking ? (
                                <>
                                    <Sparkles size={18} className="animate-spin" />
                                    Generating...
                                </>
                            ) : (
                                <>
                                    Generate Invoice
                                    <Send size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Examples */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    "Invoice for freelance writing, 5 articles at $200 each...",
                    "Bill to Acme Corp for Q1 Consultation, $5000 fixed fee...",
                    "Plumbing services: Pipe repair $150, Parts $45..."
                ].map((example, i) => (
                    <button
                        key={i}
                        onClick={() => setPrompt(example)}
                        className="p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 text-left text-xs text-gray-400 hover:text-white transition-colors"
                    >
                        "{example}"
                    </button>
                ))}
            </div>
        </div>
    );
}
