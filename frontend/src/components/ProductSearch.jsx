import { useState, useEffect } from 'react';
import { api } from '../lib/api';
import { Search, Package, Zap, ArrowRight, X, Info, Filter, ChevronRight, Hash, Layers, Maximize2, Minimize2, ShoppingCart, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createPortal } from 'react-dom';

export function ProductSearch({ companies, sessionId, cart = [], refreshCart }) {
    const [query, setQuery] = useState('');
    const [company, setCompany] = useState('');
    const [brandSearchQuery, setBrandSearchQuery] = useState('');
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const LIMIT = 24;

    const getCartItem = (productId) => cart.find(item => item.product?.id === productId);

    useEffect(() => {
        fetchProducts(true);
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchProducts(true);
        }, 500);
        return () => clearTimeout(timer);
    }, [query, company]);

    const fetchProducts = async (reset = false) => {
        setLoading(true);
        try {
            const newSkip = reset ? 0 : skip;
            const data = await api.searchProducts({ query, company, skip: newSkip, limit: LIMIT });
            if (reset) {
                setProducts(data.products || []);
                setTotal(data.total || 0);
                setSkip(LIMIT);
            } else {
                setProducts(prev => [...prev, ...(data.products || [])]);
                setSkip(prev => prev + LIMIT);
                setHasMore(!(data.products && data.products.length < LIMIT));
            }
            if (reset && data.products && data.products.length < LIMIT) {
                setHasMore(false);
            }
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => fetchProducts(false);

    const filteredCompanies = companies.filter(c =>
        (c.company || c).toLowerCase().includes(brandSearchQuery.toLowerCase())
    );

    return (
        <div className="w-full">
            {/* Stats Dashboard - Glassmorphism */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                <StatCard label="Total Products" value={total} icon={Package} bg="bg-zinc-100" color="text-black" />
                <StatCard label="Brands Indexed" value={companies.length} icon={Layers} bg="bg-zinc-100" color="text-black" />
                <StatCard label="Active Queries" value="Live" icon={Zap} bg="bg-black" color="text-white" isLive />
            </div>

            {/* Search Bar - Glassmorphism Sticky */}
            <div className="sticky top-28 z-30 bg-white/95 backdrop-blur-xl border border-zinc-300 rounded-2xl p-4 mb-12 shadow-xl shadow-black/[0.05]">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-black transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by model, specs, or description..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-zinc-50/50 border border-zinc-100 rounded-xl py-4 pl-14 pr-6 text-black placeholder-zinc-400 focus:outline-none focus:border-black focus:bg-white transition-all font-medium text-sm"
                        />
                    </div>

                    <div className="relative w-full md:w-auto min-w-[240px]">
                        <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400 z-10 pointer-events-none" size={18} />
                        <button
                            onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                            className="w-full appearance-none bg-zinc-50/50 border border-zinc-100 rounded-xl py-4 pl-14 pr-12 text-black focus:outline-none focus:border-black focus:bg-white font-black text-[10px] uppercase tracking-widest text-left transition-all"
                        >
                            {company || 'All Brands'}
                        </button>
                        <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 rotate-90 text-zinc-400 pointer-events-none transition-transform" size={18} />

                        <AnimatePresence>
                            {showBrandDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full mt-3 w-full bg-white/95 backdrop-blur-xl border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden z-50 p-2"
                                >
                                    <div className="p-2 mb-2">
                                        <input
                                            type="text"
                                            value={brandSearchQuery}
                                            onChange={(e) => setBrandSearchQuery(e.target.value)}
                                            placeholder="Search brands..."
                                            className="w-full bg-zinc-50 border border-zinc-100 rounded-xl px-4 py-2.5 text-xs text-black placeholder-zinc-400 focus:outline-none focus:border-black"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="max-h-72 overflow-y-auto space-y-1 custom-scrollbar px-1">
                                        <button
                                            onClick={() => { setCompany(''); setShowBrandDropdown(false); }}
                                            className={`w-full text-left px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${!company ? 'bg-black text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                        >
                                            All Brands
                                        </button>
                                        {filteredCompanies.map(c => (
                                            <button
                                                key={c.company || c}
                                                onClick={() => { setCompany(c.company || c); setShowBrandDropdown(false); }}
                                                className={`w-full text-left px-4 py-3 rounded-xl transition-all font-black text-[10px] uppercase tracking-widest ${company === (c.company || c) ? 'bg-black text-white' : 'text-zinc-500 hover:bg-zinc-50'}`}
                                            >
                                                {c.company || c}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
                <AnimatePresence mode="popLayout">
                    {products.map((product, index) => (
                        <ProductCard
                            key={product.id}
                            product={product}
                            index={index}
                            onClick={() => setSelectedProduct(product)}
                            isInCart={!!getCartItem(product.id)}
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
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 3xl:grid-cols-6 gap-6">
                    {[1, 2, 3, 4, 5, 6, 12, 18].map(i => (
                        <div key={i} className="h-64 bg-zinc-100 rounded-2xl animate-pulse border border-zinc-200" />
                    ))}
                </div>
            )}

            {!loading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-32 text-center">
                    <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-6 border border-zinc-100 shadow-inner">
                        <Package size={40} className="text-zinc-200" />
                    </div>
                    <h3 className="text-2xl font-black text-black uppercase tracking-tighter mb-2">No matches found</h3>
                    <p className="text-zinc-500 font-medium">Try different keywords or filters.</p>
                </div>
            )}

            {hasMore && products.length > 0 && (
                <div className="flex justify-center mt-20 mb-10">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-12 py-5 bg-black text-white rounded-full font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-black/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-4 disabled:opacity-50"
                    >
                        {loading ? 'Searching...' : 'Express results'}
                        <ArrowRight size={18} />
                    </button>
                </div>
            )}

            <AnimatePresence>
                {selectedProduct && (
                    <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ label, value, icon: Icon, bg, color, isLive }) {
    return (
        <div className="bg-white rounded-2xl border border-zinc-300 p-6 flex items-center gap-5 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group overflow-hidden relative">
            <div className={`p-4 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform relative z-10 shadow-lg ${isLive ? 'shadow-green-500/10' : ''}`}>
                <Icon size={24} />
            </div>
            <div className="relative z-10">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">{label}</p>
                <div className="flex items-center gap-3">
                    <span className="text-4xl font-black text-black tracking-tighter">{value}</span>
                    {isLive && <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping" />}
                </div>
            </div>
            <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:scale-125 transition-transform duration-700">
                <Icon size={120} />
            </div>
        </div>
    );
}

function ProductCard({ product, index, onClick, isInCart, onUpdateQty }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: (index % 12) * 0.03 }}
            onClick={onClick}
            className={`group relative h-full bg-white border rounded-2xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-black/5 flex flex-col shadow-sm ${isInCart ? 'border-black ring-1 ring-black/5' : 'border-zinc-200 hover:border-black/40'}`}
        >
            <div className="p-6 flex-1 flex flex-col cursor-pointer">
                <div className="flex justify-between items-start mb-6">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400 bg-zinc-50 px-2 py-1 rounded">
                        {product.company}
                    </span>
                    <button
                        onClick={(e) => { e.stopPropagation(); onUpdateQty(isInCart ? 0 : 1); }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all shadow-lg ${isInCart ? 'bg-black text-white scale-110' : 'bg-white text-black border border-zinc-100 hover:bg-black hover:text-white opacity-0 group-hover:opacity-100'}`}
                    >
                        {isInCart ? <Check size={16} /> : <Plus size={16} />}
                    </button>
                </div>

                <h3 className="text-xl font-black text-black mb-3 leading-tight tracking-tighter uppercase line-clamp-2">
                    {product.name}
                </h3>

                <p className="text-zinc-500 text-sm font-medium line-clamp-3 leading-relaxed mb-6">
                    {product.description || "Specifications and advanced lighting details for professional installation."}
                </p>

                <div className="mt-auto pt-6 border-t border-zinc-100 flex items-center justify-between">
                    <div className="flex flex-col">
                        <span className="text-[8px] font-black text-zinc-300 uppercase tracking-widest">Reference</span>
                        <span className="text-xs font-mono font-bold text-black">{product.id?.slice(0, 8).toUpperCase()}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

function ProductModal({ product, onClose }) {
    const [showPdf, setShowPdf] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => { document.body.style.overflow = 'unset'; };
    }, []);

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
                                <div className="text-[10px] font-black text-black uppercase tracking-widest mb-2 pb-1 border-b border-zinc-100">{key}</div>
                                {renderSpecs(value, depth + 1)}
                            </div>
                        );
                    }
                    return (
                        <div key={key} className="flex flex-col border-b border-zinc-50 pb-2">
                            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1">{key.replace(/_/g, ' ')}</span>
                            <span className="text-sm text-black font-bold break-words">{String(value)}</span>
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
                            <span className="text-[10px] font-black text-white bg-black px-3 py-1.5 rounded-full uppercase tracking-widest mb-4 inline-block">
                                {product.company}
                            </span>
                            <h2 className="text-4xl font-black text-black uppercase tracking-tighter leading-tight mb-2">
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
                            <div className="flex items-center gap-3 mb-4 text-black uppercase font-black text-sm tracking-tighter">
                                <Info size={20} />
                                Overview
                            </div>
                            <p className="text-zinc-500 text-lg leading-relaxed font-medium bg-zinc-50 p-6 rounded-2xl border border-zinc-100 shadow-inner">
                                {product.description || "Detailed technical description currently being optimized for catalog presentation."}
                            </p>
                        </section>

                        <section>
                            <div className="flex items-center gap-3 mb-6 text-black uppercase font-black text-sm tracking-tighter">
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
                                className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg
                                    ${showPdf ? 'bg-zinc-200 text-zinc-600' : 'bg-black text-white shadow-black/20 hover:scale-105'}
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
                            <div className="absolute top-4 right-4 z-10 flex gap-2">
                                <button
                                    onClick={() => setIsExpanded(!isExpanded)}
                                    className="p-2 bg-white/80 backdrop-blur-md rounded-full text-black border border-zinc-200 shadow-lg hover:bg-black hover:text-white transition-all"
                                >
                                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                </button>
                                <button
                                    onClick={() => setShowPdf(false)}
                                    className="p-2 bg-white/80 backdrop-blur-md rounded-full text-black border border-zinc-200 shadow-lg hover:bg-black hover:text-white transition-all"
                                >
                                    <X size={18} />
                                </button>
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
