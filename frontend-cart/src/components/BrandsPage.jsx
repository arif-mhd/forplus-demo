/* eslint-disable react/prop-types */
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Building2, Mail, FileText, AlertTriangle, ChevronDown, ChevronUp, Save, Edit2, X, ExternalLink, ArrowLeft } from 'lucide-react';
import { api } from '../lib/api';

export function BrandsPage({ onBack }) {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCompany, setExpandedCompany] = useState(null);
    const [brochures, setBrochures] = useState({}); // Cache brochures: { companyName: [brochureList] }
    const [loadingBrochures, setLoadingBrochures] = useState({});

    // Editing State
    const [editingCompany, setEditingCompany] = useState(null);
    const [editEmailValue, setEditEmailValue] = useState("");
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadCompanies();
    }, []);

    const loadCompanies = async () => {
        setLoading(true);
        try {
            const data = await api.getCompanies();
            // Sort: Companies with missing emails first
            const sorted = data.sort((a, b) => {
                if (!a.company_email && b.company_email) return -1;
                if (a.company_email && !b.company_email) return 1;
                return (a.company || "").localeCompare(b.company || "");
            });
            setCompanies(sorted);
        } catch (err) {
            console.error(err);
            alert("Failed to load companies");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = async (company) => {
        if (expandedCompany === company) {
            setExpandedCompany(null);
            return;
        }

        setExpandedCompany(company);

        // Load brochures if not cached
        if (!brochures[company]) {
            setLoadingBrochures(prev => ({ ...prev, [company]: true }));
            try {
                const data = await api.getCompanyBrochures(company);
                setBrochures(prev => ({ ...prev, [company]: data }));
            } catch (err) {
                console.error(err);
            } finally {
                setLoadingBrochures(prev => ({ ...prev, [company]: false }));
            }
        }
    };

    const startEditing = (co) => {
        setEditingCompany(co.company);
        setEditEmailValue(co.company_email || "");
    };

    const cancelEditing = () => {
        setEditingCompany(null);
        setEditEmailValue("");
    };

    const saveEmail = async () => {
        if (!editingCompany) return;
        setSaving(true);
        try {
            await api.updateCompanyEmail(editingCompany, editEmailValue);

            // Update local state
            setCompanies(prev => prev.map(c =>
                c.company === editingCompany ? { ...c, company_email: editEmailValue } : c
            ));

            setEditingCompany(null);
        } catch (err) {
            console.error(err);
            alert("Failed to update email");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white p-8">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onBack} className="p-2 hover:bg-white/5 rounded-full text-slate-400 hover:text-white transition-colors border border-white/5 hover:border-white/20">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-3xl font-bold flex items-center gap-3">
                            <Building2 className="text-emerald-500" /> Brands & Brochures
                        </h1>
                        <p className="text-slate-400">Manage company contact details and view indexed brochures.</p>
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-20 text-slate-500 animate-pulse">Loading brands...</div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {companies.map((co) => (
                            <div key={co.company} className={`bg-slate-800/50 rounded-xl border transition-all ${!co.company_email ? 'border-amber-500/30' : 'border-white/5'}`}>
                                <div className="p-6 flex items-start justify-between gap-6">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-xl font-bold text-white">{co.company}</h3>
                                            {!co.company_email && (
                                                <span className="bg-amber-500/10 text-amber-500 text-xs px-2 py-0.5 rounded border border-amber-500/20 flex items-center gap-1">
                                                    <AlertTriangle size={12} /> Missing Email
                                                </span>
                                            )}
                                        </div>

                                        {/* Email Section */}
                                        {editingCompany === co.company ? (
                                            <div className="flex items-center gap-2 mt-2">
                                                <input
                                                    type="email"
                                                    value={editEmailValue}
                                                    onChange={(e) => setEditEmailValue(e.target.value)}
                                                    placeholder="Enter company email..."
                                                    className="bg-slate-900 border border-blue-500/50 rounded px-3 py-1.5 text-sm text-white focus:outline-none focus:ring-1 focus:ring-blue-500 w-64"
                                                    autoFocus
                                                />
                                                <button onClick={saveEmail} disabled={saving} className="p-1.5 bg-blue-600 hover:bg-blue-500 rounded text-white transition-colors">
                                                    <Save size={16} />
                                                </button>
                                                <button onClick={cancelEditing} disabled={saving} className="p-1.5 hover:bg-white/10 rounded text-slate-400 transition-colors">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-slate-400 text-sm group">
                                                <Mail size={16} />
                                                <span className={!co.company_email ? "italic text-slate-500" : ""}>
                                                    {co.company_email || "No email address set"}
                                                </span>
                                                <button
                                                    onClick={() => startEditing(co)}
                                                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-white/10 rounded text-slate-400 hover:text-white transition-all"
                                                >
                                                    <Edit2 size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>

                                    <button
                                        onClick={() => toggleExpand(co.company)}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/5 flex items-center gap-2 ${expandedCompany === co.company ? 'bg-white/10 text-white' : 'hover:bg-white/5 text-slate-400'}`}
                                    >
                                        <FileText size={16} />
                                        {expandedCompany === co.company ? 'Hide Brochures' : 'View Brochures'}
                                        {expandedCompany === co.company ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                    </button>
                                </div>

                                {/* Expanded Brochures List */}
                                <AnimatePresence>
                                    {expandedCompany === co.company && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: 'auto', opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            className="overflow-hidden border-t border-white/5 bg-black/20"
                                        >
                                            <div className="p-6">
                                                {loadingBrochures[co.company] ? (
                                                    <div className="text-slate-500 text-sm italic">Loading brochures...</div>
                                                ) : (
                                                    brochures[co.company]?.length > 0 ? (
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {brochures[co.company].map((b, idx) => (
                                                                <a
                                                                    key={idx}
                                                                    href={b.source_url}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="flex items-center gap-3 p-3 rounded-lg bg-slate-800 border border-white/5 hover:border-blue-500/30 hover:bg-blue-500/5 transition-all group"
                                                                >
                                                                    <div className="p-2 bg-slate-700/50 rounded text-red-400 group-hover:text-red-300">
                                                                        <FileText size={20} />
                                                                    </div>
                                                                    <div className="flex-1 min-w-0">
                                                                        <div className="text-sm font-medium text-slate-300 truncate group-hover:text-blue-200">
                                                                            {decodeURIComponent(b.source_file || "Brochure")}
                                                                        </div>
                                                                        <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                                                                            View PDF <ExternalLink size={10} />
                                                                        </div>
                                                                    </div>
                                                                </a>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="text-slate-500 text-sm">No brochures found for this brand.</div>
                                                    )
                                                )}
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
