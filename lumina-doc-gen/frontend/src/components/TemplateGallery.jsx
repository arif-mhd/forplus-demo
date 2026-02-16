import React from 'react';
import { Check } from 'lucide-react';

// Mini Preview Component
const TemplatePreview = ({ type, color }) => {
    // Shared base styles
    const baseClass = "w-full h-full bg-white text-[4px] p-3 flex flex-col overflow-hidden select-none pointer-events-none";

    if (type === 'modern') {
        return (
            <div className={`${baseClass} font-sans`}>
                <div className="flex justify-between items-start mb-4 pb-2 border-b" style={{ borderColor: color }}>
                    <div className="font-bold text-[6px] uppercase" style={{ color: color }}>Acme Corp</div>
                    <div className="text-right">
                        <div className="font-bold text-[5px]">INVOICE</div>
                        <div className="text-gray-400">#001</div>
                    </div>
                </div>
                <div className="flex gap-4 mb-4">
                    <div className="w-1/2 space-y-1">
                        <div className="w-10 h-1 bg-gray-200 rounded"></div>
                        <div className="w-16 h-1 bg-gray-100 rounded"></div>
                    </div>
                    <div className="w-1/2 space-y-1">
                        <div className="w-8 h-1 bg-gray-200 rounded"></div>
                        <div className="w-12 h-1 bg-gray-100 rounded"></div>
                    </div>
                </div>
                <div className="flex-1">
                    <div className="bg-gray-50 p-1 mb-1 font-bold text-gray-500 flex justify-between">
                        <span>Item</span>
                        <span>Total</span>
                    </div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between py-1 border-b border-gray-50">
                            <div className="w-12 h-1 bg-gray-200 rounded"></div>
                            <div className="w-4 h-1 bg-gray-200 rounded"></div>
                        </div>
                    ))}
                </div>
                <div className="mt-2 text-right font-bold" style={{ color: color }}>
                    $1,200.00
                </div>
            </div>
        );
    }

    if (type === 'classic') {
        return (
            <div className={`${baseClass} font-serif`}>
                <div className="text-center mb-4">
                    <div className="font-bold text-[8px] mb-1">Acme Corp</div>
                    <div className="text-gray-400 italic">Excellence since 1990</div>
                </div>
                <div className="border-t border-b border-gray-200 py-2 mb-4 flex justify-between">
                    <div>
                        <div className="font-bold">Bill To:</div>
                        <div className="w-10 h-1 bg-gray-200 mt-1"></div>
                    </div>
                    <div className="text-right">
                        <div><span className="font-bold">Date:</span> 2024-01-01</div>
                        <div><span className="font-bold">Inv #:</span> 001</div>
                    </div>
                </div>
                <div className="flex-1">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-gray-600">
                            <tr>
                                <th className="p-1">Description</th>
                                <th className="p-1 text-right">Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {[1, 2].map(i => (
                                <tr key={i} className="border-b border-gray-100">
                                    <td className="p-1"><div className="w-16 h-1 bg-gray-200"></div></td>
                                    <td className="p-1 text-right"><div className="w-6 h-1 bg-gray-200 ml-auto"></div></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="mt-2 pt-2 border-t-2 border-double border-gray-300 text-right font-bold text-[6px]">
                    Total: $1,200.00
                </div>
            </div>
        );
    }

    if (type === 'bold') {
        return (
            <div className={`${baseClass} font-sans`}>
                <div className="mb-4 p-3 -m-3 mb-4 text-white" style={{ backgroundColor: color }}>
                    <div className="font-black text-[10px] tracking-tighter">INVOICE</div>
                    <div className="opacity-80">Acme Corp</div>
                </div>
                <div className="flex justify-between mb-6">
                    <div className="space-y-1">
                        <div className="font-bold text-gray-400 uppercase">To</div>
                        <div className="w-12 h-1 bg-gray-800 rounded"></div>
                    </div>
                    <div className="text-right space-y-1">
                        <div className="font-bold text-gray-400 uppercase">Total Due</div>
                        <div className="font-black text-[8px]">$1,200.00</div>
                    </div>
                </div>
                <div className="space-y-1">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="flex justify-between p-1 bg-gray-50 rounded">
                            <div className="w-10 h-1 bg-gray-300"></div>
                            <div className="w-4 h-1 bg-gray-800"></div>
                        </div>
                    ))}
                </div>
                <div className="mt-auto pt-4 flex justify-between items-center text-white p-2 -m-3 mt-4" style={{ backgroundColor: '#000' }}>
                    <span>acme.com</span>
                </div>
            </div>
        );
    }

    return null;
}

const templates = [
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
    }
];

export default function TemplateGallery({ onSelect }) {
    return (
        <div className="p-8 lg:p-12 animate-in fade-in duration-500">
            <div className="mb-8">
                <h2 className="text-3xl font-bold text-white mb-2">Template Gallery</h2>
                <p className="text-gray-400">Choose a starting point for your document.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {templates.map((template) => (
                    <div
                        key={template.id}
                        onClick={() => onSelect(template.id)}
                        className="group relative bg-[#111] border border-white/5 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all cursor-pointer hover:shadow-2xl hover:shadow-indigo-500/10 flex flex-col"
                    >
                        {/* Live Preview Area */}
                        <div className="aspect-[3/4] bg-[#0f0f0f] relative overflow-hidden p-6 flex items-center justify-center">
                            <div className="w-full h-full shadow-2xl transform group-hover:scale-105 transition-transform duration-500 origin-center">
                                <TemplatePreview type={template.id} color={template.colorValue} />
                            </div>

                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <span className="bg-indigo-600 text-white px-6 py-2 rounded-full font-semibold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform">
                                    Select Template
                                </span>
                            </div>
                        </div>

                        <div className="p-5 border-t border-white/5 bg-[#141414] mt-auto relative z-10">
                            <h3 className="font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{template.name}</h3>
                            <p className="text-xs text-gray-500 line-clamp-2">{template.description}</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
