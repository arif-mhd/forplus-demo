
"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ChevronRight, ChevronLeft, CheckCircle, FileText, Paperclip, Loader2, Mail, Edit2, AlertCircle } from 'lucide-react';

export function BulkEmailModal({ isOpen, onClose, companiesData, sentStatus = {}, onComplete }) {
    const [drafts, setDrafts] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [sendingState, setSendingState] = useState('idle'); // idle, sending, complete
    const [sendProgress, setSendProgress] = useState(0);

    useEffect(() => {
        if (isOpen && companiesData) {
            const initialDrafts = Object.entries(companiesData).map(([company, data], idx) => ({
                id: idx,
                company,
                email: data.email || "pending_contact",
                subject: `Request for Quotation - ${company}`,
                body: generateEmailBody(company, data.items),
                status: sentStatus[company] === 'sent' ? 'sent' : 'draft', // Initialize with sent status
                attachment: `Proposal_${company.replace(/\s+/g, '_')}.pdf`
            }));
            setDrafts(initialDrafts);
            // Find first non-sent draft to focus on
            const firstDraft = initialDrafts.findIndex(d => d.status === 'draft');
            setCurrentIndex(firstDraft >= 0 ? firstDraft : 0);

            setSendingState('idle');
            setSendProgress(0);
        }
    }, [isOpen, companiesData, sentStatus]);

    const generateEmailBody = (company, items) => {
        return `Dear Sales Team at ${company},

We are interested in purchasing the following items from your catalog:

${items.map(item => `- ${item.name} (Qty: ${item.quantity || 1}) - Ref: ${item.id.slice(0, 8)}`).join('\n')}

Please provide a formal quotation including:
1. Unit prices and total cost
2. Lead times for availability
3. Shipping to our HQ

Attached is the formal RFQ document for your reference.

Best regards,
Procurement Team`;
    };

    const handleUpdateDraft = (field, value) => {
        setDrafts(prev => prev.map((d, i) => i === currentIndex ? { ...d, [field]: value } : d));
    };

    const handleSendAll = async () => {
        setSendingState('sending');

        for (let i = 0; i < drafts.length; i++) {
            // Skip if already sent
            if (drafts[i].status === 'sent') {
                setSendProgress(((i + 1) / drafts.length) * 100);
                continue;
            }

            // Update current draft status to sending
            setDrafts(prev => prev.map((d, idx) => idx === i ? { ...d, status: 'sending' } : d));
            setCurrentIndex(i); // Auto-scroll to current

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Mark as sent or alerted
            setDrafts(prev => prev.map((d, idx) => {
                if (idx !== i) return d;
                return { ...d, status: d.email === 'pending_contact' ? 'alerted' : 'sent' };
            }));
            setSendProgress(((i + 1) / drafts.length) * 100);
        }

        // Small delay to show 100%
        await new Promise(resolve => setTimeout(resolve, 500));

        onComplete();
        onClose();
    };

    if (!isOpen) return null;

    const currentDraft = drafts[currentIndex];

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-white rounded-2xl w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col md:flex-row h-[80vh] border border-zinc-200"
                >
                    {/* Left Sidebar: List */}
                    <div className="w-full md:w-1/3 bg-zinc-50 border-r border-zinc-200 flex flex-col">
                        <div className="p-6 border-b border-zinc-200 bg-white">
                            <h2 className="text-lg font-black uppercase tracking-tighter flex items-center gap-2">
                                <Mail size={20} /> Outbox Review
                            </h2>
                            <p className="text-zinc-400 text-xs font-bold uppercase tracking-widest mt-1">
                                {drafts.length} Drafts Prepared
                            </p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                            {drafts.map((draft, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => setCurrentIndex(idx)}
                                    className={`w-full p-4 rounded-xl border text-left transition-all group relative overflow-hidden
                                        ${currentIndex === idx ? 'bg-white border-black shadow-lg ring-1 ring-black/5' : 'bg-white border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}
                                        ${draft.status === 'sent' ? 'opacity-75' : ''}
                                    `}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className={`text-xs font-black uppercase tracking-widest ${currentIndex === idx ? 'text-black' : 'text-zinc-500'}`}>
                                            {draft.company}
                                        </span>
                                        {draft.status === 'sent' && <CheckCircle size={14} className="text-emerald-500" />}
                                        {draft.status === 'alerted' && <AlertCircle size={14} className="text-amber-500" />}
                                        {draft.status === 'sending' && <Loader2 size={14} className="animate-spin text-black" />}
                                    </div>
                                    <div className="text-[10px] text-zinc-400 font-mono truncate">
                                        {draft.email === 'pending_contact' ? <span className="text-amber-600 font-bold">Contact Restricted</span> : draft.email}
                                    </div>
                                    {currentIndex === idx && sendingState === 'idle' && (
                                        <div className="absolute right-0 top-0 bottom-0 w-1 bg-black" />
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Main Content: Editor */}
                    <div className="flex-1 flex flex-col bg-white">
                        {/* Toolbar */}
                        <div className="p-6 border-b border-zinc-100 flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-zinc-100 rounded-full flex items-center justify-center font-bold text-zinc-500">
                                    {currentIndex + 1}/{drafts.length}
                                </div>
                                <div>
                                    <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Recipient</div>
                                    <div className="font-bold text-black">{currentDraft?.company}</div>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCurrentIndex(prev => Math.max(0, prev - 1))}
                                    disabled={currentIndex === 0 || sendingState !== 'idle'}
                                    className="p-2 hover:bg-zinc-100 rounded-lg disabled:opacity-30 transition-all"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setCurrentIndex(prev => Math.min(drafts.length - 1, prev + 1))}
                                    disabled={currentIndex === drafts.length - 1 || sendingState !== 'idle'}
                                    className="p-2 hover:bg-zinc-100 rounded-lg disabled:opacity-30 transition-all"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Editor Area */}
                        <div className="flex-1 overflow-y-auto p-8 bg-zinc-50/30">
                            <div className="bg-white rounded-xl border border-zinc-200 shadow-sm p-8 space-y-6">
                                {currentDraft?.email === 'pending_contact' ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center space-y-6">
                                        <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center">
                                            <AlertCircle size={32} />
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-zinc-900 mb-2">Manual Processing Required</h3>
                                            <p className="text-zinc-500 text-sm max-w-sm mx-auto">
                                                This supplier does not have a registered email address. The system will alert an administrator to handle this request manually.
                                            </p>
                                        </div>
                                        {currentDraft?.status === 'alerted' ? (
                                            <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-4 py-3 rounded-lg border border-amber-100">
                                                <CheckCircle size={14} />
                                                <span>Admin Alerted Successfully</span>
                                            </div>
                                        ) : (
                                            <div className="text-xs font-bold text-zinc-400 bg-zinc-50 px-4 py-2 rounded-lg border border-zinc-100">
                                                Will be processed in batch
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Subject Line</label>
                                            <input
                                                type="text"
                                                value={currentDraft?.subject || ''}
                                                onChange={(e) => handleUpdateDraft('subject', e.target.value)}
                                                disabled={sendingState !== 'idle'}
                                                className="w-full text-lg font-bold text-black border-b border-zinc-200 py-2 focus:outline-none focus:border-black transition-colors bg-transparent placeholder-zinc-300"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-2">Message Body</label>
                                            <textarea
                                                value={currentDraft?.body || ''}
                                                onChange={(e) => handleUpdateDraft('body', e.target.value)}
                                                disabled={sendingState !== 'idle'}
                                                rows={12}
                                                className="w-full text-sm font-medium text-zinc-700 leading-relaxed resize-none focus:outline-none bg-transparent"
                                            />
                                        </div>

                                        {/* Attachments */}
                                        <div className="bg-zinc-50 rounded-lg p-4 border border-zinc-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white border border-zinc-200 rounded-lg text-red-500">
                                                    <FileText size={16} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-xs font-bold text-black">{currentDraft?.attachment}</span>
                                                    <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">PDF Attachment • 1.2MB</span>
                                                </div>
                                            </div>
                                            <div className="text-zinc-300 text-xs font-mono">Auto-generated</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 border-t border-zinc-100 bg-white flex justify-between items-center">
                            <button
                                onClick={onClose}
                                disabled={sendingState !== 'idle'}
                                className="text-xs font-bold text-zinc-500 hover:text-black uppercase tracking-widest disabled:opacity-30"
                            >
                                Cancel
                            </button>

                            <button
                                onClick={handleSendAll}
                                disabled={sendingState !== 'idle'}
                                className="bg-black text-white px-8 py-4 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-zinc-800 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-3 shadow-xl shadow-black/20"
                            >
                                {sendingState === 'sending' ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Sending... ({Math.round(sendProgress)}%)
                                    </>
                                ) : (
                                    <>
                                        Approve & Process All <Send size={16} />
                                    </>
                                )}
                            </button>
                        </div>

                    </div>
                </motion.div>
            </div >
        </AnimatePresence >
    );
}
