
"use client";
import React from 'react';
import { Send, MapPin, Calendar, Hash, Image as ImageIcon, FileText } from 'lucide-react';

export function InvoiceEditor({ settings, onUpdate }) {
    const handleChange = (field, value) => {
        onUpdate({ ...settings, [field]: value });
    };

    return (
        <div className="bg-white p-6 rounded-2xl border border-zinc-200 space-y-6 shadow-sm">
            <h3 className="text-lg font-black text-black flex items-center gap-2 border-b border-zinc-100 pb-4 uppercase tracking-tighter">
                <FileText className="text-black" size={20} />
                RFQ Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column: Branding & Meta */}
                <div className="space-y-4">
                    {/* Logo URL Input Removed as per user request - using default FORPLUS branding */}

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Hash size={14} className="text-zinc-300" /> RFQ Reference #
                            </label>
                            <input
                                type="text"
                                value={settings.invoiceNumber || ''}
                                onChange={(e) => handleChange('invoiceNumber', e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-black focus:border-black focus:outline-none transition-all font-bold"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Calendar size={14} className="text-zinc-300" /> Date
                            </label>
                            <input
                                type="date"
                                value={settings.date || ''}
                                onChange={(e) => handleChange('date', e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-black focus:border-black focus:outline-none transition-all font-bold"
                            />
                        </div>
                    </div>
                </div>

                {/* Right Column: Addresses */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <MapPin size={14} className="text-zinc-300" /> Sender Address (From)
                        </label>
                        <textarea
                            rows={3}
                            value={settings.senderAddress || ''}
                            onChange={(e) => handleChange('senderAddress', e.target.value)}
                            placeholder="Your Company Name&#10;123 Business Rd&#10;City, State, Zip"
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-sm text-black focus:border-black focus:outline-none transition-all placeholder:text-zinc-300 resize-none font-medium"
                        />
                    </div>

                    <div>
                        <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                            <Send size={14} className="text-zinc-300" /> Recipient Address (To)
                        </label>
                        <textarea
                            rows={3}
                            value={settings.recipientAddress || ''}
                            onChange={(e) => handleChange('recipientAddress', e.target.value)}
                            placeholder="Client Name&#10;Attn: Contact Person&#10;Address..."
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-lg px-4 py-3 text-sm text-black focus:border-black focus:outline-none transition-all placeholder:text-zinc-300 resize-none font-medium"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
