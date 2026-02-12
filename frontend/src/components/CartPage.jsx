import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, FileText, Printer, Building2, Package, Mail, AlertCircle, Check, ArrowLeft } from 'lucide-react';

export function CartPage({ cart, onRemoveFromCart, companies = [], onBack }) {
    const [showInvoice, setShowInvoice] = useState(false);
    const [emailSent, setEmailSent] = useState({}); // Track simulated emails sent
    const [printTarget, setPrintTarget] = useState(null); // Track which company to print

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
        setPrintTarget(null); // Print all
        setTimeout(() => window.print(), 100);
    };

    const handlePrintCompany = (company) => {
        setPrintTarget(company);
        setTimeout(() => {
            window.print();
            // Optional: Reset after print (browser blocks so this runs after dialog closes usually)
            // setPrintTarget(null); 
        }, 100);
        // We probably want to reset it after printing so the user can see everything again if they cancel
        // But doing it too fast might break the print preview rendering. 
        // A timeout is usually safe, or just leave it filtered until they do something else.
        // Better: Listen for 'afterprint' event if possible, but timeout is simpler.
        setTimeout(() => setPrintTarget(null), 1000);
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

    return (
        <div className="w-full min-h-screen bg-slate-900 text-white print:bg-white print:text-black">
            <div className="max-w-7xl mx-auto px-4 py-8 print:p-0 print:max-w-none">

                {/* Header */}
                <div className="flex items-center justify-between mb-8 print:hidden">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={onBack}
                            className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5 hover:border-white/20"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                                {showInvoice ? <FileText className="text-blue-400" /> : <Package className="text-blue-400" />}
                                {showInvoice ? "Invoice Preview" : "Shopping Cart"}
                            </h1>
                            <p className="text-slate-400 mt-1">
                                {showInvoice
                                    ? "Review and print invoices for your selected items."
                                    : "Manage your selected products before generating an invoice."}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        {!showInvoice ? (
                            cart.length > 0 && (
                                <button
                                    onClick={() => setShowInvoice(true)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-blue-600/20"
                                >
                                    <FileText size={18} />
                                    Generate Invoice
                                </button>
                            )
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowInvoice(false)}
                                    className="text-slate-400 hover:text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/10 hover:border-white/20 bg-white/5"
                                >
                                    Back to Editing
                                </button>
                                <button
                                    onClick={handlePrint}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-all hover:scale-105 active:scale-95 flex items-center gap-2 shadow-lg shadow-emerald-600/20"
                                >
                                    <Printer size={18} />
                                    Print Invoices
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-8 print:space-y-0 print:block">
                    {cart.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-slate-500 bg-white/5 rounded-3xl border border-white/5">
                            <Package size={80} className="opacity-20 mb-6" />
                            <p className="text-2xl font-bold text-slate-400 mb-2">Your cart is empty</p>
                            <p className="text-base mb-8">Select products from the catalog to add them here.</p>
                            <button
                                onClick={onBack}
                                className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition-colors border border-white/10"
                            >
                                Browne Catalog
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-8">
                            {Object.entries(groupedItems).map(([company, data], index) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    key={company}
                                    className={`bg-slate-800/30 rounded-3xl border border-white/5 overflow-hidden print:bg-white print:border-none print:text-black print:mb-0 print:break-after-page print:pt-8 print:pb-8 relative shadow-xl shadow-black/20 
                                        ${printTarget && printTarget !== company ? 'print:hidden' : ''}
                                        ${printTarget === company ? 'print:block print:absolute print:inset-0 print:z-50' : ''}
                                    `}
                                >

                                    {/* Company Header */}
                                    <div className="px-8 py-6 bg-white/5 border-b border-white/5 flex items-center gap-4 print:bg-slate-50 print:border-b-2 print:border-slate-800">
                                        <div className="p-3 bg-blue-500/10 rounded-xl print:hidden">
                                            <Building2 className="text-blue-400" size={24} />
                                        </div>
                                        <Building2 className="hidden print:block text-black" size={24} />

                                        <div className="flex-1">
                                            <h3 className="text-2xl font-bold text-white print:text-black">{company}</h3>
                                            {showInvoice && data.email && (
                                                <div className="text-sm text-slate-400 print:text-slate-600 font-mono mt-1 flex items-center gap-2">
                                                    <Mail size={14} />
                                                    {data.email}
                                                </div>
                                            )}
                                        </div>

                                        {!showInvoice && (
                                            <span className="text-sm font-medium text-slate-400 bg-black/30 px-3 py-1 rounded-full border border-white/5 print:text-slate-600 print:bg-slate-200">
                                                {data.items.length} items
                                            </span>
                                        )}

                                        {/* Invoice Actions Logic */}
                                        {showInvoice && (
                                            <div className="flex items-center gap-2 no-print">
                                                <button
                                                    onClick={() => handlePrintCompany(company)}
                                                    className="text-sm px-3 py-2 rounded-lg border border-slate-500/20 hover:bg-slate-500/10 text-slate-400 hover:text-white transition-all flex items-center gap-2"
                                                    title="Print this invoice only"
                                                >
                                                    <Printer size={16} />
                                                </button>
                                                {data.email ? (
                                                    <button
                                                        onClick={() => handleSendEmail(company, data.email)}
                                                        disabled={emailSent[company] === 'sending' || emailSent[company] === 'sent'}
                                                        className={`text-sm px-4 py-2 rounded-lg border transition-all flex items-center gap-2 font-medium
                                                            ${emailSent[company] === 'sent'
                                                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                                                                : 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20'
                                                            }`}
                                                    >
                                                        {emailSent[company] === 'sending' ? (
                                                            <span>Sending...</span>
                                                        ) : emailSent[company] === 'sent' ? (
                                                            <>
                                                                <Check size={16} />
                                                                Sent
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Mail size={16} />
                                                                Send Invoice
                                                            </>
                                                        )}
                                                    </button>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-sm text-amber-500 bg-amber-500/10 px-4 py-2 rounded-lg border border-amber-500/20 cursor-help" title="No email found for this company">
                                                        <AlertCircle size={16} />
                                                        <span>Contact Admin</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    {/* Items List */}
                                    <div className="divide-y divide-white/5 print:divide-slate-200">
                                        {data.items.map((item, idx) => (
                                            <div key={`${item.id}-${idx}`} className="p-6 hover:bg-white/5 transition-colors flex items-start gap-6 group print:hover:bg-transparent print:py-4 print:px-8">
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-lg font-bold text-slate-200 truncate print:text-black">{item.name}</h4>
                                                    <p className="text-slate-400 text-sm mt-1 line-clamp-2 print:text-slate-600 leading-relaxed">{item.description}</p>

                                                    {/* Specs Display */}
                                                    {showInvoice && item.specifications && (
                                                        <div className="mt-4 p-4 bg-black/20 rounded-xl print:bg-slate-50 print:border print:border-slate-200">
                                                            <div className="text-[10px] text-slate-500 font-mono uppercase tracking-widest mb-2 print:text-slate-500">Specifications</div>
                                                            <div className="text-xs text-slate-300 font-mono grid grid-cols-2 gap-2 print:text-slate-700">
                                                                {(() => {
                                                                    // Parsing Logic for Specs
                                                                    let specs = item.specifications;
                                                                    if (typeof specs === 'string') {
                                                                        try { specs = JSON.parse(specs); } catch (e) { }
                                                                    }

                                                                    if (typeof specs === 'object' && !Array.isArray(specs)) {
                                                                        return Object.entries(specs).slice(0, 6).map(([k, v]) => (
                                                                            <div key={k} className="flex gap-2">
                                                                                <span className="text-slate-500 capitalize">{k.replace(/_/g, ' ')}:</span>
                                                                                <span className="font-medium">{String(v)}</span>
                                                                            </div>
                                                                        ));
                                                                    }
                                                                    return <div className="col-span-2">{JSON.stringify(specs).slice(0, 200)}</div>;
                                                                })()}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                {!showInvoice && (
                                                    <button
                                                        onClick={() => onRemoveFromCart(item.id)}
                                                        className="p-3 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100 border border-transparent hover:border-red-500/20"
                                                        title="Remove from cart"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                    </div>

                                    {/* Print Footer per Invoice */}
                                    {showInvoice && (
                                        <div className="hidden print:block mt-8 mx-8 pt-4 border-t-2 border-slate-800">
                                            <div className="flex justify-between text-sm text-slate-600">
                                                <span>Total Items: {data.items.length}</span>
                                                <span>Please contact {data.email || "admin"} for payment details.</span>
                                            </div>
                                            <div className="mt-8 text-center text-xs text-slate-400">
                                                Generated by LuminaScan AI Catalog
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer / Aggregates */}
                {cart.length > 0 && !showInvoice && (
                    <div className="mt-8 p-6 bg-slate-800/50 border border-white/5 rounded-2xl flex justify-between items-center text-slate-400 text-sm print:hidden backdrop-blur-sm">
                        <span>Total Companies: <strong className="text-white ml-1">{Object.keys(groupedItems).length}</strong></span>
                        <span>Total Items: <strong className="text-white ml-1">{cart.length}</strong></span>
                    </div>
                )}
            </div>

            {/* Print Styles */}
            <style jsx global>{`
                @media print {
                    @page { margin: 1cm; size: auto; }
                    body {
                        visibility: hidden;
                        background: white;
                    }
                    /* Reset everything */
                    #root > div {
                         position: static !important;
                         height: auto !important;
                         overflow: visible !important;
                    }
                    
                    /* Show the main content */
                    .w-full.min-h-screen {
                        visibility: visible;
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        background: white;
                        color: black;
                        z-index: 9999;
                    }
                    .w-full.min-h-screen * {
                        visibility: visible;
                    }

                    /* Hide UI controls */
                    button, .no-print, [role="button"], header, footer {
                        display: none !important;
                    }
                    
                    /* Main container reset */
                    .bg-slate-900, .bg-slate-800 {
                        background: white !important;
                        color: black !important;
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
        </div>
    );
}
