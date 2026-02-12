
"use client";
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, FileText, Building2, Package, Mail, AlertCircle, Check, ArrowLeft, Download, Plus, Minus, Send, Eye, Zap, ShoppingCart, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';
import { InvoiceEditor } from './InvoiceEditor';
import { BulkEmailModal } from './BulkEmailModal';
import { PDFPreviewModal } from './PDFPreviewModal';

export function CartPage({ cart = [], onRemoveFromCart, onUpdateQuantity, onBack }) {
    const [showInvoice, setShowInvoice] = useState(false);
    const [emailSent, setEmailSent] = useState({});
    const [viewingCompany, setViewingCompany] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewTarget, setPreviewTarget] = useState(null);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [bulkSendingComplete, setBulkSendingComplete] = useState(false);
    const [invoiceSettings, setInvoiceSettings] = useState({
        logoUrl: null, // Using internal FORPLUS branding
        senderAddress: 'Forplus Procurement\nInnovation Center - HQ\nTech District',
        recipientAddress: '',
        invoiceNumber: `RFQ-${Math.floor(Date.now() / 1000).toString().slice(-6)}`,
        date: new Date().toISOString().split('T')[0],
        notes: 'Please provide lead times and competitive pricing for the items listed above.',
        title: 'REQUEST FOR QUOTATION'
    });

    const groupedItems = cart.reduce((acc, item) => {
        const company = item.company || "Unknown Company";
        if (!acc[company]) {
            acc[company] = { items: [], email: item.company_email || null };
        }
        acc[company].items.push(item);
        return acc;
    }, {});

    useEffect(() => {
        if (viewingCompany && groupedItems[viewingCompany]) {
            const data = groupedItems[viewingCompany];
            setInvoiceSettings(prev => ({
                ...prev,
                recipientAddress: `${viewingCompany}\n${data.email || ''}`
            }));
        }
    }, [viewingCompany]);

    const handleSendEmail = (company, email) => {
        if (!email) return;
        setEmailSent(prev => ({ ...prev, [company]: 'sending' }));
        setTimeout(() => {
            setEmailSent(prev => ({ ...prev, [company]: 'sent' }));
        }, 1500);
    };

    const [adminAlerted, setAdminAlerted] = useState({});

    const handleAlertAdmin = (company) => {
        const confirmAlert = window.confirm(`Alert admin to manually process request for ${company}?`);
        if (!confirmAlert) return;

        setAdminAlerted(prev => ({ ...prev, [company]: true }));
    };

    const handleSendAll = () => {
        const companiesToSend = Object.entries(groupedItems).filter(([_, data]) => data.email);
        if (companiesToSend.length === 0) {
            alert("No companies with email addresses found to send quotations to.");
            return;
        }
        setShowEmailModal(true);
    };

    const handleBulkComplete = () => {
        setBulkSendingComplete(true);
        // Mark all as sent in local state for individual buttons
        const companiesToSend = Object.keys(groupedItems);
        const sentState = companiesToSend.reduce((acc, company) => ({ ...acc, [company]: 'sent' }), {});
        setEmailSent(sentState);
    };

    const handlePreview = (company) => {
        setPreviewTarget(company);
        setShowPreview(true);
    };

    return (
        <div className="w-full min-h-screen bg-zinc-50/50 text-zinc-900 font-sans selection:bg-zinc-900 selection:text-white">
            <div className="max-w-7xl mx-auto px-6 py-12">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-16 gap-8">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2 mr-2 border-r border-zinc-200 pr-6 hidden md:flex">
                            <img src="/logo.png" alt="ForPlus Logo" className="w-10 h-10 object-contain" />
                            <h2 className="text-2xl font-black tracking-tighter">
                                <span className="text-black uppercase">For</span>
                                <span className="text-zinc-400 font-light">plus</span>
                            </h2>
                        </div>
                        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-full text-zinc-500 hover:text-black hover:border-black transition-all shadow-sm hover:shadow-md">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-bold text-zinc-900 tracking-tight flex items-center gap-4">
                                {showInvoice ? <FileText strokeWidth={1.5} size={32} /> : <ShoppingCart strokeWidth={1.5} size={32} />}
                                {showInvoice ? "RFQ Procurement" : "Selection Archives"}
                            </h1>
                            <p className="text-zinc-500 font-medium text-sm mt-2 tracking-wide flex items-center gap-3">
                                <span className="bg-white border border-zinc-200 px-3 py-1 rounded-full text-xs text-zinc-600 font-semibold">{cart.length} items</span>
                                <span className="text-zinc-300">•</span>
                                {showInvoice ? "Drafting professional request for quotation" : "Review and manage your product selections"}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!showInvoice ? (
                            cart.length > 0 && (
                                <button
                                    onClick={() => setShowInvoice(true)}
                                    className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-semibold text-sm tracking-wide transition-all hover:bg-black hover:translate-y-[-2px] flex items-center gap-3 shadow-xl shadow-zinc-900/20"
                                >
                                    <FileText size={18} />
                                    Generate RFQ
                                </button>
                            )
                        ) : (
                            <div className="flex gap-3">
                                {!viewingCompany ? (
                                    <>
                                        <button onClick={() => setShowInvoice(false)} className="bg-white text-zinc-600 border border-zinc-200 px-6 py-4 rounded-xl font-semibold text-sm tracking-wide transition-all hover:text-black hover:border-zinc-300">
                                            Return to Cart
                                        </button>
                                        <button
                                            onClick={handleSendAll}
                                            disabled={bulkSendingComplete}
                                            className={`px-8 py-4 rounded-xl font-semibold text-sm tracking-wide transition-all shadow-xl shadow-zinc-900/20 flex items-center gap-3
                                                ${bulkSendingComplete ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 shadow-none' : 'bg-zinc-900 text-white hover:bg-black hover:translate-y-[-2px]'}
                                            `}
                                        >
                                            {bulkSendingComplete ? <><Check size={18} /> Requests Sent</> : <><Send size={18} /> Send All</>}
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setViewingCompany(null)} className="bg-white text-zinc-600 border border-zinc-200 px-6 py-4 rounded-xl font-semibold text-sm tracking-wide transition-all hover:text-black hover:border-zinc-300">
                                            Back to List
                                        </button>
                                        <button onClick={() => handlePreview(viewingCompany)} className="bg-zinc-100 text-zinc-700 border border-zinc-200 px-6 py-4 rounded-xl font-semibold text-sm tracking-wide transition-all hover:bg-zinc-200 flex items-center gap-2">
                                            <Eye size={18} /> Preview
                                        </button>
                                        <PDFDownloadLink
                                            document={<InvoicePDF invoiceData={groupedItems[viewingCompany]} customSettings={invoiceSettings} />}
                                            fileName={`Proposal_${viewingCompany.replace(/\s+/g, '_')}.pdf`}
                                            className="bg-zinc-900 text-white px-8 py-4 rounded-xl font-semibold text-sm tracking-wide transition-all hover:bg-black hover:translate-y-[-2px] shadow-xl shadow-zinc-900/20 flex items-center gap-3"
                                        >
                                            {({ loading }) => <>{loading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />} {loading ? 'Rendering...' : 'Download'}</>}
                                        </PDFDownloadLink>
                                    </>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="max-w-full">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-dashed border-zinc-200">
                            <div className="p-6 bg-zinc-50 rounded-full mb-6"><Package strokeWidth={1.5} size={64} className="text-zinc-300" /></div>
                            <h2 className="text-2xl font-bold text-zinc-900 mb-2 tracking-tight">Your selection is empty</h2>
                            <p className="text-zinc-500 font-medium mb-8 max-w-sm">Start browsing the catalog to add products to your archives.</p>
                            <button onClick={onBack} className="px-8 py-3 bg-zinc-900 text-white rounded-lg font-medium text-sm transition-all hover:bg-black hover:shadow-lg">Resume Search</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-6">
                            <AnimatePresence>
                                {Object.entries(groupedItems).map(([company, data], index) => {
                                    if (viewingCompany && viewingCompany !== company) return null;
                                    const isExpanded = viewingCompany === company;

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={company}
                                            className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden ${isExpanded ? 'border-zinc-300 shadow-2xl shadow-zinc-200/50 ring-1 ring-zinc-900/5' : 'border-zinc-200 hover:border-zinc-300 hover:shadow-lg hover:shadow-zinc-100'}`}
                                        >
                                            <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-8">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 bg-zinc-50 border border-zinc-100 rounded-xl flex items-center justify-center text-zinc-900"><Building2 strokeWidth={1.5} size={28} /></div>
                                                    <div>
                                                        <h3 className="text-2xl font-bold text-zinc-900 tracking-tight">{company}</h3>
                                                        <div className="flex items-center gap-3 mt-2">
                                                            <span className="text-xs font-semibold text-zinc-500 bg-zinc-50 px-2.5 py-0.5 rounded-md border border-zinc-100">{data.items.length} Products</span>
                                                            {data.email && <div className="text-xs text-zinc-400 font-medium flex items-center gap-1.5"><Mail size={12} /> {data.email}</div>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    {!showInvoice ? (
                                                        <button onClick={() => setShowInvoice(true)} className="px-5 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 transition-all">Review Details</button>
                                                    ) : (
                                                        !viewingCompany ? (
                                                            <button onClick={() => setViewingCompany(company)} className="px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium text-sm transition-all hover:bg-black shadow-lg shadow-zinc-900/10">Configure RFQ</button>
                                                        ) : (
                                                            data.email ? (
                                                                <button
                                                                    onClick={() => handleSendEmail(company, data.email)}
                                                                    disabled={emailSent[company] === 'sending' || emailSent[company] === 'sent'}
                                                                    className={`px-6 py-3 rounded-lg transition-all flex items-center gap-2 font-medium text-sm shadow-md
                                                                        ${emailSent[company] === 'sent' ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-zinc-900 text-white hover:bg-black'}`}
                                                                >
                                                                    {emailSent[company] === 'sending' ? 'Transmitting...' : emailSent[company] === 'sent' ? <><Check size={16} /> Requested</> : <><Send size={16} /> Despatch Quote</>}
                                                                </button>
                                                            ) : (
                                                                adminAlerted[company] ? (
                                                                    <div className="flex items-center gap-2 text-xs font-bold text-amber-600 bg-amber-50 px-4 py-3 rounded-lg border border-amber-100 animate-in fade-in zoom-in duration-300">
                                                                        <AlertCircle size={14} />
                                                                        <span>Admin has been alerted and will be reviewing the quotation request.</span>
                                                                    </div>
                                                                ) : (
                                                                    <button
                                                                        onClick={() => handleAlertAdmin(company)}
                                                                        className="px-6 py-3 bg-amber-50 text-amber-700 hover:bg-amber-100 rounded-lg font-bold text-xs uppercase tracking-wide transition-all flex items-center gap-2 border border-amber-200/50"
                                                                    >
                                                                        <AlertCircle size={14} /> Alert Admin
                                                                    </button>
                                                                )
                                                            )
                                                        ))
                                                    }
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="p-8 bg-zinc-50/80 border-t border-b border-zinc-100 backdrop-blur-sm">
                                                    <InvoiceEditor settings={invoiceSettings} onUpdate={setInvoiceSettings} />
                                                </div>
                                            )}

                                            <div className="divide-y divide-zinc-50">
                                                {data.items.map((item, idx) => (
                                                    <div key={`${item.id}-${idx}`} className="p-8 hover:bg-zinc-50/50 transition-colors flex items-start gap-8 group/item">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h4 className="text-lg font-bold text-zinc-900 tracking-tight">{item.name}</h4>
                                                                <span className="text-[10px] font-mono text-zinc-400 bg-zinc-100 px-1.5 py-0.5 rounded">#{item.id.slice(0, 6).toUpperCase()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-6 mb-4">
                                                                <div className="flex items-center bg-white border border-zinc-200 rounded-lg p-0.5 shadow-sm">
                                                                    <button onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-50 rounded-md text-zinc-400 hover:text-black transition-all"><Minus size={14} /></button>
                                                                    <span className="w-8 text-center font-bold text-sm text-zinc-700">{item.quantity || 1}</span>
                                                                    <button onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)} className="w-7 h-7 flex items-center justify-center hover:bg-zinc-50 rounded-md text-zinc-400 hover:text-black transition-all"><Plus size={14} /></button>
                                                                </div>
                                                                <span className="text-xs text-zinc-400 font-medium">Quantity Units</span>
                                                            </div>

                                                            <p className="text-zinc-500 text-sm leading-relaxed max-w-3xl mb-6">{item.description || "Specifications pending archival review."}</p>

                                                            {showInvoice && item.specifications && (
                                                                <div className="p-6 bg-white rounded-xl border border-zinc-200 shadow-sm">
                                                                    <div className="flex items-center gap-2 mb-4"><Zap size={14} className="text-amber-500" /><span className="text-xs text-zinc-900 font-bold uppercase tracking-wide">Technical Matrix</span></div>
                                                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
                                                                        {renderSpecs(item.specifications)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {!showInvoice && (
                                                            <button onClick={() => onRemoveFromCart(item.id)} className="w-10 h-10 flex items-center justify-center rounded-xl bg-white text-zinc-400 hover:bg-red-50 hover:text-red-500 border border-zinc-200 hover:border-red-100 transition-all opacity-0 group-hover/item:opacity-100 shadow-sm"><Trash2 size={18} /></button>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>
                                    );
                                })}
                            </AnimatePresence>
                        </div>
                    )}
                </div>
            </div>

            <AnimatePresence>
                {showPreview && previewTarget && (
                    <PDFPreviewModal
                        isOpen={showPreview}
                        onClose={() => setShowPreview(false)}
                        fileName={`Proposal_${previewTarget.replace(/\s+/g, '_')}.pdf`}
                        document={<InvoicePDF invoiceData={groupedItems[previewTarget]} customSettings={invoiceSettings} />}
                    />
                )}
                {showEmailModal && (
                    <BulkEmailModal
                        isOpen={showEmailModal}
                        onClose={() => setShowEmailModal(false)}
                        companiesData={groupedItems}
                        sentStatus={emailSent}
                        onComplete={handleBulkComplete}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function renderSpecs(specs) {
    if (typeof specs === 'string') { try { specs = JSON.parse(specs); } catch { } }
    const isValid = (v) => v && /[a-zA-Z0-9]/.test(String(v));
    let clean = {};
    if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
        Object.entries(specs).forEach(([k, v]) => { if (isValid(v)) clean[k] = v; });
    }
    const entries = Object.entries(clean).slice(0, 9);
    if (entries.length === 0) return <div className="col-span-full text-zinc-400 italic text-xs">Metadata Unavailable</div>;
    return entries.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 pb-2 border-b border-zinc-50 last:border-0">
            <span className="text-zinc-500 capitalize font-medium text-[10px] tracking-wide">{k.replace(/_/g, ' ')}</span>
            <span className="font-semibold text-zinc-900 text-xs">{String(v)}</span>
        </div>
    ));
}
