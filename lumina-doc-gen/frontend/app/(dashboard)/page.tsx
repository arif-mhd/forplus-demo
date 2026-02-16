"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Plus, FileText, ArrowRight, Clock } from 'lucide-react';

import InvoiceCreationOptions from '../../src/components/InvoiceCreationOptions';
import AIPromptPage from '../../src/components/AIPromptPage';

type ViewState = 'dashboard' | 'options' | 'ai';

export default function DashboardPage() {
    const [view, setView] = useState<ViewState>('dashboard');
    const router = useRouter();

    const recentDocs = [
        { id: 1, name: 'Invoice #001 - Acme Corp', date: '2 hours ago', type: 'Invoice', status: 'Draft' },
        { id: 2, name: 'Quote_ProjectX_Final', date: 'Yesterday', type: 'Quote', status: 'Sent' },
        { id: 3, name: 'Consulting Agreement v2', date: '3 days ago', type: 'Contract', status: 'Archived' },
    ];

    const handleGenerateInvoice = (prompt: string) => {
        // For now, redirect to editor with a query param (or logic to handle AI generation later)
        console.log("Generating invoice from prompt:", prompt);
        router.push('/editor/invoice?ai=true&prompt=' + encodeURIComponent(prompt));
    };

    // --- View: Invoice Options ---
    if (view === 'options') {
        return (
            <div className="p-8 lg:p-12">
                <InvoiceCreationOptions
                    onBack={() => setView('dashboard')}
                    onSelectOption={(option) => {
                        if (option === 'template') router.push('/templates');
                        else if (option === 'ai') setView('ai');
                        else if (option === 'custom') router.push('/editor/custom');
                    }}
                />
            </div>
        );
    }

    // --- View: AI Prompt ---
    if (view === 'ai') {
        return (
            <div className="p-8 lg:p-12">
                <AIPromptPage
                    onBack={() => setView('options')}
                    onGenerate={handleGenerateInvoice}
                />
            </div>
        );
    }

    // --- View: Dashboard (Default) ---
    return (
        <div className="p-8 lg:p-12 max-w-7xl mx-auto animate-in fade-in duration-500">

            {/* Hero Section */}
            <div className="mb-12">
                <h1 className="text-3xl font-bold text-white mb-2">Welcome back, User</h1>
                <p className="text-gray-400">What would you like to create today?</p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-4xl">
                <button
                    onClick={() => setView('options')}
                    className="group relative p-6 bg-gradient-to-br from-indigo-600/20 to-blue-600/20 border border-indigo-500/30 rounded-2xl hover:bg-indigo-600/30 transition-all text-left"
                >
                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center text-white mb-4 shadow-lg shadow-indigo-500/20 group-hover:scale-110 transition-transform">
                        <Plus size={24} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">New Invoice</h3>
                    <p className="text-sm text-indigo-200/60">Create a professional invoice asking for payment.</p>
                </button>

                <Link
                    href="/editor/quote"
                    className="group relative p-6 bg-[#111] border border-white/10 rounded-2xl hover:bg-[#161616] transition-all text-left hover:border-emerald-500/30"
                >
                    <div className="w-12 h-12 bg-emerald-900/40 text-emerald-400 rounded-lg flex items-center justify-center mb-4 border border-emerald-500/20 group-hover:scale-110 transition-transform">
                        <FileText size={20} />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-1">New Quote</h3>
                    <p className="text-sm text-gray-500">Send a quotation for approved work.</p>
                </Link>
            </div>

            {/* Recent Documents */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                        <Clock size={16} className="text-gray-500" /> Recent Documents
                    </h2>
                    <button className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
                </div>

                <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
                    {recentDocs.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center text-gray-400 group-hover:text-white transition-colors">
                                    <FileText size={18} />
                                </div>
                                <div>
                                    <div className="text-sm font-medium text-white">{doc.name}</div>
                                    <div className="text-xs text-gray-500">{doc.date} • {doc.type}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="px-2 py-1 bg-white/5 rounded text-[10px] text-gray-400 uppercase tracking-wider">{doc.status}</div>
                                <ArrowRight size={16} className="text-gray-600 group-hover:text-indigo-400 transition-colors" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    );
}
