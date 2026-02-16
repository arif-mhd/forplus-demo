import React from 'react';
import { FileText, Sparkles, PenTool, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface InvoiceCreationOptionsProps {
    onSelectOption: (option: 'template' | 'ai' | 'custom') => void;
    onBack: () => void;
}

export default function InvoiceCreationOptions({ onSelectOption, onBack }: InvoiceCreationOptionsProps) {
    return (
        <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <button
                onClick={onBack}
                className="flex items-center gap-2 text-gray-400 hover:text-white mb-8 transition-colors group"
            >
                <div className="p-2 bg-white/5 rounded-full group-hover:bg-white/10 transition-colors">
                    <ArrowLeft size={16} />
                </div>
                <span className="text-sm font-medium">Back to Dashboard</span>
            </button>

            <div className="text-center mb-12">
                <h1 className="text-3xl font-bold text-white mb-3">How would you like to start?</h1>
                <p className="text-gray-400">Choose the best way to create your invoice.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Option 1: Template */}
                <button
                    onClick={() => onSelectOption('template')}
                    className="group relative p-8 bg-[#111] border border-white/10 rounded-3xl text-left hover:bg-[#161616] hover:border-indigo-500/30 transition-all hover:-translate-y-1"
                >
                    <div className="w-14 h-14 bg-indigo-500/10 text-indigo-400 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-indigo-500/20 group-hover:scale-110 transition-transform duration-300">
                        <FileText size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Use a Template</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                        Start with a professional, pre-designed template and fill in your details manually. Perferct for standard invoices.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-400 group-hover:translate-x-1 transition-transform">
                        Select Template <ArrowLeft size={16} className="rotate-180" />
                    </div>
                </button>

                {/* Option 2: AI */}
                <button
                    onClick={() => onSelectOption('ai')}
                    className="group relative p-8 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-3xl text-left hover:from-indigo-900/30 hover:to-purple-900/30 transition-all hover:-translate-y-1"
                >
                    <div className="absolute inset-0 bg-indigo-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="w-14 h-14 bg-gradient-to-br from-indigo-500 to-purple-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform duration-300 relative z-10">
                        <Sparkles size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2 relative z-10">Create with AI</h3>
                    <p className="text-sm text-indigo-200/70 leading-relaxed mb-6 relative z-10">
                        Describe your invoice in plain English, and our AI will generate it for you instantly. Ideal for quick, automated creation.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-indigo-300 group-hover:translate-x-1 transition-transform relative z-10">
                        Try AI Generator <ArrowLeft size={16} className="rotate-180" />
                    </div>
                </button>

                {/* Option 3: Custom/Blank */}
                <Link
                    href="/editor/custom"
                    className="group relative p-8 bg-[#111] border border-white/10 rounded-3xl text-left hover:bg-[#161616] hover:border-gray-500/30 transition-all hover:-translate-y-1 block"
                >
                    <div className="w-14 h-14 bg-gray-800/30 text-gray-400 rounded-2xl flex items-center justify-center mb-6 ring-1 ring-white/5 group-hover:scale-110 transition-transform duration-300">
                        <PenTool size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">Start from Scratch</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-6">
                        Build your own custom invoice layout using our drag-and-drop editor. Best for unique designs.
                    </p>
                    <div className="flex items-center gap-2 text-sm font-medium text-gray-500 group-hover:text-white group-hover:translate-x-1 transition-all">
                        Open Editor <ArrowLeft size={16} className="rotate-180" />
                    </div>
                </Link>
            </div>
        </div>
    );
}
