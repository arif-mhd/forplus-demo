import React, { useState, useEffect } from 'react';
import { ArrowLeft, ExternalLink, Save, Plus, Trash2, LayoutTemplate, Palette, FileText } from 'lucide-react';
import { api } from '../../lib/api';
import { saveDocument } from '../utils/storage';

export default function Editor({ docType, templateId, initialData, onBack }) {
    const [activeTab, setActiveTab] = useState('general'); // general, items, design
    const [loading, setLoading] = useState(false);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [isDirty, setIsDirty] = useState(false);

    // Data State
    const [data, setData] = useState(initialData || {
        id: crypto.randomUUID(),
        type: docType,
        company: { name: 'Acme Corp', address: '123 Business Rd', email: 'billing@acme.com' },
        client: { name: 'Client Inc', address: '456 Client Ave', email: 'accounts@client.com' },
        meta: { invoiceNumber: 'INV-001', date: new Date().toISOString().split('T')[0], dueDate: '' },
        items: [{ name: 'Service A', description: '', quantity: 1, price: 100, total: 100 }],
        totals: { subtotal: 100, taxRate: 0, tax: 0, grandTotal: 100 },
        currency: '$',
        notes: ''
    });

    const [styleConfig, setStyleConfig] = useState({
        primaryColor: '#3b82f6',
        fontFamily: 'Helvetica',
        headerBg: '#f3f4f6',
        templateId: templateId
    });

    // --- Calculations ---
    useEffect(() => {
        // Recalculate totals whenever items or tax changes
        const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
        const tax = (subtotal * data.totals.taxRate) / 100;
        const grandTotal = subtotal + tax;

        if (subtotal !== data.totals.subtotal || tax !== data.totals.tax || grandTotal !== data.totals.grandTotal) {
            setData(prev => ({
                ...prev,
                totals: { ...prev.totals, subtotal, tax, grandTotal }
            }));
            setIsDirty(true);
        }
    }, [data.items, data.totals.taxRate]);


    // --- Handlers ---
    const updateItem = (index, field, value) => {
        const newItems = [...data.items];
        newItems[index] = { ...newItems[index], [field]: value };
        // Update total for this item
        newItems[index].total = newItems[index].quantity * newItems[index].price;
        setData({ ...data, items: newItems });
        setIsDirty(true);
    };

    const addItem = () => {
        setData({
            ...data,
            items: [...data.items, { name: '', description: '', quantity: 1, price: 0, total: 0 }]
        });
    };

    const removeItem = (index) => {
        if (data.items.length === 1) return;
        const newItems = data.items.filter((_, i) => i !== index);
        setData({ ...data, items: newItems });
    };

    const handleSave = () => {
        saveDocument({
            id: data.id,
            name: `${data.company.name} - ${data.meta.invoiceNumber}`,
            type: docType,
            data: data,
            styleConfig: styleConfig,
            status: 'Draft'
        });
        setIsDirty(false);
        alert('Draft Saved!');
    };

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const url = await api.generatePdf(docType, data, styleConfig);
            setPdfUrl(url);
        } catch (error) {
            console.error(error);
            alert('Generation Failed');
        } finally {
            setLoading(false);
        }
    };

    // --- Renderers ---
    const renderTabs = () => (
        <div className="flex border-b border-white/10 mb-6">
            <button onClick={() => setActiveTab('general')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'general' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
                <FileText size={16} /> Details
            </button>
            <button onClick={() => setActiveTab('items')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'items' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
                <LayoutTemplate size={16} /> Line Items
            </button>
            <button onClick={() => setActiveTab('design')} className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'design' ? 'border-indigo-500 text-white' : 'border-transparent text-gray-400 hover:text-white'}`}>
                <Palette size={16} /> Design {styleConfig.primaryColor && <div className="w-2 h-2 rounded-full" style={{ background: styleConfig.primaryColor }} />}
            </button>
        </div>
    );

    return (
        <div className="flex h-screen overflow-hidden bg-[#050505]">

            {/* Left Panel: Inputs */}
            <div className="w-1/2 flex flex-col border-r border-white/5 bg-[#0A0A0A]">
                {/* Header */}
                <div className="p-4 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-lg text-gray-400 transition-colors">
                            <ArrowLeft size={18} />
                        </button>
                        <span className="font-bold text-white capitalize">{docType} Editor</span>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={handleSave} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-xs font-medium text-white flex items-center gap-2 transition-colors">
                            <Save size={14} /> {isDirty ? 'Save Changes' : 'Saved'}
                        </button>
                    </div>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {renderTabs()}

                    {activeTab === 'general' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div className="space-y-4">
                                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold">From (You)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Company Name" className="input-dark" value={data.company.name} onChange={e => setData({ ...data, company: { ...data.company, name: e.target.value } })} />
                                    <input placeholder="Email" className="input-dark" value={data.company.email} onChange={e => setData({ ...data, company: { ...data.company, email: e.target.value } })} />
                                    <input placeholder="Address" className="input-dark col-span-2" value={data.company.address} onChange={e => setData({ ...data, company: { ...data.company, address: e.target.value } })} />
                                </div>
                            </div>
                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold">To (Client)</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <input placeholder="Client Name" className="input-dark" value={data.client.name} onChange={e => setData({ ...data, client: { ...data.client, name: e.target.value } })} />
                                    <input placeholder="Email" className="input-dark" value={data.client.email} onChange={e => setData({ ...data, client: { ...data.client, email: e.target.value } })} />
                                    <input placeholder="Address" className="input-dark col-span-2" value={data.client.address} onChange={e => setData({ ...data, client: { ...data.client, address: e.target.value } })} />
                                </div>
                            </div>
                            <div className="space-y-4 pt-6 border-t border-white/5">
                                <h3 className="text-xs uppercase tracking-wider text-gray-500 font-bold">MetaData</h3>
                                <div className="grid grid-cols-3 gap-4">
                                    <input placeholder="Invoice #" className="input-dark" value={data.meta.invoiceNumber} onChange={e => setData({ ...data, meta: { ...data.meta, invoiceNumber: e.target.value } })} />
                                    <input type="date" className="input-dark" value={data.meta.date} onChange={e => setData({ ...data, meta: { ...data.meta, date: e.target.value } })} />
                                    <input type="date" className="input-dark" value={data.meta.dueDate} onChange={e => setData({ ...data, meta: { ...data.meta, dueDate: e.target.value } })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'items' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
                            {data.items.map((item, i) => (
                                <div key={i} className="p-4 bg-white/5 rounded-xl border border-white/5 relative group">
                                    <div className="grid grid-cols-12 gap-3 mb-2">
                                        <div className="col-span-6">
                                            <label className="text-[10px] text-gray-500 mb-1 block">Item Name</label>
                                            <input className="input-dark w-full" value={item.name} onChange={e => updateItem(i, 'name', e.target.value)} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className="text-[10px] text-gray-500 mb-1 block">Qty</label>
                                            <input type="number" className="input-dark w-full" value={item.quantity} onChange={e => updateItem(i, 'quantity', parseFloat(e.target.value))} />
                                        </div>
                                        <div className="col-span-3">
                                            <label className="text-[10px] text-gray-500 mb-1 block">Price</label>
                                            <input type="number" className="input-dark w-full" value={item.price} onChange={e => updateItem(i, 'price', parseFloat(e.target.value))} />
                                        </div>
                                        <div className="col-span-1 flex items-end justify-center">
                                            <button onClick={() => removeItem(i)} className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                    <input placeholder="Description (Optional)" className="input-dark w-full text-xs" value={item.description} onChange={e => updateItem(i, 'description', e.target.value)} />
                                </div>
                            ))}

                            <button onClick={addItem} className="w-full py-3 border border-dashed border-white/20 rounded-xl text-sm text-gray-400 hover:text-white hover:border-white/40 transition-all flex items-center justify-center gap-2">
                                <Plus size={16} /> Add Line Item
                            </button>

                            <div className="mt-8 p-4 bg-indigo-900/10 rounded-xl border border-indigo-500/20">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-400">Currency</span>
                                    <select value={data.currency} onChange={e => setData({ ...data, currency: e.target.value })} className="bg-transparent text-white text-sm border-none focus:ring-0 cursor-pointer">
                                        <option value="$">USD ($)</option>
                                        <option value="€">EUR (€)</option>
                                        <option value="£">GBP (£)</option>
                                    </select>
                                </div>
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-sm text-gray-400">Tax Rate (%)</span>
                                    <input type="number" className="bg-transparent text-right text-white text-sm w-16 border-b border-white/10" value={data.totals.taxRate} onChange={e => setData({ ...data, totals: { ...data.totals, taxRate: e.target.value } })} />
                                </div>
                                <div className="flex justify-between items-center pt-2 border-t border-white/10 font-bold text-lg text-white">
                                    <span>Total</span>
                                    <span>{data.currency}{data.totals.grandTotal.toFixed(2)}</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'design' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-300">
                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">Primary Color</label>
                                <div className="flex gap-2 flex-wrap">
                                    {['#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#f59e0b', '#000000'].map(color => (
                                        <button
                                            key={color}
                                            onClick={() => setStyleConfig({ ...styleConfig, primaryColor: color })}
                                            className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${styleConfig.primaryColor === color ? 'border-white' : 'border-transparent'}`}
                                            style={{ backgroundColor: color }}
                                        />
                                    ))}
                                    <input type="color" className="w-8 h-8 rounded-full overflow-hidden cursor-pointer" value={styleConfig.primaryColor} onChange={e => setStyleConfig({ ...styleConfig, primaryColor: e.target.value })} />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">Template Layout</label>
                                <select
                                    value={styleConfig.templateId}
                                    onChange={e => setStyleConfig({ ...styleConfig, templateId: e.target.value })}
                                    className="input-dark w-full mb-4"
                                >
                                    <option value="modern">Modern Clean</option>
                                    <option value="classic">Corporate Classic</option>
                                    <option value="bold">Bold Impact</option>
                                    <option value="professional">Professional Sidebar</option>
                                    <option value="minimalist">Pure Minimalist</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-xs font-medium text-gray-400 mb-2">Font Family</label>
                                <select
                                    value={styleConfig.fontFamily}
                                    onChange={e => setStyleConfig({ ...styleConfig, fontFamily: e.target.value })}
                                    className="input-dark w-full"
                                >
                                    <option value="Helvetica">Helvetica (Modern)</option>
                                    <option value="Times New Roman">Times New Roman (Classic)</option>
                                    <option value="Courier New">Courier (Technical)</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Action */}
                <div className="p-4 border-t border-white/5 bg-[#0A0A0A]">
                    <button onClick={handleGenerate} disabled={loading} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors disabled:opacity-50">
                        {loading ? 'Generating Preview...' : 'Update Preview'}
                    </button>
                </div>
            </div>

            {/* Right Panel: Preview */}
            <div className="w-1/2 bg-[#111] relative flex items-center justify-center p-8">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>

                {pdfUrl ? (
                    <iframe src={pdfUrl} className="w-full h-full max-w-[500px] shadow-2xl rounded-lg bg-white z-10" />
                ) : (
                    <div className="text-center text-gray-500 z-10">
                        <FileText size={48} className="mx-auto mb-4 opacity-20" />
                        <p>Click "Update Preview" to render.</p>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .input-dark {
                    background: rgba(255,255,255,0.05);
                    border: 1px solid rgba(255,255,255,0.1);
                    border-radius: 0.5rem;
                    padding: 0.5rem 0.75rem;
                    color: white;
                    font-size: 0.875rem;
                    transition: all 0.2s;
                }
                .input-dark:focus {
                    outline: none;
                    border-color: #6366f1;
                    background: rgba(255,255,255,0.1);
                }
            `}</style>
        </div>
    );
}
