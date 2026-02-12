import { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2, FileText, Printer, Building2, Package, Mail, AlertCircle } from 'lucide-react';

export function CartModal({ cart, onClose, onRemoveFromCart, companies = [] }) {
    const [showInvoice, setShowInvoice] = useState(false);
    const [emailSent, setEmailSent] = useState({}); // Track simulated emails sent

    // Helper to find company email
    const getCompanyEmail = (companyName) => {
        const found = companies.find(c => (c.company || c) === companyName);
        return found?.company_email || null;
    };

    // Group items by company
    const groupedItems = cart.reduce((acc, item) => {
        const company = item.company || "Unknown Company";
        if (!acc[company]) {
            acc[company] = {
                items: [],
                email: getCompanyEmail(company)
            };
        }
        acc[company].items.push(item);
        return acc;
    }, {});

    const handlePrint = () => {
        window.print();
    };

    const handleSendEmail = (company, email) => {
        if (!email) return;
        // Simulate email sending
        setEmailSent(prev => ({ ...prev, [company]: 'sending' }));
        setTimeout(() => {
            setEmailSent(prev => ({ ...prev, [company]: 'sent' }));
            alert(`Simulated email sent to ${email} with invoice for ${company}`);
        }, 1500);
    };

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-slate-900 border border-white/10 overflow-hidden rounded-3xl shadow-2xl shadow-black/50 w-full max-w-4xl max-h-[90vh] flex flex-col relative print:shadow-none print:border-none print:rounded-none print:bg-white print:max-h-none print:h-auto print:absolute print:inset-0"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10 bg-slate-900 sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        {showInvoice ? <FileText className="text-blue-400" size={24} /> : <Package className="text-blue-400" size={24} />}
                        <h2 className="text-2xl font-bold text-white">
                            {showInvoice ? "Invoice Preview" : "Shopping Cart"}
                        </h2>
                        <span className="text-sm font-normal text-slate-500 bg-slate-800 px-2.5 py-0.5 rounded-full border border-white/5 ml-2">
                            {cart.length} items
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {!showInvoice ? (
                            cart.length > 0 && (
                                <button
                                    onClick={() => setShowInvoice(true)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <FileText size={16} />
                                    Generate Invoice
                                </button>
                            )
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowInvoice(false)}
                                    className="text-slate-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10 hover:border-white/20 bg-white/5"
                                >
                                    Back to Cart
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                                >
                                    <Printer size={16} />
                                    Print
                                </button>
                            </>
                        )}
                        <button
                            onClick={onClose}
                            className="p-2 bg-white/5 hover:bg-red-500/20 hover:text-red-400 rounded-full text-slate-400 transition-all border border-white/5 hover:border-red-500/30 ml-2"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar print:overflow-visible print:p-0">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                            <Package size={64} className="opacity-20 mb-4" />
                            <p className="text-lg font-medium text-slate-400">Your cart is empty</p>
                            <p className="text-sm">Select products to add them to your cart.</p>
                        </div>
                    ) : (
                        <div className="space-y-8 print:space-y-0 print:block">
                            {Object.entries(groupedItems).map(([company, data], index) => (
                                <div key={company} className={`bg-slate-800/30 rounded-2xl border border-white/5 overflow-hidden print:bg-white print:border-none print:text-black print:mb-0 print:break-after-page print:pt-8 print:pb-8 relative`}>

                                    {/* Company Header */}
                                    <div className="px-6 py-4 bg-white/5 border-b border-white/5 flex items-center gap-3 print:bg-slate-50 print:border-b-2 print:border-slate-800">
                                        <Building2 className="text-blue-400 print:text-black" size={20} />
                                        <div className="flex-1">
                                            <h3 className="text-lg font-bold text-white print:text-black">{company}</h3>
                                            {showInvoice && data.email && <div className="text-xs text-slate-400 print:text-slate-600 font-mono">{data.email}</div>}
                                        </div>

                                        {!showInvoice && (
                                            <span className="text-xs text-slate-400 bg-black/20 px-2 py-0.5 rounded-full print:text-slate-600 print:bg-slate-200">
                                                {data.items.length} items
                                            </span>
                                        )}

                                        {/* Invoice Actions Logic */}
                                        {showInvoice && (
                                            <div className="flex items-center gap-2 no-print">
                                                {data.email ? (
                                                    <button
                                                        onClick={() => handleSendEmail(company, data.email)}
                                                        disabled={emailSent[company] === 'sending' || emailSent[company] === 'sent'}
                                                        className={`text-xs px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 
                                                            ${emailSent[company] === 'sent'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                                                            }`}
                                                    >
                                                        {emailSent[company] === 'sending' ? (
                                                            <span>Sending...</span>
                                                        ) : emailSent[company] === 'sent' ? (
                                                            <>
                                                                <Check size={12} />
                                                                Sent
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Mail size={12} />
                                                                Send Invoice
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-xs text-amber-500 bg-amber-500/10 px-3 py-1.5 rounded-lg border border-amber-500/20 cursor-help" title="No email found for this company">
                                                        <AlertCircle size={12} />
                                                        <span>Contact Admin</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Items List */}
                                    <div className="divide-y divide-white/5 print:divide-slate-200">
                                        {data.items.map((item, idx) => (
                                            <div key={`${item.id}-${idx}`} className="p-4 hover:bg-white/5 transition-colors flex items-start gap-4 group print:hover:bg-transparent print:py-2">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-slate-200 font-medium truncate print:text-black print:font-bold">{item.name}</h4>
                                                    <p className="text-slate-400 text-xs mt-1 line-clamp-1 print:text-slate-600">{item.description}</p>
                                                    {showInvoice && item.specifications && (
                                                        <div className="mt-2 text-[10px] text-slate-500 font-mono print:text-slate-500">
                                                            {typeof item.specifications === 'object' && !Array.isArray(item.specifications)
                                                                ? Object.entries(item.specifications).slice(0, 3).map(([k, v]) => `${k}: ${v}`).join(', ')
                                                                : JSON.stringify(item.specifications).slice(0, 100)
                                                            }
                                                        </div>
                                                    )}
                                                </div>
                                                {!showInvoice && (
                                                    <button
                                                        onClick={() => onRemoveFromCart(item.id)}
                                                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                                                        title="Remove"
                                                    >
                                                        <Trash2 size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Print Footer per Invoice */}
                                    {showInvoice && (
                                        <div className="hidden print:block mt-8 pt-4 border-t border-slate-300">
                                            <div className="flex justify-between text-sm text-slate-500">
                                                <span>Total Items: {data.items.length}</span>
                                                <span>Please contact {data.email || "admin"} for payment details.</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Aggregates */}
                {cart.length > 0 && (
                    <div className="p-4 bg-slate-900 border-t border-white/10 flex justify-between items-center text-slate-400 text-xs print:hidden">
                        <span>Total Companies: <strong className="text-white">{Object.keys(groupedItems).length}</strong></span>
                        <span>Total Items: <strong className="text-white">{cart.length}</strong></span>
                    </div>
                )}
            </motion.div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; size: auto; }
                    body {
                        visibility: hidden;
                        background: white;
                    }
                    /* Reset everything */
                    .fixed.inset-0.z-\\[100\\] {
                        position: static !important;
                        background: white !important;
                        display: block !important;
                        width: 100%;
                        height: auto;
                        overflow: visible;
                    }
                     .fixed.inset-0.z-\\[100\\] * {
                        visibility: visible;
                    }
                    /* Hide UI controls */
                    button, .no-print, [role="button"] {
                        display: none !important;
                    }
                    /* Main container reset */
                    .bg-slate-900 {
                        background: white !important;
                        border: none !important;
                        box-shadow: none !important;
                        color: black !important;
                        width: 100% !important;
                        max-width: 100% !important;
                        position: static !important;
                        transform: none !important;
                    }
                    /* Text colors */
                    .text-white, .text-slate-200, .text-slate-300, .text-blue-400 {
                        color: black !important;
                    }
                    .text-slate-400, .text-slate-500 {
                        color: #444 !important;
                    }
                    /* Borders */
                    .border-white\\/5, .border-white\\/10 {
                        border-color: #eee !important;
                    }
                    
                    /* Page Break Logic */
                    .print\\:break-after-page {
                        break-after: page;
                        page-break-after: always;
                    }
                    .print\\:break-after-page:last-child {
                        break-after: auto;
                        page-break-after: auto;
                    }
                }
            `}</style>
        </motion.div>,
        document.body
    );
}
