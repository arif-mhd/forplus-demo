/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, FileText, AlertTriangle, ChevronDown, ChevronUp, Save, Edit2, X, ExternalLink, Search, Grid3x3, List, Loader2 } from 'lucide-react';
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
            const sorted = data.sort((a, b) => {
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
            <div className="bg-white rounded-2xl border border-zinc-300 p-6 mb-12 shadow-sm flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="flex-1 max-w-xl relative group w-full">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={20} />
                    <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => { setSearchQuery(e.target.value); setDisplayLimit(50); }}
                        placeholder="Search brands or manufacturers..."
                        className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl pl-12 pr-6 py-4 text-black placeholder-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-all font-medium text-sm"
                    />
                </div>
                <div className="flex items-center gap-6">
                    <div className="text-right hidden sm:block">
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none mb-1">Results</div>
                        <div className="text-xl font-black text-black tracking-tighter">{filteredCompanies.length} <span className="text-zinc-300 font-light">Companies</span></div>
                    </div>
                    <div className="h-10 w-px bg-zinc-200"></div>
                    <div className="flex items-center gap-2 bg-zinc-100/50 backdrop-blur-sm p-1.5 rounded-2xl border border-zinc-200/50">
                        <button onClick={() => setViewMode('grid')} className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${viewMode === 'grid' ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-zinc-400 hover:text-black hover:bg-black/5'}`}>
                            <Grid3x3 size={16} /> Grid
                        </button>
                        <button onClick={() => setViewMode('list')} className={`px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 font-black text-[10px] uppercase tracking-widest ${viewMode === 'list' ? 'bg-black text-white shadow-lg shadow-black/20' : 'text-zinc-400 hover:text-black hover:bg-black/5'}`}>
                            <List size={16} /> List
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-24 text-zinc-400 flex flex-col items-center gap-4">
                    <Loader2 className="animate-spin text-black" size={32} />
                    <span className="font-black text-[10px] uppercase tracking-widest">Initalizing Brand Database</span>
                </div>
            ) : (
                <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                    {displayedCompanies.map((co) => (
                        <BrandCard
                            key={co.company}
                            co={co}
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
                </div>
            )}

            {hasMore && (
                <div className="mt-16 text-center pb-12">
                    <button onClick={() => setDisplayLimit(prev => prev + 50)} className="px-12 py-5 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all">
                        Load More Companies
                    </button>
                </div>
            )}
        </div>
    );
}

function BrandCard({ co, viewMode, isExpanded, onToggle, editingCompany, editEmailValue, setEditEmailValue, onStartEdit, onCancelEdit, onSave, saving, brochures, loadingBrochures }) {
    return (
        <div className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm group/card ${isExpanded ? 'border-black ring-1 ring-black/5' : (co.company_email ? 'border-zinc-200 hover:border-black/30 hover:shadow-xl hover:shadow-black/5' : 'border-zinc-200 shadow-inner bg-zinc-50/30')}`}>
            <div className={`p-8 ${viewMode === 'list' ? 'flex items-center justify-between gap-8' : ''}`}>
                <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                        <h3 className={`font-black text-black uppercase tracking-tighter leading-tight ${viewMode === 'grid' ? 'text-xl' : 'text-2xl'}`}>{co.company}</h3>
                        {!co.company_email && <span className="bg-zinc-100 text-zinc-400 text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border border-zinc-200">Pending Identity</span>}
                    </div>

                    {editingCompany === co.company ? (
                        <div className="flex items-center gap-2 mt-4" onClick={e => e.stopPropagation()}>
                            <input type="email" value={editEmailValue} onChange={(e) => setEditEmailValue(e.target.value)} placeholder="Email..." className="bg-white border border-black rounded-lg px-4 py-2 text-sm text-black focus:outline-none w-64 font-medium h-10" autoFocus />
                            <button onClick={onSave} disabled={saving} className="w-10 h-10 bg-black text-white rounded-lg flex items-center justify-center shadow-lg"><Save size={16} /></button>
                            <button onClick={onCancelEdit} disabled={saving} className="w-10 h-10 hover:bg-zinc-100 rounded-lg text-zinc-400 flex items-center justify-center"><X size={16} /></button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2 text-zinc-400 py-1 group">
                            <Mail size={14} className="opacity-50" />
                            <span className={`text-sm font-medium ${!co.company_email ? "italic opacity-40 text-xs" : "text-zinc-500"}`}>{co.company_email || "Click to add corporate identity"}</span>
                            <button onClick={onStartEdit} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-black hover:text-white rounded-lg transition-all"><Edit2 size={12} /></button>
                        </div>
                    )}
                </div>

                <button onClick={onToggle} className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 ${viewMode === 'grid' ? 'mt-8 w-full justify-center' : ''} ${isExpanded ? 'bg-black text-white shadow-xl shadow-black/20' : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-500 hover:text-black border border-zinc-200/50'}`}>
                    <FileText size={16} /> {isExpanded ? 'Collapse Archives' : 'View Archives'}
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
            </div>

            <AnimatePresence>
                {isExpanded && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden border-t border-zinc-100 bg-zinc-50/50 p-8">
                        {loadingBrochures ? (
                            <div className="flex items-center gap-3 text-zinc-400 font-black text-[10px] uppercase tracking-widest"><Loader2 className="animate-spin" size={14} /> Fetching Archives...</div>
                        ) : brochures?.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {brochures.map((b, idx) => (
                                    <a key={idx} href={b.source_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 p-4 rounded-xl bg-white border border-zinc-200 hover:border-black/30 hover:shadow-2xl hover:shadow-black/5 transition-all group">
                                        <div className="p-3 bg-zinc-50 rounded-xl text-zinc-300 group-hover:text-black group-hover:bg-zinc-100 transition-colors"><FileText size={20} /></div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm font-black text-zinc-500 truncate group-hover:text-black mb-1">{decodeURIComponent(b.source_file || "Asset")}</div>
                                            <div className="text-[9px] text-zinc-300 font-black uppercase tracking-widest flex items-center gap-1">Source <ExternalLink size={10} /></div>
                                        </div>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <div className="text-zinc-400 text-xs font-medium italic">No indexed archives found for this entity.</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
