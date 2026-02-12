"use client";
import { useState, useEffect, useMemo } from 'react';
import { api } from '../lib/api';
import { Search, Package, Zap, ArrowRight, X, Info, Filter, ChevronRight, Hash, Layers, Maximize2, Minimize2, ShoppingCart, Check, Plus, Minus, SlidersHorizontal, ChevronDown, CheckSquare, Square } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export function ProductSearch({ companies, sessionId, cart = [], refreshCart }) {
    const [query, setQuery] = useState('');
    const [selectedCompanies, setSelectedCompanies] = useState([]);
    const [brandSearchQuery, setBrandSearchQuery] = useState('');
    const [quickFilters, setQuickFilters] = useState([]);
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Derived state for filtered companies list
    const filteredCompanyList = useMemo(() => {
        return companies.filter(c =>
            (c.company || c).toLowerCase().includes(brandSearchQuery.toLowerCase())
        );
    }, [companies, brandSearchQuery]);

    const LIMIT = 24;

    const QUICK_FILTER_OPTIONS = [
        "IP65", "Waterproof", "Indoor", "Outdoor", "High Power", "Dimmable", "Grow Light", "Aluminum"
    ];

    const getCartItem = (productId) => cart.find(item => item.product?.id === productId);

    useEffect(() => {
        fetchProducts(true);
    }, []);

    // Debounce search and filter updates
    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [query, selectedCompanies, quickFilters]);

    const fetchProducts = async (reset = false) => {
        setLoading(true);
        try {
            const newSkip = reset ? 0 : skip;
            // append quick filters to query for search scope
            const finalQuery = [query, ...quickFilters].filter(Boolean).join(' ');

            const data = await api.searchProducts({
                query: finalQuery,
                company: selectedCompanies,
                skip: newSkip,
                limit: LIMIT
            });

            if (reset) {
                setProducts(data.products || []);
                setTotal(data.total || 0);
                setSkip(LIMIT);
                setHasMore(!(data.products && data.products.length < LIMIT));
            } else {
                setProducts(prev => [...prev, ...(data.products || [])]);
                setSkip(prev => prev + LIMIT);
                setHasMore(!(data.products && data.products.length < LIMIT));
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => fetchProducts(false);

    const toggleCompany = (company) => {
        setSelectedCompanies(prev =>
            prev.includes(company)
                ? prev.filter(c => c !== company)
                : [...prev, company]
        );
    };

    const toggleQuickFilter = (filter) => {
        setQuickFilters(prev =>
            prev.includes(filter)
                ? prev.filter(f => f !== filter)
                : [...prev, filter]
        );
    };

    const clearFilters = () => {
        setSelectedCompanies([]);
        setQuickFilters([]);
        setQuery('');
    };

    return (
        <div className="w-full">
            {/* Stats Dashboard - Glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <StatCard label="Total Products" value={total} icon={Package} bg="bg-blue-50" color="text-blue-600" />
                <StatCard label="Brands Indexed" value={companies.length} icon={Layers} bg="bg-violet-50" color="text-violet-600" />
                <StatCard label="Active Queries" value="Live" icon={Zap} bg="bg-emerald-50" color="text-emerald-600" isLive />
            </div>

            <div className="flex flex-col lg:flex-row gap-8 relative items-start">

                {/* Mobile Filter Toggle */}
                <button
                    onClick={() => setShowMobileFilters(!showMobileFilters)}
                    className="lg:hidden w-full flex items-center justify-between px-6 py-4 bg-white border border-zinc-200 rounded-xl font-bold shadow-sm"
                >
                    <span className="flex items-center gap-2"><SlidersHorizontal size={18} /> Filters</span>
                    <ChevronDown size={18} className={`transition-transform ${showMobileFilters ? 'rotate-180' : ''}`} />
                </button>

                {/* Sidebar Filters */}
                <div className={`w-full lg:w-72 flex-shrink-0 space-y-8 ${showMobileFilters ? 'block' : 'hidden lg:block'}`}>

                    {/* Search Input */}
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Keywords</h3>
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Model, specs..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-xl py-3 pl-12 pr-4 text-sm font-medium focus:outline-none focus:border-black focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Quick Filters */}
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">Quick Filters</h3>
                        <div className="flex flex-wrap gap-2">
                            {QUICK_FILTER_OPTIONS.map(filter => (
                                <button
                                    key={filter}
                                    onClick={() => toggleQuickFilter(filter)}
                                    className={`px-3 py-1.5 rounded-lg text-[10px] uppercase font-bold tracking-wider border transition-all
                                        ${quickFilters.includes(filter)
                                            ? 'bg-black text-white border-black'
                                            : 'bg-zinc-50 text-zinc-500 border-zinc-100 hover:border-zinc-300 hover:text-black'}
                                    `}
                                >
                                    {filter}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Brand Filter */}
                    <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col max-h-[600px]">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Brands</h3>
                            {selectedCompanies.length > 0 && (
                                <button onClick={() => setSelectedCompanies([])} className="text-[10px] font-bold text-red-500 hover:underline">Clear</button>
                            )}
                        </div>

                        <div className="mb-4 relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                            <input
                                type="text"
                                value={brandSearchQuery}
                                onChange={(e) => setBrandSearchQuery(e.target.value)}
                                placeholder="Find a brand..."
                                className="w-full bg-zinc-50 border border-zinc-100 rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:border-black transition-all"
                            />
                        </div>

                        <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-1">
                            {filteredCompanyList.map((c, idx) => {
                                const companyName = c.company || c;
                                const isSelected = selectedCompanies.includes(companyName);
                                return (
                                    <button
                                        key={idx}
                                        onClick={() => toggleCompany(companyName)}
                                        className={`w-full flex items-center gap-3 p-2 rounded-lg text-left transition-all hover:bg-zinc-50 group
                                            ${isSelected ? 'bg-zinc-50' : ''}
                                        `}
                                    >
                                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors
                                            ${isSelected ? 'bg-black border-black text-white' : 'border-zinc-300 bg-white group-hover:border-zinc-400'}
                                        `}>
                                            {isSelected && <Check size={10} strokeWidth={4} />}
                                        </div>
                                        <span className={`text-sm truncate ${isSelected ? 'font-bold text-black' : 'font-medium text-zinc-600'}`}>
                                            {companyName}
                                        </span>
                                    </button>
                                );
                            })}
                            {filteredCompanyList.length === 0 && (
                                <div className="text-center py-8 text-zinc-400 text-xs font-medium italic">No brands found</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0">

                    {/* Active Filters Bar */}
                    {(selectedCompanies.length > 0 || quickFilters.length > 0 || query) && (
                        <div className="mb-6 flex flex-wrap items-center gap-2">
                            <span className="text-xs font-bold text-zinc-400 mr-2">Active filters:</span>
                            {query && (
                                <span className="bg-zinc-900 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-2">
                                    "{query}" <button onClick={() => setQuery('')}><X size={12} /></button>
                                </span>
                            )}
                            {selectedCompanies.map(c => (
                                <span key={c} className="bg-white border border-zinc-200 text-zinc-700 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2 shadow-sm">
                                    {c} <button onClick={() => toggleCompany(c)} className="hover:text-red-500"><X size={12} /></button>
                                </span>
                            ))}
                            {quickFilters.map(f => (
                                <span key={f} className="bg-zinc-100 text-zinc-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-2">
                                    {f} <button onClick={() => toggleQuickFilter(f)} className="hover:text-red-500"><X size={12} /></button>
                                </span>
                            ))}
                            <button onClick={clearFilters} className="text-xs font-bold text-red-500 hover:text-red-600 ml-auto uppercase tracking-wide">
                                Clear All
                            </button>
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                        <AnimatePresence mode="popLayout">
                            {products.map((product, index) => (
                                <ProductCard
                                    key={product.id}
                                    product={product}
                                    index={index}
                                    onClick={() => setSelectedProduct(product)}
                                    cartItem={getCartItem(product.id)}
                                    onUpdateQty={async (newQty) => {
                                        try {
                                            const item = getCartItem(product.id);
                                            if (newQty === 1 && !item) {
                                                await api.addToCart({ sessionId, productId: product.id, quantity: 1, product });
                                            } else if (item) {
                                                if (newQty <= 0) await api.removeFromCart(sessionId, item.id);
                                                else await api.updateCartItem({ id: item.id, sessionId, quantity: newQty });
                                            }
                                            refreshCart();
                                        } catch (e) { console.error(e); }
                                    }}
                                />
                            ))}
                        </AnimatePresence>
                    </div>

                    {/* Loading / Empty States */}
                    {loading && products.length === 0 && (
                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <div key={i} className="h-96 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200" />
                            ))}
                        </div>
                    )}

                    {!loading && products.length === 0 && (
                        <div className="flex flex-col items-center justify-center py-32 text-center bg-white rounded-3xl border border-dashed border-zinc-200">
                            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 border border-zinc-100 shadow-inner">
                                <Package size={40} className="text-zinc-300" />
                            </div>
                            <h3 className="text-xl font-bold text-zinc-900 mb-2 tracking-tight">No matches found</h3>
                            <p className="text-zinc-500 font-medium mb-6">Try adjusting your filters or keywords.</p>
                            <button onClick={clearFilters} className="px-6 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold">Clear Filters</button>
                        </div>
                    )}

                    {hasMore && products.length > 0 && (
                        <div className="flex justify-center mt-12 mb-10">
                            <button
                                onClick={handleLoadMore}
                                disabled={loading}
                                className="px-8 py-3 bg-white border border-zinc-200 text-zinc-900 rounded-full font-bold text-sm tracking-wide shadow-sm hover:border-black active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50"
                            >
                                {loading ? <><div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> Loading...</> : <>Show More Results <ArrowRight size={16} /></>}
                            </button>
                        </div>
                    )}
                </div>

            </div>

            <AnimatePresence>
                {selectedProduct && (
                    <ProductModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        onSwitch={setSelectedProduct}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, bg, color, isLive }) {
    return (
        <div className="bg-white rounded-2xl border border-zinc-200 p-6 flex items-center gap-5 shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform relative z-10`}>
                <Icon size={20} />
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
                <div className="flex items-center gap-3">
                    <span className="text-2xl font-bold text-black tracking-tight">{value}</span>
                    {isLive && <span className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />}
                </div>
            </div>
        </div>
    );
}

function ProductCard({ product, index, onClick, cartItem, onUpdateQty }) {
    const qty = cartItem?.quantity || 0;
    const isInCart = qty > 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: (index % 12) * 0.05 }}
            onClick={onClick}
            className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-zinc-200/50 flex flex-col cursor-pointer
                ${isInCart ? 'border-emerald-500/50 ring-1 ring-emerald-500/20' : 'border-zinc-200 hover:border-zinc-300'}
            `}
        >
            <div className="aspect-[4/3] bg-zinc-50 relative overflow-hidden flex items-center justify-center p-6 border-b border-zinc-50">
                {/* Fallback image or icon since no actual image url in data */}
                <Package size={48} className="text-zinc-200 group-hover:scale-110 transition-transform duration-500" strokeWidth={1} />

                <div className="absolute top-4 left-4">
                    <span className="text-[9px] font-black uppercase tracking-wider text-zinc-500 bg-white/90 backdrop-blur-sm px-2 py-1 rounded border border-zinc-100">
                        {product.company}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <h3 className="text-base font-bold text-zinc-900 mb-2 leading-tight line-clamp-2 group-hover:text-black transition-colors">
                    {product.name}
                </h3>

                <p className="text-zinc-500 text-xs font-medium line-clamp-2 leading-relaxed mb-4">
                    {product.description || "Specifications available"}
                </p>

                <div className="mt-auto flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-zinc-400 bg-zinc-50 px-1.5 py-0.5 rounded">
                        #{product.id?.slice(0, 6).toUpperCase()}
                    </span>

                    <div onClick={(e) => e.stopPropagation()}>
                        {isInCart ? (
                            <div className="flex items-center bg-emerald-50 rounded-lg p-0.5 border border-emerald-100">
                                <button
                                    onClick={() => onUpdateQty(qty - 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-100 transition-all"
                                >
                                    <Minus size={12} />
                                </button>
                                <span className="w-6 text-center text-xs font-bold text-emerald-900">{qty}</span>
                                <button
                                    onClick={() => onUpdateQty(qty + 1)}
                                    className="w-6 h-6 flex items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-100 transition-all"
                                >
                                    <Plus size={12} />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={(e) => { e.stopPropagation(); onUpdateQty(1); }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all bg-zinc-900 text-white hover:bg-black hover:scale-105 shadow-md shadow-zinc-900/10"
                            >
                                <Plus size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ProductModal({ product, onClose, onSwitch }) {
    const [showPdf, setShowPdf] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    // Brochure Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

    // Reset search when product changes
    useEffect(() => {
        setSearchQuery('');
        setSearchResults([]);
    }, [product.id]);

    const handleSearch = async (query) => {
        setSearchQuery(query);
        if (!query.trim()) {
            setSearchResults([]);
            return;
        }

        setIsSearching(true);
        try {
            // Search specifically within this source file
            const data = await api.searchProducts({
                query: query,
                source_file: product.source_file,
                limit: 10
            });
            setSearchResults(data.products || []);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    };

    const renderSpecs = (specs, depth = 0) => {
        if (!specs) return null;
        let parsed = specs;
        if (typeof specs === 'string') {
            try { parsed = JSON.parse(specs); } catch { return <span className="text-zinc-500 font-medium">{specs}</span>; }
        }
        if (typeof parsed !== 'object' || parsed === null) return <span className="text-zinc-500 font-medium">{String(parsed)}</span>;
        if (Array.isArray(parsed)) return <span className="text-zinc-500 font-medium">{parsed.join(', ')}</span>;

        return (
            <div className={`space-y-4 ${depth > 0 ? 'ml-6 mt-4 pl-4 border-l-2 border-zinc-100' : ''}`}>
                {Object.entries(parsed).map(([key, value]) => {
                    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                        return (
                            <div key={key}>
                                <div className="text-[10px] font-bold text-zinc-900 uppercase tracking-widest mb-2 pb-1 border-b border-zinc-100">{key}</div>
                                {renderSpecs(value, depth + 1)}
                            </div>
                        );
                    }
                    return (
                        <div key={key} className="flex flex-col border-b border-zinc-50 pb-2">
                            <span className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest mb-1">{key.replace(/_/g, ' ')}</span>
                            <span className="text-sm text-zinc-900 font-semibold break-words">{String(value)}</span>
                        </div>
                    );
                })}
            </div>
        );
    };

    return createPortal(
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10 bg-black/40 backdrop-blur-md"
            onClick={onClose}
        >
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    width: isExpanded ? '100%' : (showPdf ? '95%' : '100%'),
                    maxWidth: isExpanded ? '100%' : (showPdf ? '95rem' : '52rem'),
                    height: isExpanded ? '100%' : 'auto',
                    maxHeight: isExpanded ? '100%' : '90vh'
                }}
                className="bg-white rounded-3xl overflow-hidden shadow-2xl relative flex flex-col md:flex-row border border-zinc-200"
                onClick={e => e.stopPropagation()}
            >
                {/* Details Section */}
                <div className={`p-8 md:p-12 overflow-y-auto flex-1 custom-scrollbar ${showPdf && !isExpanded ? 'hidden lg:block' : ''}`}>
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <span className="text-[10px] font-bold text-white bg-zinc-900 px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">
                                {product.company}
                            </span>
                            <h2 className="text-3xl font-bold text-zinc-900 uppercase tracking-tight leading-tight mb-2">
                                {product.name}
                            </h2>
                            <div className="flex items-center gap-3 text-zinc-400 font-mono text-xs">
                                <Hash size={14} />
                                <span>{product.id}</span>
                            </div>
                        </div>
                        <button onClick={onClose} className="p-2 bg-zinc-50 hover:bg-black hover:text-white rounded-full transition-all border border-zinc-100">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="space-y-12">
                        <section>
                            <div className="flex items-center gap-3 mb-4 text-zinc-900 uppercase font-bold text-sm tracking-tight">
                                <Info size={20} />
                                Overview
                            </div>
                            <p className="text-zinc-500 text-lg leading-relaxed font-medium bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-inner">
                                {product.description || "Detailed technical description currently being optimized for catalog presentation."}
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-6 text-zinc-900 uppercase font-bold text-sm tracking-tight">
                                <Zap size={20} />
                                Specifications
                            </div>
                            <div className="bg-white border border-zinc-100 rounded-2xl p-8 shadow-sm">
                                {renderSpecs(product.specifications)}
                            </div>
                        </section>

                        <div className="flex items-center justify-between p-6 bg-zinc-50 rounded-2xl border border-zinc-100">
                            <div className="flex flex-col">
                                <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-1">Source Brochure</span>
                                <span className="text-sm font-bold text-black truncate max-w-xs">{product.source_file}</span>
                            </div>
                            <button
                                onClick={() => setShowPdf(!showPdf)}
                                className={`px-6 py-3 rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg
                                    ${showPdf ? 'bg-zinc-200 text-zinc-600' : 'bg-zinc-900 text-white shadow-zinc-900/20 hover:scale-105 hover:bg-black'}
                                `}
                            >
                                {showPdf ? 'Hide Source' : 'View Source PDF'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* PDF Viewer Section */}
                <AnimatePresence>
                    {showPdf && (
                        <motion.div
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: isExpanded ? '100%' : '50%', opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            className="h-[600px] md:h-auto bg-zinc-100 border-l border-zinc-200 flex flex-col relative"
                        >
                            {/* PDF Toolbar */}
                            <div className="flex items-center gap-4 p-4 bg-white/80 backdrop-blur-md border-b border-zinc-200">
                                {/* Search Bar */}
                                <div className="flex-1 relative group">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Search other products in this brochure..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearch(e.target.value)}
                                        className="w-full bg-zinc-100 focus:bg-white border-zinc-200 rounded-lg pl-9 pr-4 py-2 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-black transition-all"
                                    />

                                    {/* Search Results Dropdown */}
                                    <AnimatePresence>
                                        {(searchResults.length > 0 || isSearching) && searchQuery && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-xl border border-zinc-200 max-h-60 overflow-y-auto z-20"
                                            >
                                                {isSearching && <div className="p-4 text-center text-xs text-zinc-400">Searching...</div>}
                                                {!isSearching && searchResults.map(p => (
                                                    <button
                                                        key={p.id}
                                                        onClick={() => {
                                                            onSwitch(p);
                                                            setSearchQuery('');
                                                            setSearchResults([]);
                                                        }}
                                                        className="w-full text-left p-3 hover:bg-zinc-50 border-b border-zinc-50 last:border-0"
                                                    >
                                                        <div className="font-bold text-xs text-zinc-900 truncate">{p.name}</div>
                                                        <div className="flex justify-between mt-1">
                                                            <span className="text-[10px] text-zinc-500 font-mono">#{p.id.slice(0, 6)}</span>
                                                            <span className="text-[10px] text-zinc-400">Page {p.page_number}</span>
                                                        </div>
                                                    </button>
                                                ))}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>

                                {/* Controls */}
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-all"
                                        title={isExpanded ? "Collapse" : "Expand"}
                                    >
                                        {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
                                    </button>
                                    <button
                                        onClick={() => setShowPdf(false)}
                                        className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-600 transition-all"
                                        title="Close PDF"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            </div>

                            <iframe
                                src={`${product.source_url}#page=${product.page_number}&view=FitH`}
                                className="w-full h-full border-none"
                                title="Brochure Viewer"
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>
        </motion.div>,
        document.body
    );
}
