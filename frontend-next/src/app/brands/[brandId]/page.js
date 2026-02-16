"use client";
import { useState, useEffect, useRef, use } from 'react';
import { api } from '../../../lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Search, Grid3x3, List, Loader2, Package, Edit2, Save, X, Check, AlertTriangle, Filter, ChevronLeft, ChevronRight, Zap, Minimize2, Maximize2, Hash, Flag } from 'lucide-react';

export default function BrandProductsPage({ params }) {
    const { brandId } = use(params);
    const brandName = decodeURIComponent(brandId);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('grid');
    const [searchQuery, setSearchQuery] = useState('');
    const [stats, setStats] = useState({ total: 0 });
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const LIMIT = 24;

    const [editingProduct, setEditingProduct] = useState(null);

    useEffect(() => {
        loadProducts(true);
    }, [searchQuery]);

    const loadProducts = async (reset = false) => {
        if (reset) {
            setLoading(true);
            setProducts([]);
        }

        try {
            const currentSkip = reset ? 0 : page * LIMIT;
            const data = await api.searchProducts({
                company: brandName,
                query: searchQuery,
                skip: currentSkip,
                limit: LIMIT,
                includeFlagged: true
            });

            if (reset) {
                setProducts(data.products || []);
                setStats({ total: data.total || 0 });
                setPage(1);
            } else {
                setProducts(prev => [...prev, ...(data.products || [])]);
                setPage(prev => prev + 1);
            }
            setHasMore((data.products?.length || 0) === LIMIT);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const toggleFlag = async (product) => {
        if (!confirm(`Are you sure you want to ${product.is_product_flagged ? 'unflag' : 'flag'} this product? Flagged products will be hidden from the public catalog.`)) return;
        try {
            const updated = { ...product, is_product_flagged: !product.is_product_flagged };
            await api.updateProduct(updated);
            setProducts(prev => prev.map(p => p.id === product.id ? updated : p));
        } catch (err) {
            console.error(err);
            alert("Failed to update flag status");
        }
    };

    return (
        <div className="min-h-screen bg-zinc-50/50">
            {/* Subtle Premium Background Gradient */}
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-100 via-zinc-50 to-white -z-10" />

            {/* Header */}
            <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-zinc-200/50 supports-[backdrop-filter]:bg-white/60">
                <div className="max-w-[1920px] mx-auto px-6 lg:px-12 py-6">
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                        <div className="flex items-center gap-6 w-full md:w-auto">
                            <a href="/" className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-zinc-100 text-zinc-500 hover:bg-black hover:text-white transition-all duration-300">
                                <ArrowLeft size={16} />
                            </a>
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-black text-zinc-900 tracking-tight leading-none">
                                    {brandName}
                                </h1>
                                <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">
                                    Brand Catalog &bull; <span className="text-black">{stats.total}</span> Items
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 w-full md:w-auto">
                            <div className="relative group flex-1 md:w-96">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={16} />
                                <input
                                    type="text"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    placeholder="Search model, specs, keywords..."
                                    className="w-full bg-zinc-100/50 border border-zinc-200 rounded-full pl-11 pr-5 py-2.5 text-sm font-medium focus:outline-none focus:border-black focus:bg-white focus:ring-4 focus:ring-zinc-100 transition-all placeholder:text-zinc-400"
                                />
                            </div>

                            <div className="flex items-center gap-1 bg-zinc-100/50 p-1 rounded-full border border-zinc-200">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2.5 rounded-full transition-all duration-300 ${viewMode === 'grid' ? 'bg-white text-black shadow-lg shadow-zinc-200 ring-1 ring-black/5' : 'text-zinc-400 hover:text-black hover:bg-white/50'}`}
                                >
                                    <Grid3x3 size={16} />
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2.5 rounded-full transition-all duration-300 ${viewMode === 'list' ? 'bg-white text-black shadow-lg shadow-zinc-200 ring-1 ring-black/5' : 'text-zinc-400 hover:text-black hover:bg-white/50'}`}
                                >
                                    <List size={16} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-[1920px] mx-auto p-6 lg:p-12">
                {loading && products.length === 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => (
                            <div key={i} className="aspect-[4/5] bg-white rounded-3xl border border-zinc-100 shadow-sm animate-pulse" />
                        ))}
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <motion.div
                            layout
                            className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6' : 'max-w-5xl mx-auto flex flex-col gap-4'}
                        >
                            <AnimatePresence>
                                {products.map((product, idx) => (
                                    <ProductManageCard
                                        key={product.id || idx}
                                        product={product}
                                        viewMode={viewMode}
                                        onEdit={() => setEditingProduct(product)}
                                        onFlag={() => toggleFlag(product)}
                                    />
                                ))}
                            </AnimatePresence>
                        </motion.div>

                        {hasMore && (
                            <div className="mt-20 text-center pb-20">
                                <button
                                    onClick={() => loadProducts(false)}
                                    disabled={loading}
                                    className="px-10 py-4 bg-zinc-900 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-2xl shadow-zinc-900/20 disabled:opacity-50 disabled:scale-100 flex items-center gap-3 mx-auto"
                                >
                                    {loading ? <Loader2 className="animate-spin" size={16} /> : null}
                                    {loading ? 'Loading...' : 'Load More Products'}
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-40">
                        <div className="w-24 h-24 bg-white rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/40 flex items-center justify-center mb-8 rotate-3 transform transition-transform hover:rotate-6">
                            <Package size={40} className="text-zinc-300" strokeWidth={1} />
                        </div>
                        <h3 className="text-2xl font-black text-zinc-900 mb-2 tracking-tight">No products found</h3>
                        <p className="text-zinc-500 font-medium">Try checking your spelling or use different keywords.</p>
                        <button
                            onClick={() => setSearchQuery('')}
                            className="mt-8 px-6 py-2.5 bg-zinc-100 text-zinc-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-zinc-200 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* Edit Modal */}
            <AnimatePresence>
                {editingProduct && (
                    <EditProductModal
                        product={editingProduct}
                        onClose={() => setEditingProduct(null)}
                        onUpdate={(updated) => {
                            setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
                            setEditingProduct(null);
                        }}
                    />
                )}
            </AnimatePresence>

        </div>
    );
}

function ProductManageCard({ product, viewMode, onEdit, onFlag }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className={`
                group bg-white rounded-3xl overflow-hidden relative transition-all duration-300
                ${viewMode === 'list'
                    ? 'flex items-center gap-6 p-4 border border-zinc-100 hover:border-zinc-300 hover:shadow-xl hover:shadow-zinc-200/50'
                    : 'flex flex-col border border-zinc-100 hover:border-zinc-300 hover:shadow-2xl hover:shadow-zinc-200/40 hover:-translate-y-1'
                }
                ${product.is_product_flagged ? 'bg-red-50/30 border-red-100' : 'bg-white'}
            `}
        >
            {/* Image / Icon Area */}
            <div className={`
                relative overflow-hidden flex items-center justify-center bg-zinc-50
                ${viewMode === 'list' ? 'w-24 h-24 rounded-2xl shrink-0' : 'aspect-[4/3] w-full border-b border-zinc-50'}
            `}>
                <div className="absolute inset-0 bg-[radial-gradient(#e4e4e7_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />
                <Package size={viewMode === 'list' ? 24 : 48} className="text-zinc-200 relative z-10 transition-transform duration-500 group-hover:scale-110" strokeWidth={1} />

                <div className="absolute top-4 left-4 z-20">
                    <span className="text-[9px] font-mono font-bold text-zinc-400 bg-white/80 backdrop-blur-md px-2 py-1 rounded-lg border border-zinc-100 shadow-sm">
                        #{product.id?.slice(0, 6)}
                    </span>
                </div>
                {product.is_product_flagged && (
                    <div className="absolute top-4 right-4 z-20">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-red-600 bg-red-100/90 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-sm border border-red-200">
                            <Flag size={10} fill="currentColor" /> Hidden
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className={`flex-1 min-w-0 ${viewMode === 'list' ? 'py-1 pr-2' : 'p-6'}`}>
                <div className="mb-4">
                    <h3 className={`font-bold text-zinc-900 leading-tight mb-2 group-hover:text-black transition-colors ${viewMode === 'list' ? 'text-lg' : 'text-base line-clamp-2'}`}>
                        {product.name}
                    </h3>
                    <p className={`text-zinc-500 text-xs font-medium leading-relaxed ${viewMode === 'list' ? 'line-clamp-2 max-w-2xl' : 'line-clamp-3'}`}>
                        {product.description || "No description provided."}
                    </p>
                </div>

                <div className={`flex items-center gap-2 mt-auto ${viewMode === 'list' ? 'ml-auto' : ''}`}>
                    <button
                        onClick={(e) => { e.stopPropagation(); onFlag(); }}
                        className={`p-2.5 rounded-xl border transition-all duration-300
                            ${product.is_product_flagged
                                ? 'bg-red-50 text-red-600 border-red-200 hover:bg-red-100'
                                : 'bg-transparent text-zinc-400 border-transparent hover:bg-zinc-100 hover:text-red-500'}
                        `}
                        title={product.is_product_flagged ? "Unflag Product" : "Flag Product"}
                    >
                        <Flag size={16} fill={product.is_product_flagged ? "currentColor" : "none"} />
                    </button>

                    <button
                        onClick={(e) => { e.stopPropagation(); onEdit(); }}
                        className="flex items-center gap-2 px-5 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-black hover:scale-105 active:scale-95 transition-all shadow-lg shadow-zinc-900/10 border border-zinc-900"
                    >
                        <Edit2 size={12} /> <span className="hidden sm:inline">Edit</span>
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function EditProductModal({ product, onClose, onUpdate }) {
    const [formData, setFormData] = useState({ ...product });
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState(null);

    // Parse specs string to JSON for basic editing if needed, or keep as string/object
    // For MVP we'll allow editing Name and Description mostly, maybe specs as raw JSON text

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            const updated = await api.updateProduct(formData);
            onUpdate(updated);
        } catch (err) {
            setError("Failed to save changes. Please try again.");
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm" onClick={onClose}>
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                onClick={e => e.stopPropagation()}
                className="bg-white rounded-[2rem] w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl border border-zinc-100 overflow-hidden"
            >
                <div className="p-8 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
                    <div>
                        <h2 className="text-xl font-black text-zinc-900 tracking-tight">Edit Product</h2>
                        <div className="flex items-center gap-2 text-zinc-400 text-xs font-mono mt-1 font-bold">
                            <Hash size={12} /> {product.id}
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2.5 bg-white border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50 rounded-full text-zinc-400 hover:text-black transition-all shadow-sm">
                        <X size={18} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto custom-scrollbar space-y-8">
                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-bold flex items-center gap-2 border border-red-100">
                            <AlertTriangle size={16} /> {error}
                        </div>
                    )}

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Product Name</label>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-bold text-zinc-900 focus:outline-none focus:border-black focus:bg-white focus:ring-4 focus:ring-zinc-100 transition-all shadow-inner"
                        />
                    </div>

                    <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Description</label>
                        <textarea
                            name="description"
                            value={formData.description || ''}
                            onChange={handleChange}
                            rows={4}
                            className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl px-5 py-4 text-sm font-medium text-zinc-900 focus:outline-none focus:border-black focus:bg-white focus:ring-4 focus:ring-zinc-100 transition-all resize-none shadow-inner leading-relaxed"
                        />
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Specifications (JSON)</label>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                ⚠️ Advanced Edit
                            </span>
                        </div>
                        <textarea
                            name="specifications"
                            value={typeof formData.specifications === 'string' ? formData.specifications : JSON.stringify(formData.specifications, null, 2)}
                            onChange={(e) => {
                                try {
                                    const parsed = JSON.parse(e.target.value);
                                    setFormData(prev => ({ ...prev, specifications: parsed }));
                                } catch {
                                    // Handle invalid JSON
                                }
                            }}
                            className="w-full bg-zinc-900 text-zinc-300 border border-zinc-800 rounded-2xl px-5 py-4 text-xs font-mono focus:outline-none focus:border-white/20 transition-all resize-y min-h-[150px] shadow-inner"
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-zinc-100 bg-zinc-50/80 backdrop-blur flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        disabled={saving}
                        className="px-8 py-4 rounded-xl text-xs font-bold uppercase tracking-widest text-zinc-500 hover:text-black hover:bg-white border border-transparent hover:border-zinc-200 transition-all"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="px-8 py-4 bg-black text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-900/20 flex items-center gap-3 disabled:opacity-50 disabled:scale-100 border border-black"
                    >
                        {saving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                        Save Changes
                    </button>
                </div>
            </motion.div>
        </div>
    );
}

// Helper to safely parse/stringify specs for the textarea
// (Simplified in the callback above)
