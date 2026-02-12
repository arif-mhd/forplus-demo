/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, FileText, Building2, Package, Mail, AlertCircle, Check, ArrowLeft, Download, Plus, Minus, Send, Eye, Zap, ShoppingCart, Loader2 } from 'lucide-react';
import { PDFDownloadLink } from '@react-pdf/renderer';
import { InvoicePDF } from './InvoicePDF';
import { InvoiceEditor } from './InvoiceEditor';
import { PDFPreviewModal } from './PDFPreviewModal';

export function CartPage({ cart = [], onRemoveFromCart, onUpdateQuantity, onBack }) {
    const [showInvoice, setShowInvoice] = useState(false);
    const [emailSent, setEmailSent] = useState({});
    const [viewingCompany, setViewingCompany] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [previewTarget, setPreviewTarget] = useState(null);
    const [invoiceSettings, setInvoiceSettings] = useState({
        logoUrl: window.location.origin + '/logo.png',
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

    const handleSendAll = () => {
        const companiesToSend = Object.entries(groupedItems).filter(([_, data]) => data.email);
        if (companiesToSend.length === 0) {
            alert("No companies with email addresses found to send quotations to.");
            return;
        }
        const confirmSend = window.confirm(`Send quotation requests to ${companiesToSend.length} suppliers?`);
        if (!confirmSend) return;
        companiesToSend.forEach(([company, data]) => { handleSendEmail(company, data.email); });
    };

    const handlePreview = (company) => {
        setPreviewTarget(company);
        setShowPreview(true);
    };

    return (
        <div className="w-full min-h-screen bg-zinc-100/30 text-zinc-900 font-sans">
            <div className="max-w-full mx-auto px-8 py-10">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6 bg-white border border-zinc-300 rounded-3xl p-8 shadow-sm">
                    <div className="flex items-center gap-6">
                        <button onClick={onBack} className="w-12 h-12 flex items-center justify-center bg-white border border-zinc-200 rounded-2xl text-zinc-400 hover:text-black hover:border-black transition-all shadow-sm">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-4xl font-black text-black tracking-tighter uppercase flex items-center gap-4">
                                {showInvoice ? <FileText size={32} /> : <ShoppingCart size={32} />}
                                {showInvoice ? "RFQ Procurement" : "Selection Archives"}
                            </h1>
                            <p className="text-zinc-400 font-medium text-sm mt-1 uppercase tracking-widest flex items-center gap-2">
                                <span className="bg-zinc-100 px-2 py-0.5 rounded text-[10px] text-zinc-500">{cart.length} items</span>
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
                                    className="bg-black text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 active:scale-95 flex items-center gap-3 shadow-2xl shadow-black/20"
                                >
                                    <FileText size={18} />
                                    Generate RFQ
                                </button>
                            )
                        ) : (
                            <div className="flex gap-2">
                                {!viewingCompany ? (
                                    <>
                                        <button onClick={() => setShowInvoice(false)} className="bg-white text-zinc-500 border border-zinc-200 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:text-black hover:border-black">
                                            Return to Cart
                                        </button>
                                        <button onClick={handleSendAll} className="bg-black text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl shadow-black/20 flex items-center gap-3">
                                            <Send size={18} /> Send All
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button onClick={() => setViewingCompany(null)} className="bg-white text-zinc-500 border border-zinc-200 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:text-black">
                                            Back to List
                                        </button>
                                        <button onClick={() => handlePreview(viewingCompany)} className="bg-zinc-100 text-zinc-600 border border-zinc-200 px-6 py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all hover:bg-zinc-200 flex items-center gap-2">
                                            <Eye size={18} /> Preview
                                        </button>
                                        <PDFDownloadLink
                                            document={<InvoicePDF invoiceData={groupedItems[viewingCompany]} customSettings={invoiceSettings} />}
                                            fileName={`Proposal_${viewingCompany.replace(/\s+/g, '_')}.pdf`}
                                            className="bg-black text-white px-10 py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl shadow-black/20 flex items-center gap-3"
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
                        <div className="flex flex-col items-center justify-center py-40 text-center bg-white/40 backdrop-blur-md rounded-[3rem] border border-zinc-100 shadow-inner">
                            <div className="p-8 bg-zinc-50 rounded-full border border-zinc-100 mb-8"><Package size={80} className="text-zinc-200" /></div>
                            <h2 className="text-3xl font-black text-black mb-2 uppercase tracking-tighter">Inventory Empty</h2>
                            <p className="text-zinc-400 font-medium mb-10 max-w-xs">Your selection archives are currently empty. Start browsing the catalog to add products.</p>
                            <button onClick={onBack} className="px-12 py-5 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl shadow-black/20">Resume Search</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-10">
                            <AnimatePresence>
                                {Object.entries(groupedItems).map(([company, data], index) => {
                                    if (viewingCompany && viewingCompany !== company) return null;
                                    const isExpanded = viewingCompany === company;

                                    return (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0 }}
                                            transition={{ delay: index * 0.05 }}
                                            key={company}
                                            className={`bg-white rounded-[2.5rem] border overflow-hidden transition-all duration-500 ${isExpanded ? 'border-black ring-1 ring-black/5 shadow-2xl shadow-black/5' : 'border-zinc-300 hover:border-black/30 hover:shadow-2xl hover:shadow-black/5'}`}
                                        >
                                            <div className="p-10 flex flex-col md:flex-row items-center justify-between gap-8 border-b border-zinc-100">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center text-black shadow-sm group-hover:scale-105 transition-transform"><Building2 size={32} /></div>
                                                    <div>
                                                        <h3 className="text-3xl font-black text-black uppercase tracking-tighter">{company}</h3>
                                                        <div className="flex items-center gap-4 mt-1">
                                                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 px-3 py-1 rounded-full border border-zinc-100 shadow-inner">{data.items.length} Products</span>
                                                            {data.email && <div className="text-[10px] text-zinc-400 font-black uppercase tracking-widest flex items-center gap-2"><Mail size={12} className="text-zinc-300" /> {data.email}</div>}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex gap-3">
                                                    {!showInvoice ? (
                                                        <button onClick={() => setShowInvoice(true)} className="px-6 py-3 bg-zinc-50 hover:bg-black hover:text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all border border-zinc-200/50">Details</button>
                                                    ) : (
                                                        !viewingCompany ? (
                                                            <button onClick={() => setViewingCompany(company)} className="px-8 py-4 bg-black text-white rounded-xl font-black text-[10px] uppercase tracking-widest transition-all hover:scale-105 shadow-lg shadow-black/10">Configure RFQ</button>
                                                        ) : (
                                                            data.email ? (
                                                                <button
                                                                    onClick={() => handleSendEmail(company, data.email)}
                                                                    disabled={emailSent[company] === 'sending' || emailSent[company] === 'sent'}
                                                                    className={`px-8 py-4 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest shadow-xl
                                                                        ${emailSent[company] === 'sent' ? 'bg-green-50 text-green-600 border-green-200' : 'bg-black text-white hover:bg-zinc-800 shadow-black/20'}`}
                                                                >
                                                                    {emailSent[company] === 'sending' ? 'Transmitting...' : emailSent[company] === 'sent' ? <><Check size={16} /> Dispatched</> : <><Send size={16} /> Despatch Quote</>}
                                                                </button>
                                                            ) : <div className="text-[10px] font-black uppercase tracking-widest text-amber-500 bg-amber-50 px-4 py-2 rounded-xl border border-amber-100">Contact Restricted</div>
                                                        )
                                                    )}
                                                </div>
                                            </div>

                                            {isExpanded && (
                                                <div className="p-10 bg-zinc-50/50 border-b border-zinc-100">
                                                    <InvoiceEditor settings={invoiceSettings} onUpdate={setInvoiceSettings} />
                                                </div>
                                            )}

                                            <div className="divide-y divide-zinc-100">
                                                {data.items.map((item, idx) => (
                                                    <div key={`${item.id}-${idx}`} className="p-10 hover:bg-white/50 transition-colors flex items-start gap-10 group/item">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-4 mb-3">
                                                                <h4 className="text-2xl font-black text-black uppercase tracking-tighter leading-tight">{item.name}</h4>
                                                                <span className="text-[9px] font-mono text-zinc-300 font-bold">#{item.id.slice(0, 6).toUpperCase()}</span>
                                                            </div>
                                                            <div className="flex items-center gap-6 mb-6">
                                                                <div className="flex items-center bg-white border border-zinc-200 rounded-xl p-1 shadow-inner">
                                                                    <button onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) - 1)} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-black transition-all"><Minus size={14} /></button>
                                                                    <span className="w-10 text-center font-black text-sm text-black">{item.quantity || 1}</span>
                                                                    <button onClick={() => onUpdateQuantity(item.id, (item.quantity || 1) + 1)} className="w-8 h-8 flex items-center justify-center hover:bg-zinc-50 rounded-lg text-zinc-400 hover:text-black transition-all"><Plus size={14} /></button>
                                                                </div>
                                                                <span className="text-[10px] text-zinc-300 font-black uppercase tracking-[0.2em]">Quantity Units</span>
                                                            </div>

                                                            <p className="text-zinc-500 text-sm leading-relaxed font-regular max-w-3xl mb-8">{item.description || "Specifications pending archival review."}</p>

                                                            {showInvoice && item.specifications && (
                                                                <div className="p-8 bg-zinc-100/30 rounded-[2rem] border border-zinc-300 shadow-inner">
                                                                    <div className="flex items-center gap-2 mb-6"><Zap size={14} className="text-zinc-400" /><span className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.3em]">Technical Matrix</span></div>
                                                                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-8">
                                                                        {renderSpecs(item.specifications)}
                                                                    </div>
                                                                </div>
                                                            )}
                                                        </div>

                                                        {!showInvoice && (
                                                            <button onClick={() => onRemoveFromCart(item.id)} className="w-12 h-12 flex items-center justify-center rounded-2xl bg-zinc-50 text-zinc-300 hover:bg-red-50 hover:text-red-500 border border-zinc-100 hover:border-red-100 transition-all opacity-0 group-hover/item:opacity-100"><Trash2 size={20} /></button>
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
    if (entries.length === 0) return <div className="col-span-full text-zinc-300 italic font-black uppercase text-[10px] tracking-widest">Metadata Unavailable</div>;
    return entries.map(([k, v]) => (
        <div key={k} className="flex flex-col gap-1 border-b border-zinc-100 pb-2">
            <span className="text-zinc-400 capitalize font-black text-[9px] uppercase tracking-wider">{k.replace(/_/g, ' ')}</span>
            <span className="font-black text-black text-xs uppercase tracking-tight">{String(v)}</span>
        </div>
    ));
}
