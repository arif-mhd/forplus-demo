"use client";

import React, { useState } from 'react';
import { Download, ArrowLeft, Settings, Type, Image as ImageIcon, Calendar, Hash, DollarSign, Palette, Layout, Percent, MoveRight, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface InvoiceData {
    companyName: string;
    companyAddress: string;
    logoUrl: string;
    billToName: string;
    billToAddress: string;
    invoiceNumber: string;
    date: string;
    currency: string;
    taxRate: number;
    discount: number;
    items: { id: number; description: string; qty: number; price: number }[];
}

interface DesignConfig {
    primaryColor: string;
    font: string;
}

export default function FixedEditor({ templateType }: { templateType: string }) {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'content' | 'design'>('content');

    // Default config based on template type
    const [design, setDesign] = useState<DesignConfig>({
        primaryColor:
            templateType === 'modern' ? '#10b981' :
                templateType === 'classic' ? '#2563eb' :
                    templateType === 'bold' ? '#9333ea' :
                        templateType === 'creative' ? '#db2777' :
                            templateType === 'executive' ? '#ca8a04' :
                                templateType === 'tech' ? '#525252' : '#000000',
        font:
            templateType === 'classic' || templateType === 'executive' || templateType === 'legal' ? 'font-serif' :
                templateType === 'tech' ? 'font-mono' : 'font-sans'
    });

    const [data, setData] = useState<InvoiceData>({
        companyName: 'Acme Corp',
        companyAddress: '123 Business Rd, Tech City, TC 90210',
        logoUrl: '',
        billToName: 'John Doe',
        billToAddress: '456 Client Ln, Market Town, MT 12345',
        invoiceNumber: 'INV-2024-001',
        date: new Date().toISOString().split('T')[0],
        currency: '$',
        taxRate: 0,
        discount: 0,
        items: [
            { id: 1, description: 'Web Development Services', qty: 1, price: 1000 },
            { id: 2, description: 'Hosting (Annual)', qty: 1, price: 120 },
        ]
    });

    const subtotal = data.items.reduce((acc, item) => acc + (item.qty * item.price), 0);
    const taxAmount = (subtotal * data.taxRate) / 100;
    const total = subtotal + taxAmount - data.discount;

    const updateField = (field: keyof InvoiceData, value: any) => {
        setData(prev => ({ ...prev, [field]: value }));
    };

    const updateItem = (id: number, field: string, value: any) => {
        setData(prev => ({
            ...prev,
            items: prev.items.map(item => item.id === id ? { ...item, [field]: value } : item)
        }));
    };

    const addItem = () => {
        setData(prev => ({
            ...prev,
            items: [
                ...prev.items,
                { id: Date.now(), description: '', qty: 1, price: 0 }
            ]
        }));
    };

    const colorOptions = [
        '#000000', // Black
        '#2563eb', // Blue
        '#10b981', // Emerald
        '#9333ea', // Purple
        '#db2777', // Pink
        '#ca8a04', // Yellow/Gold
        '#dc2626', // Red
        '#525252', // Neutral
    ];

    const fontOptions = [
        { id: 'font-sans', name: 'Inter (Sans)', class: 'font-sans' },
        { id: 'font-serif', name: 'Merriweather (Serif)', class: 'font-serif' },
        { id: 'font-mono', name: 'JetBrains (Mono)', class: 'font-mono' },
    ];

    const currencyOptions = ['$', '€', '£', '₹', '¥', 'R'];

    return (
        <div className="h-screen flex flex-col bg-[#050505] text-white overflow-hidden">
            <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0A0A0A]">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push('/')}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                        title="Dashboard"
                    >
                        <LayoutDashboard size={20} />
                    </button>
                    <div className="h-6 w-px bg-white/10"></div>
                    <button
                        onClick={() => router.back()}
                        className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                        title="Back"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-sm font-semibold text-white">Untitled Document</h1>
                        <p className="text-xs text-gray-500 capitalize">{templateType} Template</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition-colors">
                        <Download size={16} />
                        Export PDF
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-full text-gray-400">
                        <Settings size={20} />
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                <aside className="w-80 border-r border-white/5 bg-[#0A0A0A] flex flex-col">
                    {/* Tabs */}
                    <div className="flex border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('content')}
                            className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${activeTab === 'content' ? 'text-white border-b-2 border-indigo-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Layout size={14} className="inline mb-0.5 mr-2" /> Content
                        </button>
                        <button
                            onClick={() => setActiveTab('design')}
                            className={`flex-1 py-3 text-xs font-medium uppercase tracking-wider transition-colors ${activeTab === 'design' ? 'text-white border-b-2 border-indigo-500 bg-white/5' : 'text-gray-500 hover:text-gray-300'}`}
                        >
                            <Palette size={14} className="inline mb-0.5 mr-2" /> Design
                        </button>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6">
                        {activeTab === 'content' ? (
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <ImageIcon size={14} className="text-indigo-400" /> Company Info
                                    </label>
                                    <div className="space-y-2">
                                        <input type="text" value={data.logoUrl} onChange={(e) => updateField('logoUrl', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-colors" placeholder="Logo URL (https://...)" />
                                        <input type="text" value={data.companyName} onChange={(e) => updateField('companyName', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-colors" placeholder="Company Name" />
                                        <textarea value={data.companyAddress} onChange={(e) => updateField('companyAddress', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-colors scrollbar-none" placeholder="Company Address" rows={2} />
                                    </div>
                                </div>

                                <div className="space-y-3">
                                    <label className="text-sm font-medium text-gray-300 flex items-center gap-2">
                                        <Type size={14} className="text-indigo-400" /> Bill To
                                    </label>
                                    <input type="text" value={data.billToName} onChange={(e) => updateField('billToName', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-colors" placeholder="Client Name" />
                                    <textarea value={data.billToAddress} onChange={(e) => updateField('billToAddress', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:border-indigo-500 outline-none transition-colors" placeholder="Client Address" rows={2} />
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Invoice #</label>
                                        <div className="relative">
                                            <Hash size={12} className="absolute left-3 top-2.5 text-gray-500" />
                                            <input type="text" value={data.invoiceNumber} onChange={(e) => updateField('invoiceNumber', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500">Date</label>
                                        <div className="relative">
                                            <Calendar size={12} className="absolute left-3 top-2.5 text-gray-500" />
                                            <input type="date" value={data.date} onChange={(e) => updateField('date', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg pl-8 pr-3 py-2 text-sm text-white focus:border-indigo-500 outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Settings</h4>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-500 uppercase">Currency</label>
                                            <select value={data.currency} onChange={(e) => updateField('currency', e.target.value)} className="w-full bg-[#111] border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:border-indigo-500 outline-none appearance-none text-center">
                                                {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-500 uppercase">Tax %</label>
                                            <input type="number" value={data.taxRate} onChange={(e) => updateField('taxRate', parseFloat(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:border-indigo-500 outline-none text-center" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] text-gray-500 uppercase">Discount</label>
                                            <input type="number" value={data.discount} onChange={(e) => updateField('discount', parseFloat(e.target.value))} className="w-full bg-[#111] border border-white/10 rounded-lg px-2 py-2 text-sm text-white focus:border-indigo-500 outline-none text-center" />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4 border-t border-white/10">
                                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Line Items</h4>
                                    <div className="space-y-4">
                                        {data.items.map((item) => (
                                            <div key={item.id} className="bg-[#111] p-3 rounded-lg border border-white/5 space-y-2">
                                                <input type="text" value={item.description} onChange={(e) => updateItem(item.id, 'description', e.target.value)} className="w-full bg-transparent border-b border-white/5 pb-1 text-sm text-white focus:border-indigo-500 outline-none" placeholder="Description" />
                                                <div className="flex gap-2">
                                                    <input type="number" value={item.qty} onChange={(e) => updateItem(item.id, 'qty', parseFloat(e.target.value))} className="w-16 bg-transparent border-b border-white/5 pb-1 text-sm text-white text-center focus:border-indigo-500 outline-none" placeholder="Qty" />
                                                    <div className="flex-1 flex items-center border-b border-white/5 pb-1 text-gray-500">
                                                        <span className="text-xs mr-1">{data.currency}</span>
                                                        <input type="number" value={item.price} onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value))} className="w-full bg-transparent text-sm text-white focus:border-indigo-500 outline-none" placeholder="Price" />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                        <button onClick={addItem} className="w-full py-2 border border-dashed border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:border-white/20 transition-all">+ Add Item</button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-300">
                                <div>
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Color Theme</h3>
                                    <div className="grid grid-cols-4 gap-3">
                                        {colorOptions.map((color) => (
                                            <button
                                                key={color}
                                                onClick={() => setDesign(prev => ({ ...prev, primaryColor: color }))}
                                                className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${design.primaryColor === color ? 'border-white ring-2 ring-white/20' : 'border-transparent'}`}
                                                style={{ backgroundColor: color }}
                                            />
                                        ))}
                                        <div className="col-span-4 mt-2">
                                            <div className="flex items-center gap-2 bg-[#111] p-2 rounded-lg border border-white/10">
                                                <input
                                                    type="color"
                                                    value={design.primaryColor}
                                                    onChange={(e) => setDesign(prev => ({ ...prev, primaryColor: e.target.value }))}
                                                    className="w-8 h-8 rounded cursor-pointer bg-transparent border-none"
                                                />
                                                <span className="text-xs text-gray-400 uppercase">{design.primaryColor}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-8 border-t border-white/10">
                                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Typography</h3>
                                    <div className="space-y-2">
                                        {fontOptions.map((font) => (
                                            <div
                                                key={font.id}
                                                onClick={() => setDesign(prev => ({ ...prev, font: font.class }))}
                                                className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${design.font === font.class ? 'bg-[#1A1A1A] border-indigo-500 text-white' : 'bg-[#111] border-white/5 text-gray-400 hover:bg-[#161616]'}`}
                                            >
                                                <span className={font.class}>{font.name}</span>
                                                {design.font === font.class && <div className="w-2 h-2 rounded-full bg-indigo-500"></div>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </aside>

                <div className="flex-1 bg-[#1A1A1A] p-8 overflow-auto flex justify-center min-h-[calc(100vh-64px)] items-start">
                    <div className={`w-[210mm] min-h-[297mm] bg-white shadow-2xl relative text-black p-12 flex flex-col transition-all duration-300 origin-top scale-90 lg:scale-100 ${design.font}`}>

                        {/* MINIMAL */}
                        {templateType === 'minimal' && (
                            <div className="w-full h-full flex flex-col items-stretch">
                                <div className="flex justify-between items-end mb-16">
                                    <div>
                                        {data.logoUrl && <img src={data.logoUrl} alt="Logo" className="h-12 w-auto mb-4 object-contain" />}
                                        <h1 className="text-2xl font-light tracking-wide lowercase text-gray-400">invoice #{data.invoiceNumber}</h1>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-medium" style={{ color: design.primaryColor }}>{data.companyName}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-12 mb-16">
                                    <div>
                                        <div className="text-xs font-medium text-gray-400 mb-2">Billed To</div>
                                        <div className="text-sm">{data.billToName}</div>
                                        <div className="text-sm text-gray-500 whitespace-pre-line">{data.billToAddress}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-medium text-gray-400 mb-2">Issued</div>
                                        <div className="text-sm">{data.date}</div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <table className="w-full text-left">
                                        <tbody>
                                            {data.items.map((item) => (
                                                <tr key={item.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 text-sm font-medium">{item.description}</td>
                                                    <td className="py-4 text-center text-sm text-gray-500 w-24">x {item.qty}</td>
                                                    <td className="py-4 text-right text-sm font-medium w-32">{data.currency}{((item.qty * item.price)).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t border-gray-100">
                                            <tr>
                                                <td colSpan={2} className="py-2 text-right text-sm text-gray-400">Subtotal</td>
                                                <td className="py-2 text-right text-sm text-gray-700">{data.currency}{subtotal.toFixed(2)}</td>
                                            </tr>
                                            {data.taxRate > 0 && (
                                                <tr>
                                                    <td colSpan={2} className="py-2 text-right text-sm text-gray-400">Tax ({data.taxRate}%)</td>
                                                    <td className="py-2 text-right text-sm text-gray-700">{data.currency}{taxAmount.toFixed(2)}</td>
                                                </tr>
                                            )}
                                            {data.discount > 0 && (
                                                <tr>
                                                    <td colSpan={2} className="py-2 text-right text-sm text-gray-400">Discount</td>
                                                    <td className="py-2 text-right text-sm text-red-500">-{data.currency}{data.discount.toFixed(2)}</td>
                                                </tr>
                                            )}
                                        </tfoot>
                                    </table>
                                </div>
                                <div className="flex justify-end mt-8 border-t pt-8" style={{ borderColor: design.primaryColor }}>
                                    <div className="flex gap-12 items-baseline">
                                        <span className="text-sm text-gray-500">Total Due</span>
                                        <span className="text-3xl font-light" style={{ color: design.primaryColor }}>{data.currency}{total.toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* MODERN (Refined) */}
                        {(templateType === 'modern' || templateType === 'invoice') && (
                            <div className="w-full h-full flex flex-col relative items-stretch">
                                <div className="absolute top-0 right-0 w-64 h-64 opacity-10 rounded-bl-full -mr-12 -mt-12 z-0" style={{ backgroundColor: design.primaryColor }}></div>
                                <div className="relative z-10 flex justify-between items-start mb-16">
                                    <div className="flex overflow-hidden items-start">
                                        {data.logoUrl ? (
                                            <img src={data.logoUrl} alt="Logo" className="h-16 w-auto mr-4 object-contain rounded" />
                                        ) : (
                                            <div className="text-white p-4 font-bold text-2xl tracking-tighter" style={{ backgroundColor: design.primaryColor }}>
                                                {data.companyName.substring(0, 2).toUpperCase()}
                                            </div>
                                        )}
                                        <div className={data.logoUrl ? "pt-1" : "pl-4 pt-2"}>
                                            <h1 className="font-bold text-gray-900 leading-none">{data.companyName}</h1>
                                            <p className="text-xs text-gray-500 mt-1">{data.companyAddress}</p>
                                        </div>
                                    </div>
                                    <div className="text-right mt-4">
                                        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none opacity-20" style={{ color: design.primaryColor }}>Invoice</h2>
                                        <p className="font-mono text-gray-400 mt-1">#{data.invoiceNumber}</p>
                                    </div>
                                </div>
                                <div className="relative z-10 grid grid-cols-2 gap-8 mb-12">
                                    <div>
                                        <h3 className="font-bold uppercase text-xs tracking-widest mb-2" style={{ color: design.primaryColor }}>Bill To</h3>
                                        <p className="font-bold text-gray-900 text-lg">{data.billToName}</p>
                                        <p className="text-gray-500 text-sm mt-1 whitespace-pre-line">{data.billToAddress}</p>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h3 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-1">Date</h3>
                                            <p className="font-medium text-gray-900">{data.date}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-gray-400 font-bold uppercase text-xs tracking-widest mb-1">Due Date</h3>
                                            <p className="font-medium text-gray-900">{data.date}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="relative z-10 flex-1">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr>
                                                <th className="py-4 border-b-2 font-bold uppercase text-xs tracking-wider" style={{ borderColor: `${design.primaryColor}33`, color: design.primaryColor }}>Description</th>
                                                <th className="py-4 border-b-2 font-bold uppercase text-xs tracking-wider text-center" style={{ borderColor: `${design.primaryColor}33`, color: design.primaryColor }}>Qty</th>
                                                <th className="py-4 border-b-2 font-bold uppercase text-xs tracking-wider text-right" style={{ borderColor: `${design.primaryColor}33`, color: design.primaryColor }}>Price</th>
                                                <th className="py-4 border-b-2 font-bold uppercase text-xs tracking-wider text-right" style={{ borderColor: `${design.primaryColor}33`, color: design.primaryColor }}>Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {data.items.map((item) => (
                                                <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                                                    <td className="py-4 font-medium text-gray-700 group-hover:text-black">{item.description}</td>
                                                    <td className="py-4 text-center text-gray-400">{item.qty}</td>
                                                    <td className="py-4 text-right text-gray-500">{data.currency}{item.price.toFixed(2)}</td>
                                                    <td className="py-4 text-right font-bold text-gray-900">{data.currency}{(item.qty * item.price).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="relative z-10 mt-8 flex justify-end">
                                    <div className="w-72 text-white p-6 rounded-lg shadow-xl" style={{ backgroundColor: design.primaryColor }}>
                                        <div className="flex justify-between items-center opacity-80 mb-2 text-sm">
                                            <span>Subtotal</span>
                                            <span>{data.currency}{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center opacity-80 mb-2 text-sm">
                                            <span>Tax ({data.taxRate}%)</span>
                                            <span>{data.currency}{taxAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center opacity-80 mb-4 text-sm">
                                            <span>Discount</span>
                                            <span>-{data.currency}{data.discount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center font-bold text-2xl pt-4 border-t border-white/20">
                                            <span>Total</span>
                                            <span>{data.currency}{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CLASSIC */}
                        {templateType === 'classic' && (
                            <div className="w-full h-full flex flex-col items-stretch border-2 border-double p-8 m-[-2rem]" style={{ borderColor: design.primaryColor }}>
                                <div className="flex justify-between items-end border-b pb-8 mb-8" style={{ borderColor: design.primaryColor }}>
                                    <div className="flex items-center gap-4">
                                        {data.logoUrl && <img src={data.logoUrl} alt="Logo" className="h-16 w-auto object-contain" />}
                                        <div>
                                            <h1 className="text-4xl font-serif tracking-tight" style={{ color: design.primaryColor }}>{data.companyName}</h1>
                                            <div className="text-sm text-gray-600 mt-1">{data.companyAddress}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <h2 className="text-xl uppercase tracking-widest text-gray-500">Invoice</h2>
                                        <div className="font-mono mt-1">No. {data.invoiceNumber}</div>
                                    </div>
                                </div>
                                <div className="flex justify-between mb-12">
                                    <div className="w-1/2">
                                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Billed To</div>
                                        <div className="text-lg">{data.billToName}</div>
                                        <div className="text-gray-600 whitespace-pre-line mt-1">{data.billToAddress}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-2">Date</div>
                                        <div>{data.date}</div>
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <table className="w-full">
                                        <thead className="bg-gray-50 border-t border-b border-gray-200">
                                            <tr>
                                                <th className="py-2 pl-2 text-left font-bold text-xs uppercase tracking-wider">Item</th>
                                                <th className="py-2 text-center font-bold text-xs uppercase tracking-wider">Qty</th>
                                                <th className="py-2 text-right font-bold text-xs uppercase tracking-wider">Rate</th>
                                                <th className="py-2 pr-2 text-right font-bold text-xs uppercase tracking-wider">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-100">
                                            {data.items.map((item) => (
                                                <tr key={item.id}>
                                                    <td className="py-3 pl-2">{item.description}</td>
                                                    <td className="py-3 text-center">{item.qty}</td>
                                                    <td className="py-3 text-right">{data.currency}{item.price.toFixed(2)}</td>
                                                    <td className="py-3 pr-2 text-right font-bold" style={{ color: design.primaryColor }}>{data.currency}{(item.qty * item.price).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                                <div className="border-t border-gray-300 pt-4 flex justify-end">
                                    <div className="w-64">
                                        <div className="flex justify-between py-1">
                                            <span className="text-gray-600">Subtotal:</span>
                                            <span>{data.currency}{subtotal.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-1 text-sm text-gray-500">
                                            <span>Tax:</span>
                                            <span>{data.currency}{taxAmount.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between py-1 text-xl font-bold border-t border-gray-200 mt-2 pt-2" style={{ color: design.primaryColor }}>
                                            <span>Total:</span>
                                            <span>{data.currency}{total.toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* BOLD */}
                        {templateType === 'bold' && (
                            <div className="w-full h-full flex flex-col items-stretch">
                                <div className="text-white p-12 -mx-12 -mt-12 mb-12 flex justify-between items-start clip-path-slant" style={{ backgroundColor: '#111' }}>
                                    <div>
                                        {data.logoUrl && <img src={data.logoUrl} alt="Logo" className="h-16 w-auto mb-4 object-contain brightness-0 invert" />}
                                        <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: design.primaryColor }}>Invoice To</div>
                                        <h2 className="text-2xl font-bold">{data.billToName}</h2>
                                    </div>
                                    <div className="text-right">
                                        <h1 className="text-6xl font-black tracking-tighter text-white/10 absolute top-4 right-12 select-none">INVOICE</h1>
                                        <div className="relative z-10">
                                            <div className="font-mono text-xl" style={{ color: design.primaryColor }}>#{data.invoiceNumber}</div>
                                            <div className="text-sm text-gray-400">{data.date}</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="mb-12">
                                    <h3 className="text-xs font-black text-black uppercase tracking-widest mb-2 border-b-2 border-black pb-2">From</h3>
                                    <div className="font-bold">{data.companyName}</div>
                                    <div className="text-sm text-gray-500">{data.companyAddress}</div>
                                </div>
                                <div className="flex-1">
                                    {data.items.map((item, i) => (
                                        <div key={item.id} className="flex items-center gap-4 mb-4">
                                            <div className="text-white w-8 h-8 flex items-center justify-center font-bold text-sm rounded-sm" style={{ backgroundColor: design.primaryColor }}>
                                                {i + 1}
                                            </div>
                                            <div className="flex-1 border-b border-gray-200 pb-2">
                                                <div className="font-bold">{item.description}</div>
                                            </div>
                                            <div className="text-right border-b border-gray-200 pb-2 min-w-[100px]">
                                                <div className="font-bold">{data.currency}{(item.qty * item.price).toFixed(2)}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className="p-8 -mx-12 -mb-12 flex items-center justify-between" style={{ backgroundColor: design.primaryColor }}>
                                    <div className="font-bold text-white uppercase tracking-widest text-sm">Total Amount Due</div>
                                    <div className="text-4xl font-black text-white">{data.currency}{total.toFixed(2)}</div>
                                </div>
                            </div>
                        )}

                        {/* EXECUTIVE */}
                        {templateType === 'executive' && (
                            <div className="w-full h-full flex flex-col items-stretch text-gray-800">
                                <div className="bg-[#0a0a0a] text-white p-12 -mx-12 -mt-12 mb-12 flex justify-between items-center relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl -mr-16 -mt-16 opacity-30" style={{ backgroundColor: design.primaryColor }}></div>
                                    <div className="relative z-10 flex items-center gap-8">
                                        {data.logoUrl && <img src={data.logoUrl} alt="Logo" className="h-20 w-auto object-contain brightness-0 invert opacity-80" />}
                                        <div className={!data.logoUrl ? "" : "border-l border-white/20 pl-8"}>
                                            <div className="text-xs font-bold tracking-[0.3em] uppercase mb-2" style={{ color: design.primaryColor }}>Exclusive Invoice</div>
                                            <h1 className="text-4xl font-light tracking-wide">{data.companyName}</h1>
                                        </div>
                                    </div>
                                    <div className="relative z-10 text-right border-l border-white/20 pl-8">
                                        <div className="text-xs text-gray-400 uppercase tracking-widest">Reference</div>
                                        <div className="text-xl font-medium">{data.invoiceNumber}</div>
                                    </div>
                                </div>

                                <div className="flex justify-between mb-16 px-4">
                                    <div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Recipient</div>
                                        <div className="text-xl font-medium border-l-2 pl-4" style={{ borderColor: design.primaryColor }}>
                                            {data.billToName}
                                        </div>
                                        <div className="text-sm text-gray-500 mt-2 pl-4 max-w-xs">{data.billToAddress}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Details</div>
                                        <div className="flex flex-col gap-2">
                                            <div className="flex justify-end gap-4">
                                                <span className="text-gray-500 text-sm">Issued:</span>
                                                <span className="font-medium">{data.date}</span>
                                            </div>
                                            <div className="flex justify-end gap-4">
                                                <span className="text-gray-500 text-sm">Due:</span>
                                                <span className="font-medium">{data.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1 px-4">
                                    <table className="w-full text-left border-collapse">
                                        <thead>
                                            <tr className="border-b border-gray-800">
                                                <th className="py-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest">Description</th>
                                                <th className="py-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest text-center">Qty</th>
                                                <th className="py-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest text-right">Unit Price</th>
                                                <th className="py-4 text-[10px] font-bold text-gray-800 uppercase tracking-widest text-right">Amount</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {data.items.map((item) => (
                                                <tr key={item.id} className="border-b border-gray-100 last:border-0">
                                                    <td className="py-6 font-medium text-gray-700">{item.description}</td>
                                                    <td className="py-6 text-center text-gray-500 font-mono text-sm">{item.qty}</td>
                                                    <td className="py-6 text-right text-gray-500 font-mono text-sm">{data.currency}{item.price.toFixed(2)}</td>
                                                    <td className="py-6 text-right font-medium text-gray-900 font-mono text-sm">{data.currency}{(item.qty * item.price).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="border-t border-gray-100">
                                            <tr>
                                                <td colSpan={3} className="pt-6 text-right text-gray-500">Subtotal</td>
                                                <td className="pt-6 text-right font-mono">{data.currency}{subtotal.toFixed(2)}</td>
                                            </tr>
                                            <tr>
                                                <td colSpan={3} className="pt-2 text-right text-gray-500">Tax ({data.taxRate}%)</td>
                                                <td className="pt-2 text-right font-mono">{data.currency}{taxAmount.toFixed(2)}</td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div className="bg-gray-50 p-8 -mx-12 -mb-12 border-t border-gray-200 flex justify-end items-center gap-12">
                                    <div className="text-right">
                                        <div className="text-xs text-gray-500 uppercase tracking-widest mb-1">Total Amount</div>
                                        <div className="text-3xl font-serif font-medium" style={{ color: design.primaryColor }}>{data.currency}{total.toFixed(2)}</div>
                                    </div>
                                    <div className="w-px h-12 bg-gray-300"></div>
                                    <div className="text-sm text-gray-400 max-w-[200px] leading-relaxed">
                                        Thank you for your business. Please process payment within 30 days.
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* TECH / MONO */}
                        {templateType === 'tech' && (
                            <div className="w-full h-full flex flex-col items-stretch text-sm text-gray-800 bg-white">
                                <div className="border-b-2 pb-4 mb-8 flex justify-between items-end" style={{ borderColor: design.primaryColor }}>
                                    <div className="flex gap-4">
                                        {data.logoUrl && <img src={data.logoUrl} alt="Logo" className="h-16 w-auto object-contain grayscale" />}
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">// VENDOR</div>
                                            <h1 className="text-2xl font-bold tracking-tighter" style={{ color: design.primaryColor }}>{data.companyName}</h1>
                                            <div className="text-xs text-gray-500 mt-1">{data.companyAddress}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-white px-2 py-1 text-xs mb-2 inline-block" style={{ backgroundColor: design.primaryColor }}>STATUS: PENDING</div>
                                        <div className="text-lg font-bold">{data.invoiceNumber}</div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-8 mb-12 border-b-2 pb-8 border-dashed" style={{ borderColor: design.primaryColor }}>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-2">// KLIENT</div>
                                        <div className="font-bold">{data.billToName}</div>
                                        <div>{data.billToAddress}</div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">DATE_ISSUED</div>
                                            <div>{data.date}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex-1">
                                    <div className="grid grid-cols-12 border-b-2 mb-4 pb-2 text-xs font-bold" style={{ borderColor: design.primaryColor }}>
                                        <div className="col-span-6">ITEM_DESC</div>
                                        <div className="col-span-2 text-center">QTY</div>
                                        <div className="col-span-2 text-right">UNIT_$$</div>
                                        <div className="col-span-2 text-right">TOTAL_$$</div>
                                    </div>
                                    <div className="space-y-2">
                                        {data.items.map((item, i) => (
                                            <div key={item.id} className="grid grid-cols-12 py-2 hover:bg-gray-100">
                                                <div className="col-span-6 flex gap-2">
                                                    <span className="text-gray-400">0{i + 1}</span>
                                                    <span>{item.description}</span>
                                                </div>
                                                <div className="col-span-2 text-center text-gray-500">{item.qty}</div>
                                                <div className="col-span-2 text-right text-gray-500">{item.price.toFixed(2)}</div>
                                                <div className="col-span-2 text-right font-bold">{data.currency}{(item.qty * item.price).toFixed(2)}</div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-8 border-t-2 pt-4" style={{ borderColor: design.primaryColor }}>
                                    <div className="flex justify-end gap-8">
                                        <div className="text-right">
                                            <div className="text-xs text-gray-500">NET_TOTAL</div>
                                            <div className="text-xl font-bold" style={{ color: design.primaryColor }}>{data.currency}{total.toFixed(2)}</div>
                                        </div>
                                    </div>
                                    <div className="mt-8 text-xs text-gray-400 text-center">
                                        *** END OF TRANSMISSION ***
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* CREATIVE */}
                        {templateType === 'creative' && (
                            <div className="w-full h-full flex flex-col items-stretch bg-[#fff0f5]" style={{ backgroundColor: `${design.primaryColor}10` }}>
                                <div className="p-12 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-96 h-96 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -mr-20 -mt-20" style={{ backgroundColor: design.primaryColor }}></div>
                                    <div className="absolute top-0 left-0 w-72 h-72 rounded-full mix-blend-multiply filter blur-3xl opacity-20 -ml-20 -mt-20" style={{ backgroundColor: design.primaryColor }}></div>

                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className="flex gap-6 items-center">
                                            {data.logoUrl && <img src={data.logoUrl} alt="Logo" className="h-20 w-auto rounded-2xl shadow-lg mix-blend-multiply" />}
                                            <div>
                                                <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r mb-2" style={{ backgroundImage: `linear-gradient(to right, ${design.primaryColor}, ${design.primaryColor}88)` }}>
                                                    {data.companyName}
                                                </h1>
                                                <div className="font-medium" style={{ color: design.primaryColor }}>{data.companyAddress}</div>
                                            </div>
                                        </div>
                                        <div className="bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/50 shadow-sm">
                                            <div className="text-xs font-bold uppercase tracking-widest" style={{ color: design.primaryColor }}>Invoice No.</div>
                                            <div className="text-2xl font-black text-gray-800">{data.invoiceNumber}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="mx-12 bg-white rounded-3xl shadow-xl p-8 flex-1 flex flex-col relative z-20" style={{ boxShadow: `0 20px 25px -5px ${design.primaryColor}22, 0 8px 10px -6px ${design.primaryColor}22` }}>
                                    <div className="grid grid-cols-2 gap-12 mb-12">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: design.primaryColor, opacity: 0.7 }}>Billed To</div>
                                            <h2 className="text-2xl font-bold text-gray-800">{data.billToName}</h2>
                                            <p className="text-gray-500 mt-1">{data.billToAddress}</p>
                                        </div>
                                        <div className="flex gap-8">
                                            <div>
                                                <div className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: design.primaryColor, opacity: 0.7 }}>Date</div>
                                                <p className="font-bold text-gray-800">{data.date}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <table className="w-full">
                                            <thead>
                                                <tr className="border-b-2" style={{ borderColor: `${design.primaryColor}22` }}>
                                                    <th className="py-4 text-left font-bold" style={{ color: design.primaryColor }}>Item</th>
                                                    <th className="py-4 text-center font-bold" style={{ color: design.primaryColor }}>Qty</th>
                                                    <th className="py-4 text-right font-bold" style={{ color: design.primaryColor }}>Price</th>
                                                    <th className="py-4 text-right font-bold" style={{ color: design.primaryColor }}>Total</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {data.items.map((item) => (
                                                    <tr key={item.id} className="group">
                                                        <td className="py-4 text-gray-700 font-medium">{item.description}</td>
                                                        <td className="py-4 text-center text-gray-500 bg-gray-50 rounded-lg my-1">{item.qty}</td>
                                                        <td className="py-4 text-right font-bold" style={{ color: design.primaryColor, opacity: 0.8 }}>{data.currency}{item.price.toFixed(2)}</td>
                                                        <td className="py-4 text-right font-black text-gray-800">{data.currency}{(item.qty * item.price).toFixed(2)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    <div className="mt-12 flex justify-end">
                                        <div className="text-right">
                                            <div className="text-sm font-bold uppercase tracking-widest mb-1" style={{ color: design.primaryColor, opacity: 0.7 }}>Total Due</div>
                                            <div className="text-5xl font-black text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(to right, ${design.primaryColor}, ${design.primaryColor}88)` }}>
                                                {data.currency}{total.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="h-12"></div>
                            </div>
                        )}

                        {/* LEGAL */}
                        {templateType === 'legal' && (
                            <div className="w-full h-full flex flex-col items-stretch bg-white text-black text-[11pt] leading-relaxed">
                                <div className="text-center mb-8 border-b-2 pb-4" style={{ borderColor: design.primaryColor === '#000000' ? 'black' : design.primaryColor }}>
                                    <h1 className="text-2xl font-bold uppercase tracking-widest mb-1" style={{ color: design.primaryColor === '#000000' ? 'black' : design.primaryColor }}>{data.companyName}</h1>
                                    <div className="text-xs uppercase tracking-wide">{data.companyAddress}</div>
                                </div>

                                <div className="px-12 flex-1">
                                    <div className="flex justify-between mb-8">
                                        <div>
                                            <span className="font-bold uppercase text-xs block mb-1">In Account With:</span>
                                            <div className="uppercase">{data.billToName}</div>
                                            <div className="uppercase">{data.billToAddress}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="mb-1"><span className="font-bold uppercase text-xs">Statement Date:</span> {data.date}</div>
                                            <div><span className="font-bold uppercase text-xs">File Reference:</span> {data.invoiceNumber}</div>
                                        </div>
                                    </div>

                                    <div className="mb-4 font-bold text-center uppercase text-sm border-t border-b py-1" style={{ borderColor: design.primaryColor === '#000000' ? 'black' : design.primaryColor, color: design.primaryColor === '#000000' ? 'black' : design.primaryColor }}>
                                        Statement of Professional Services Rendered
                                    </div>

                                    <div className="mb-8">
                                        {data.items.map((item, i) => (
                                            <div key={item.id} className="mb-6">
                                                <div className="flex justify-between items-baseline mb-1">
                                                    <div className="font-bold text-sm uppercase">{i + 1}. {item.description}</div>
                                                    <div className="font-bold">{data.currency}{(item.qty * item.price).toFixed(2)}</div>
                                                </div>
                                                <div className="pl-4 text-sm text-gray-600 text-justify">
                                                    For professional services rendered in connection with the above matter. Including but not limited to consultation, review of documents, and drafting of correspondence.
                                                    <div className="mt-1 italic">
                                                        (Time: {item.qty} hrs @ {data.currency}{item.price.toFixed(2)}/hr)
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="px-12 pb-12">
                                    <div className="border-t-2 pt-4 flex justify-between items-center" style={{ borderColor: design.primaryColor === '#000000' ? 'black' : design.primaryColor }}>
                                        <div className="text-xs uppercase">
                                            <div>Payable upon receipt</div>
                                            <div>Checks payable to: {data.companyName}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-xs font-bold uppercase mb-1">Total Balance Due</div>
                                            <div className="text-2xl font-bold border-b border-double pb-1 inline-block" style={{ borderColor: design.primaryColor === '#000000' ? 'black' : design.primaryColor, color: design.primaryColor === '#000000' ? 'black' : design.primaryColor }}>
                                                {data.currency}{total.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
