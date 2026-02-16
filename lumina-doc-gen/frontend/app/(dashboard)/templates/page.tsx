"use client";

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';

// Mini Preview Component
const TemplatePreview = ({ type, color }: { type: string, color: string }) => {
    // Shared base styles
    const baseClass = "w-full h-full bg-white text-[4px] p-2 flex flex-col overflow-hidden select-none pointer-events-none";

    if (type === 'modern') {
        return (
            <div className={`${baseClass} font-sans`}>
                <div className="flex justify-between items-start mb-2 pb-1 border-b" style={{ borderColor: color }}>
                    <div className="font-bold text-[6px] uppercase" style={{ color: color }}>Acme Corp</div>
                    <div className="text-right">
                        <div className="font-bold text-[5px]">INVOICE</div>
                        <div className="text-gray-400">#001</div>
                    </div>
                </div>
                <div className="flex gap-2 mb-2">
                    <div className="w-1/2 space-y-1">
                        <div className="w-8 h-0.5 bg-gray-200 rounded"></div>
                        <div className="w-12 h-0.5 bg-gray-100 rounded"></div>
                    </div>
                    <div className="w-1/2 space-y-1">
                        <div className="w-6 h-0.5 bg-gray-200 rounded"></div>
                        <div className="w-10 h-0.5 bg-gray-100 rounded"></div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="bg-gray-50 p-0.5 mb-0.5 font-bold text-gray-500 flex justify-between">
                        <span>Item</span>
                        <span>Total</span>
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between py-0.5 border-b border-gray-50">
                            <div className="w-10 h-0.5 bg-gray-200 rounded"></div>
                            <div className="w-3 h-0.5 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="mt-1 text-right font-bold" style={{ color: color }}>
                    $1,200.00
                </div>
            </div>
        );
    }

    if (type === 'classic') {
        return (
            <div className={`${baseClass} font-serif`}>
                <div className="text-center mb-2">
                    <div className="font-bold text-[6px] mb-0.5">Acme Corp</div>
                    <div className="text-gray-400 italic text-[3px]">Excellence since 1990</div>
                </div>
                <div className="border-t border-b border-gray-200 py-1 mb-2 flex justify-between">
                    <div>
                        <div className="font-bold">Bill To:</div>
                        <div className="w-8 h-0.5 bg-gray-200 mt-0.5"></div>
                    </div>
                    <div className="text-right">
                        <div><span className="font-bold">Date:</span> 2024-01-01</div>
                    </div>
                </div>
                <div className="flex-1">
                    <table className="w-full text-left table-fixed">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="p-0.5">Desc</th>
                                <th className="p-0.5 text-right">Amt</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2].map(i => (
                                <tr key={i} className="border-b border-gray-100">
                                    <td className="p-0.5"><div className="w-full h-0.5 bg-gray-200"></div></td>
                                    <td className="p-0.5 text-right"><div className="w-4 h-0.5 bg-gray-200 ml-auto"></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        );
    }

    if (type === 'bold') {
        return (
            <div className={`${baseClass} font-sans`}>
                <div className="mb-2 p-1 -m-1 text-white" style={{ backgroundColor: color }}>
                    <div className="font-black text-[6px] tracking-tighter">INVOICE</div>
                    <div className="opacity-80 text-[4px]">Acme Corp</div>
                </div>
                <div className="flex justify-between mb-3">
                    <div className="space-y-0.5">
                        <div className="font-bold text-gray-400 uppercase">To</div>
                        <div className="w-8 h-0.5 bg-gray-800 rounded"></div>
                    </div>
                </div>
                <div className="space-y-0.5">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between p-0.5 bg-gray-50 rounded">
                            <div className="w-8 h-0.5 bg-gray-300"></div>
                            <div className="w-3 h-0.5 bg-gray-800"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'minimal') {
        return (
            <div className={`${baseClass} font-sans text-gray-500`}>
                <div className="flex justify-between items-end mb-4">
                    <div className="font-light text-[5px] lowercase">invoice #001</div>
                    <div className="font-bold text-black text-[5px]">Acme Corp</div>
                </div>
                <div className="grid grid-cols-2 gap-2 mb-4">
                    <div className="h-0.5 w-6 bg-gray-300"></div>
                    <div className="h-0.5 w-6 bg-gray-300 place-self-end"></div>
                </div>
                <div className="space-y-1">
                    {[1, 2].map(i => (
                        <div key={i} className="flex justify-between border-b border-gray-100 py-1">
                            <div className="w-8 h-0.5 bg-gray-200"></div>
                            <div className="w-2 h-0.5 bg-black"></div>
                        </div>
                    ))}
                </div>
                <div className="mt-4 border-t border-black pt-2 flex justify-end gap-2 items-baseline">
                    <span className="text-[3px]">Total</span>
                    <span className="text-[6px] text-black font-light">$1200</span>
                </div>
            </div>
        );
    }

    if (type === 'executive') {
        return (
            <div className={`${baseClass} font-serif bg-gray-50`}>
                <div className="bg-gray-900 p-2 mb-2 text-white flex justify-between items-center">
                    <div className="font-bold text-[5px] tracking-widest text-yellow-500">EXECUTIVE</div>
                    <div className="text-[3px] text-gray-400">#001</div>
                </div>
                <div className="pl-2 border-l border-yellow-500 mb-4">
                    <div className="font-bold text-[5px]">John Doe</div>
                </div>
                <div className="flex-1 px-2">
                    <div className="flex justify-between border-b border-gray-200 py-1">
                        <div className="w-10 h-0.5 bg-gray-300"></div>
                        <div className="w-4 h-0.5 bg-gray-600"></div>
                    </div>
                    <div className="flex justify-between border-b border-gray-200 py-1">
                        <div className="w-8 h-0.5 bg-gray-300"></div>
                        <div className="w-3 h-0.5 bg-gray-600"></div>
                    </div>
                </div>
                <div className="mt-2 bg-white p-2 border-t border-gray-200 text-right">
                    <div className="font-bold text-[6px]">$1,200</div>
                </div>
            </div>
        );
    }

    if (type === 'tech') {
        return (
            <div className={`${baseClass} font-mono bg-white`}>
                <div className="border-b border-black pb-1 mb-2 flex justify-between items-end">
                    <div className="text-[4px] font-bold">Acme_Corp</div>
                    <div className="bg-black text-white px-1 text-[3px]">STATUS: OK</div>
                </div>
                <div className="mb-2 border-b border-dashed border-black pb-2">
                    <div className="text-[3px] text-gray-500">// CLIENT</div>
                    <div className="text-[4px]">Target_Sys</div>
                </div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="text-[3px] text-gray-400">01 item_a</span>
                        <span className="text-[3px] font-bold">100.00</span>
                    </div>
                    <div className="flex justify-between mb-1">
                        <span className="text-[3px] text-gray-400">02 item_b</span>
                        <span className="text-[3px] font-bold">50.00</span>
                    </div>
                </div>
                <div className="border-t border-black pt-1 mt-1 text-right">
                    <div className="text-[3px] text-gray-500">NET_TOTAL</div>
                    <div className="font-bold text-[5px]">$150.00</div>
                </div>
            </div>
        );
    }

    if (type === 'creative') {
        return (
            <div className={`${baseClass} font-sans bg-pink-50 relative overflow-hidden`}>
                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-200 rounded-full -mr-10 -mt-10 blur-xl"></div>
                <div className="mb-2 p-1 relative z-10">
                    <div className="font-black text-[6px] text-purple-600">CREATIVE</div>
                </div>
                <div className="bg-white rounded-lg p-2 shadow-sm text-[3px]">
                    <div className="flex justify-between mb-2">
                        <div className="font-bold text-gray-800">Client Name</div>
                        <div className="text-pink-500 font-bold">$1,200.00</div>
                    </div>
                    <div className="space-y-1">
                        <div className="w-full h-1 bg-gray-100 rounded-full"></div>
                        <div className="w-2/3 h-1 bg-gray-100 rounded-full"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (type === 'legal') {
        return (
            <div className={`${baseClass} font-serif bg-white text-black`}>
                <div className="text-center font-bold uppercase text-[4px] border-b border-black pb-1 mb-2">
                    Legal Statement
                </div>
                <div className="text-[3px] text-justify leading-tight">
                    <div className="mb-2">
                        Re: Professional Services Rendered
                    </div>
                    <div className="pl-1 border-l border-black mb-1">
                        1. Consultation regarding matter... $500
                    </div>
                    <div className="pl-1 border-l border-black">
                        2. Drafting of documents... $700
                    </div>
                </div>
                <div className="mt-auto border-t-2 border-black pt-1 flex justify-between font-bold text-[4px]">
                    <span>TOTAL</span>
                    <span>$1,200.00</span>
                </div>
            </div>
        );
    }

    // Fallback for custom or unknown
    return (
        <div className={`${baseClass} flex items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200`}>
            <span className="text-gray-300 text-[6px] font-bold">+</span>
        </div>
    );
}

const templates = [
    {
        id: 'custom',
        name: 'Custom Canvas',
        description: 'Start from a blank slate with our drag-and-drop builder.',
        colorValue: '#6366f1' // Indigo
    },
    {
        id: 'modern',
        name: 'Modern Clean',
        description: 'Minimalist design with bold headers and clear typography.',
        colorValue: '#10b981' // Emerald
    },
    {
        id: 'classic',
        name: 'Corporate Classic',
        description: 'Traditional serif fonts and formal layout structure.',
        colorValue: '#2563eb' // Blue
    },
    {
        id: 'bold',
        name: 'Bold Impact',
        description: 'High contrast design ideal for digital invoices.',
        colorValue: '#9333ea' // Purple
    },
    {
        id: 'minimal',
        name: 'Minimalist Air',
        description: 'Ultra-clean layout with plenty of whitespace and light typography.',
        colorValue: '#000000' // Black
    },
    {
        id: 'executive',
        name: 'Executive Suite',
        description: 'Premium serif typography with gold accents for high-value clients.',
        colorValue: '#ca8a04' // Yellow-600
    },
    {
        id: 'tech',
        name: 'Tech Terminal',
        description: 'Monospaced, grid-based layout inspired by code editors and terminals.',
        colorValue: '#525252' // Neutral-600
    },
    {
        id: 'creative',
        name: 'Creative Studio',
        description: 'Vibrant gradients and rounded aesthetics for agencies and artists.',
        colorValue: '#db2777' // Pink-600
    },
    {
        id: 'legal',
        name: 'Legal Brief',
        description: 'Strict, dense, professional formatting for law firms and contracts.',
        colorValue: '#1c1917' // Stone-900
    }
];

export default function TemplatesPage() {
    const router = useRouter();

    return (
        <div className="p-8 lg:p-12 animate-in fade-in duration-500">

            {/* Navigation Buttons */}
            <div className="flex items-center gap-4 mb-8">
                <button
                    onClick={() => router.push('/')}
                    className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
                >
                    <LayoutDashboard size={16} />
                    Dashboard
                </button>
                <div className="h-6 w-px bg-white/10"></div>
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-white/10 rounded-lg text-sm text-gray-400 hover:text-white hover:border-white/20 transition-all"
                >
                    <ArrowLeft size={16} />
                    Back
                </button>
            </div>

            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Template Gallery</h2>
                <p className="text-gray-400">Choose a starting point for your document.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                    <Link
                        key={template.id}
                        href={template.id === 'custom' ? '/editor/custom' : `/editor/${template.id}`}
                        className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
                    >
                        {/* Live Preview Area */}
                        <div className="aspect-[3/4] bg-[#0f0f0f] relative overflow-hidden p-6 flex items-center justify-center">
                            <div className="w-full h-full shadow-2xl transform group-hover:scale-105 transition-transform duration-500 origin-center">
                                <TemplatePreview type={template.id} color={template.colorValue} />
                            </div>

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <span className={template.id === 'custom'
                                    ? "bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                    : "bg-white text-black px-6 py-2 rounded-full font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform"
                                }>
                                    {template.id === 'custom' ? 'Start Blank' : 'Use Template'}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 border-t border-white/5 bg-[#141414] mt-auto relative z-10">
                            <h3 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{template.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
