"use client";
/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, FileText, AlertTriangle, ChevronDown, ChevronUp, Save, Edit2, X, ExternalLink, Search, Grid3x3, List, Loader2, Check, LayoutGrid, ShieldCheck, ShieldAlert } from 'lucide-react';
import { api } from '../lib/api';

export function BrandsPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCompany, setExpandedCompany] = useState(null);
    const [brochures, setBrochures] = useState({});
    const [loadingBrochures, setLoadingBrochures] = useState({});
    const [editingCompany, setEditingCompany] = useState(null);
    const [editEmailValue, setEditEmailValue] = useState("");
    const [saving, setSaving] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState('grid');
    const [displayLimit, setDisplayLimit] = useState(50);

    useEffect(() => { loadCompanies(); }, []);

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const data = await api.getCompanies();

            // Deduplicate companies based on name
            const uniqueCompanies = Object.values(data.reduce((acc, curr) => {
                const name = (curr.company || "").trim();
                // If we already have this company, prefer the one with an email
                if (!acc[name] || (!acc[name].company_email && curr.company_email)) {
                    acc[name] = curr;
                }
                return acc;
            }, {}));

            const sorted = uniqueCompanies.sort((a, b) => {
                if (!a.company_email && b.company_email) return -1;
                if (a.company_email && !b.company_email) return 1;
                return (a.company || "").localeCompare(b.company || "");
            });
            setCompanies(sorted);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const toggleExpand = async (company) => {
        if (expandedCompany === company) { setExpandedCompany(null); return; }
        setExpandedCompany(company);
        if (!brochures[company]) {
            setLoadingBrochures(prev => ({ ...prev, [company]: true }));
            try {
                const data = await api.getCompanyBrochures(company);
                setBrochures(prev => ({ ...prev, [company]: data }));
            } catch (err) { console.error(err); } finally { setLoadingBrochures(prev => ({ ...prev, [company]: false })); }
        }
    };

    const saveEmail = async () => {
        if (!editingCompany) return;
        setSaving(true);
        try {
            await api.updateCompanyEmail(editingCompany, editEmailValue);
            setCompanies(prev => prev.map(c => c.company === editingCompany ? { ...c, company_email: editEmailValue } : c));
            setEditingCompany(null);
        } catch (err) { alert("Failed to update email"); } finally { setSaving(false); }
    };

    const filteredCompanies = companies.filter(co => (co.company || "").toLowerCase().includes(searchQuery.toLowerCase()));
    const displayedCompanies = filteredCompanies.slice(0, displayLimit);
    const hasMore = displayedCompanies.length < filteredCompanies.length;

    return (
        <div className="w-full">
            {/* Header / Search Section */}
            <div className="sticky top-24 z-20 mb-10">
                <div className="bg-white/90 backdrop-blur-xl border border-zinc-200/80 p-5 rounded-2xl shadow-xl shadow-zinc-200/40 flex flex-col md:flex-row gap-6 items-center justify-between transition-all">

                    {/* Search Input */}
                    <div className="flex-1 max-w-2xl relative group w-full">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={20} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => { setSearchQuery(e.target.value); setDisplayLimit(50); }}
                            placeholder="Search verified brands & manufacturers..."
                            className="w-full bg-zinc-50 border border-zinc-100/80 rounded-xl pl-14 pr-6 py-4 text-black placeholder-zinc-400 focus:outline-none focus:border-black focus:ring-1 focus:ring-black/5 focus:bg-white transition-all font-medium text-sm shadow-inner"
                        />
                    </div>

                    {/* Controls */}
                    <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">Database</div>
                            <div className="text-xl font-bold text-black tracking-tight flex items-baseline justify-end gap-1">
                                {filteredCompanies.length.toLocaleString()}
                                <span className="text-zinc-400 font-medium text-xs">Entities</span>
                            </div>
                        </div>

                        <div className="h-8 w-px bg-zinc-200 hidden sm:block"></div>

                        <div className="flex items-center gap-1 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                            <button
                                onClick={() => setViewMode('grid')}
                                className={`p-2.5 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                <LayoutGrid size={18} />
                            </button>
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-2.5 rounded-lg transition-all flex items-center gap-2 ${viewMode === 'list' ? 'bg-white text-black shadow-sm ring-1 ring-black/5' : 'text-zinc-400 hover:text-zinc-600'}`}
                            >
                                <List size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-32 text-zinc-400 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-black" size={32} />
                    <span className="font-bold text-xs uppercase tracking-widest text-zinc-300">Synchronizing Database...</span>
                </div>
            ) : (
                <motion.div
                    layout
                    className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6' : 'space-y-3'}
                >
                    <AnimatePresence>
                        {displayedCompanies.map((co, idx) => (
                            <BrandCard
                                key={co.company}
                                co={co}
                                idx={idx}
                                viewMode={viewMode}
                                isExpanded={expandedCompany === co.company}
                                onToggle={() => toggleExpand(co.company)}
                                editingCompany={editingCompany}
                                editEmailValue={editEmailValue}
                                setEditEmailValue={setEditEmailValue}
                                onStartEdit={() => { setEditingCompany(co.company); setEditEmailValue(co.company_email || ""); }}
                                onCancelEdit={() => setEditingCompany(null)}
                                onSave={saveEmail}
                                saving={saving}
                                brochures={brochures[co.company]}
                                loadingBrochures={loadingBrochures[co.company]}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>
            )}

            {hasMore && (
                <div className="mt-20 text-center pb-20">
                    <button
                        onClick={() => setDisplayLimit(prev => prev + 50)}
                        className="px-8 py-4 bg-white border border-zinc-200 text-zinc-900 rounded-full font-bold text-xs uppercase tracking-widest shadow-lg shadow-zinc-200/50 hover:scale-105 active:scale-95 transition-all hover:border-black"
                    >
                        Load More Brands
                    </button>
                </div>
            )}
        </div>
    );
}

function BrandCard({ co, idx, viewMode, isExpanded, onToggle, editingCompany, editEmailValue, setEditEmailValue, onStartEdit, onCancelEdit, onSave, saving, brochures, loadingBrochures }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (idx % 20) * 0.03, duration: 0.4 }}
            className={`
                group bg-white rounded-2xl border transition-all duration-300 flex flex-col overflow-hidden relative
                ${isExpanded
                    ? 'border-zinc-900 shadow-2xl shadow-zinc-900/10 z-10 scale-[1.02]'
                    : 'border-zinc-100 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/40'
                }
                ${viewMode === 'list' ? 'flex-row items-center p-4' : 'p-6'}
            `}
        >
            {/* Top Bar / Content */}
            <div className={`flex-1 ${viewMode === 'list' ? 'flex items-center gap-8' : ''}`}>
                <div className="flex-1">
                    <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className={`
                                w-10 h-10 rounded-xl flex items-center justify-center text-lg font-black uppercase
                                ${co.company_email
                                    ? 'bg-zinc-900 text-white shadow-lg shadow-zinc-900/20'
                                    : 'bg-zinc-100 text-zinc-400'
                                }
                            `}>
                                {co.company.charAt(0)}
                            </div>
                            <div>
                                <h3 className="font-bold text-zinc-900 leading-tight line-clamp-1">{co.company}</h3>
                                <div className="flex items-center gap-2 mt-0.5">
                                    {!co.company_email ? (
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-amber-600/80 bg-amber-50 px-2 py-0.5 rounded-full">
                                            <ShieldAlert size={10} /> Pending Verification
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-wider text-emerald-600/80 bg-emerald-50 px-2 py-0.5 rounded-full">
                                            <ShieldCheck size={10} /> Verified Partner
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {editingCompany === co.company ? (
                        <div className="flex items-center gap-2 mt-2" onClick={e => e.stopPropagation()}>
                            <input
                                type="email"
                                value={editEmailValue}
                                onChange={(e) => setEditEmailValue(e.target.value)}
                                placeholder="Enter email address..."
                                className="bg-zinc-50 border border-zinc-200 rounded-lg px-3 py-2 text-sm text-black focus:outline-none focus:border-black w-full"
                                autoFocus
                            />
                            <button onClick={onSave} disabled={saving} className="p-2 bg-black text-white rounded-lg hover:opacity-80"><Save size={14} /></button>
                            <button onClick={onCancelEdit} disabled={saving} className="p-2 bg-zinc-100 text-zinc-500 rounded-lg hover:bg-zinc-200"><X size={14} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-zinc-500 group/mail py-1 cursor-pointer" onClick={onStartEdit}>
                            <Mail size={14} className="text-zinc-300 group-hover/mail:text-zinc-900 transition-colors" />
                            <span className={`text-xs font-medium truncate max-w-[200px] ${!co.company_email ? "text-zinc-300 italic" : "text-zinc-600"}`}>
                                {co.company_email || "No valid email record"}
                            </span>
                            <Edit2 size={10} className="opacity-0 group-hover/mail:opacity-100 text-zinc-400 transition-opacity" />
                        </div>
                    )}
                </div>

                <button
                    onClick={onToggle}
                    className={`
                        mt-6 w-full py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2
                        ${isExpanded
                            ? 'bg-zinc-900 text-white shadow-lg'
                            : 'bg-zinc-50 text-zinc-500 hover:bg-zinc-100 hover:text-black'
                        }
                        ${viewMode === 'list' ? 'mt-0 w-auto px-6' : ''}
                    `}
                >
                    {isExpanded ? 'Close Archives' : 'View Archives'}
                    {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                </button>
            </div>

            {/* Expanded Content */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden bg-zinc-50/50 border-t border-zinc-100"
                    >
                        <div className="p-6">
                            {loadingBrochures ? (
                                <div className="flex items-center justify-center py-8 gap-3 text-zinc-400 font-bold text-[10px] uppercase tracking-widest">
                                    <Loader2 className="animate-spin" size={16} /> Retrieving Assets...
                                </div>
                            ) : brochures?.length > 0 ? (
                                <div className="grid grid-cols-1 gap-3">
                                    {brochures.map((b, idx) => (
                                        <a
                                            key={idx}
                                            href={b.source_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-4 p-3 rounded-xl bg-white border border-zinc-200/50 hover:border-black/20 hover:shadow-lg hover:shadow-zinc-200/30 transition-all group/file"
                                        >
                                            <div className="p-2.5 bg-zinc-50 rounded-lg text-zinc-400 group-hover/file:text-red-500 group-hover/file:bg-red-50 transition-colors">
                                                <FileText size={18} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs font-bold text-zinc-700 truncate group-hover/file:text-black transition-colors">
                                                    {decodeURIComponent(b.source_file || "Document Asset")}
                                                </div>
                                                <div className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider flex items-center gap-1 mt-0.5">
                                                    PDF Document <ExternalLink size={8} />
                                                </div>
                                            </div>
                                        </a>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-zinc-400 text-xs font-medium">
                                    <div className="inline-block p-3 bg-zinc-100 rounded-full mb-2">
                                        <AlertTriangle size={16} />
                                    </div>
                                    <p>No archived documents found.</p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
