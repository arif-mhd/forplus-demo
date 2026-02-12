import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../lib/api';
import { Search, Package, Zap, ArrowRight, X, Info, Filter, ChevronRight, Hash, Layers, Maximize2, Minimize2, ShoppingCart, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartModal } from './CartModal';

export function ProductSearch({ companies, sessionId, onViewCart }) {
    const [query, setQuery] = useState('');
    const [company, setCompany] = useState('');
    // const [companies, setCompanies] = useState([]); // Moved to App
    const [products, setProducts] = useState([]);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [hasMore, setHasMore] = useState(true);
    const [skip, setSkip] = useState(0);

    const [selectedProduct, setSelectedProduct] = useState(null);
    // const [cart, setCart] = useState([]); // Moved to App
    // const [showCart, setShowCart] = useState(false); // Replaced by global nav
    const LIMIT = 20;

    // Cart functions moved to App

    // const isInCart = (productId) => cart.some(p => p.id === productId); 
    // We removed local cart check for performance/architecture split


    useEffect(() => {
        // Companies loaded in App
        fetchProducts(true);
    }, []);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (query || company) {
                fetchProducts(true);
            }
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
                setTotal(data.total || 0);
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

    const handleLoadMore = () => {
        fetchProducts(false);
    };

    return (
        <div className="w-full">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                    label="Total Products"
                    value={total}
                    icon={Package}
                    color="text-blue-400"
                    bg="bg-blue-500/10"
                />
                <StatCard
                    label="Brands Indexed"
                    value={companies.length}
                    icon={Layers}
                    color="text-purple-400"
                    bg="bg-purple-500/10"
                />
                <StatCard
                    label="Active Queries"
                    value="Live"
                    icon={Zap}
                    color="text-emerald-400"
                    bg="bg-emerald-500/10"
                />
            </div>

            {/* Search Bar & Filters */}
            <div className="sticky top-24 z-30 bg-slate-900/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 mb-8 shadow-2xl shadow-black/50">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            type="text"
                            placeholder="Search by model, specs, or description..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>

                    <div className="relative w-full md:w-auto min-w-[200px]">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                        <select
                            value={company}
                            onChange={(e) => setCompany(e.target.value)}
                            className="w-full appearance-none bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-12 pr-10 text-white focus:outline-none focus:border-blue-500/50 cursor-pointer font-medium"
                        >
                            <option value="">All Brands</option>
                            {companies.map(c => (
                                <option key={c.company || c} value={c.company || c}>{c.company || c}</option>
                            ))}
                        </select>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-slate-500 pointer-events-none" size={16} />
                    </div>
                </div>
            </div>

            {/* Floating Cart Button (Optional now since it's in header, but kept for UX) */}
            <AnimatePresence>
                <motion.button
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0, opacity: 0 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={onViewCart}
                    className="fixed bottom-8 right-8 z-50 bg-blue-600 text-white p-4 rounded-full shadow-lg shadow-blue-600/30 flex items-center justify-center group"
                >
                    <ShoppingCart size={24} />
                </motion.button>
            </AnimatePresence>

            {/* Product Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <AnimatePresence mode="popLayout">
                    {products.map((product, index) => (
                        <ProductCard
                            key={`${product.id}-${index}`}
                            product={product}
                            index={index}
                            onClick={() => setSelectedProduct(product)}
                            // isInCart={isInCart(product.id)}
                            isInCart={false} // Always allow adding more
                            onToggleCart={(e) => {
                                e.stopPropagation();
                                addToCartApi(sessionId, product);
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Loading States */}
            {loading && products.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-80 bg-slate-800/50 rounded-2xl animate-pulse border border-white/5" />
                    ))}
                </div>
            )}

            {!loading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-slate-500">
                    <div className="bg-slate-800/50 p-6 rounded-full mb-4">
                        <Package size={48} className="opacity-50" />
                    </div>
                    <h3 className="text-xl font-semibold text-white mb-2">No products found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}

            {!loading && hasMore && products.length > 0 && (
                <div className="flex justify-center mt-16 pb-12">
                    <button
                        onClick={handleLoadMore}
                        className="group relative px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-full font-medium transition-all hover:scale-105 active:scale-95 border border-white/10"
                    >
                        <span className="flex items-center gap-2">
                            Load More
                            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                    </button>
                </div>
            )}

            {/* Product Detail Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <ProductModal
                        product={selectedProduct}
                        onClose={() => setSelectedProduct(null)}
                        onSelectProduct={setSelectedProduct}
                    />
                )}
            </AnimatePresence>


            {/* Cart Modal Removed - using Page instead */}
        </div >
    );
}

// Add To Cart Functionality (Internal)
async function addToCartApi(sessionId, product) {
    try {
        await api.addToCart({
            sessionId,
            productId: product.id,
            quantity: 1,
            product: product // Snapshot
        });
        alert("Added to cart!"); // Simple feedback for now
    } catch (err) {
        console.error("Failed to add to cart", err);
        alert("Failed to add to cart");
    }
}

function StatCard({ label, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-2xl p-5 flex items-center gap-4 hover:border-white/10 transition-colors group">
            <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-2xl font-bold text-white mt-0.5 font-mono">{value}</p>
            </div>
        </div>
    );
}

function ProductCard({ product, index, onClick, isInCart, onToggleCart }) {
    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={onClick}
            className={`bg-slate-900/40 backdrop-blur-sm rounded-2xl border transition-all p-5 flex flex-col h-full cursor-pointer group relative overflow-hidden ${isInCart ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-white/5 hover:border-blue-500/30 hover:bg-slate-800/60'}`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity z-10 flex gap-2">
                <button
                    onClick={onToggleCart}
                    className={`p-2 rounded-full shadow-lg transition-all ${isInCart
                        ? "bg-red-500 text-white shadow-red-500/20 hover:bg-red-600"
                        : "bg-blue-600 text-white shadow-blue-500/20 hover:bg-blue-700"
                        }`}
                    title={isInCart ? "Remove from Cart" : "Add to Cart"}
                >
                    {isInCart ? <Check size={16} /> : <Plus size={16} />}
                </button>
                <div className="bg-slate-700/50 backdrop-blur-md p-2 rounded-full text-white/50 shadow-lg">
                    <ArrowRight size={16} className="-rotate-45" />
                </div>
            </div>

            <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-blue-300 bg-blue-500/10 px-2.5 py-1 rounded-md uppercase border border-blue-500/10 mb-3">
                    {product.company || "Generic"}
                </span>
                <h3 className="text-lg font-bold text-slate-100 leading-snug group-hover:text-blue-200 transition-colors line-clamp-2">
                    {product.name}
                </h3>
            </div>

            <p className="text-slate-400 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                {product.description || "No description available."}
            </p>

            <div className="mt-auto pt-4 border-t border-white/5 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                {(() => {
                    let specs = product.specifications;
                    if (typeof specs === 'string') {
                        try { specs = JSON.parse(specs); } catch (e) { }
                    }

                    if (specs && typeof specs === 'object' && !Array.isArray(specs)) {
                        return Object.entries(specs).slice(0, 2).map(([key, value]) => (
                            <div key={key} className="flex flex-col">
                                <span className="text-slate-500 capitalize truncate">{key.replace(/_/g, ' ')}</span>
                                <span className="text-slate-300 font-medium truncate">{String(value)}</span>
                            </div>
                        ));
                    }
                    return <span className="col-span-2 text-slate-500 italic">View details for specs</span>;
                })()}
            </div>
        </motion.div>
    );
}



function ProductModal({ product, onClose, onSelectProduct }) {
    const [showPdf, setShowPdf] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const [pdfQuery, setPdfQuery] = useState("");
    const [pdfResults, setPdfResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);

    // Recursive Spec Renderer
    const renderSpecs = (specs, depth = 0) => {
        if (!specs) return null;
        let parsedSpecs = specs;
        if (typeof specs === 'string') {
            try { parsedSpecs = JSON.parse(specs); } catch { return <span className="text-slate-300">{specs}</span>; }
        }
        if (typeof parsedSpecs !== 'object' || parsedSpecs === null) return <span className="text-slate-300">{String(parsedSpecs)}</span>;

        if (Array.isArray(parsedSpecs)) return <span className="text-slate-300">{parsedSpecs.join(', ')}</span>;

        return (
            <div className={`grid gap-y-2 ${depth > 0 ? 'mt-3 mb-3 pl-3 border-l-2 border-white/10 bg-white/5 p-3 rounded-lg' : ''}`}>
                {Object.entries(parsedSpecs).map(([key, val]) => {
                    // Try to parse string values that might be JSON
                    let cleanVal = val;
                    if (typeof val === 'string' && (val.trim().startsWith('{') || val.trim().startsWith('['))) {
                        try { cleanVal = JSON.parse(val); } catch { }
                    }

                    // If nested object (like 50W: {...})
                    if (typeof cleanVal === 'object' && cleanVal !== null && !Array.isArray(cleanVal)) {
                        return (
                            <div key={key} className="col-span-full mt-2">
                                <div className="text-xs font-bold text-blue-400 mb-2 uppercase tracking-widest border-b border-blue-500/20 pb-1">{key}</div>
                                {renderSpecs(cleanVal, depth + 1)}
                            </div>
                        );
                    }

                    return (
                        <div key={key} className="grid grid-cols-[140px_1fr] gap-4 items-start border-b border-white/5 pb-1.5 last:border-0 hover:bg-white/5 transition-colors px-2 rounded">
                            <span className="text-sm text-slate-400 font-medium capitalize break-words">{key.replace(/_/g, ' ')}</span>
                            <span className="text-sm text-slate-200 font-medium break-words">
                                {Array.isArray(cleanVal) ? cleanVal.join(', ') : (typeof cleanVal === 'object' ? JSON.stringify(cleanVal) : String(cleanVal))}
                            </span>
                        </div>
                    );
                })}
            </div>
        );
    };

    useEffect(() => {
        // Prevent scrolling on the body when modal is open
        document.body.style.overflow = 'hidden';

        return () => {
            // Re-enable scrolling when modal is closed
            document.body.style.overflow = 'unset';
            document.body.style.paddingRight = '0px';
        };
    }, []);

    // Search within PDF Logic
    useEffect(() => {
        const searchInPdf = async () => {
            if (!pdfQuery || pdfQuery.length < 2) {
                setPdfResults([]);
                return;
            }

            setIsSearching(true);
            try {
                // Search ONLY within this source file
                const data = await api.searchProducts({
                    query: pdfQuery,
                    source_file: product.source_file,
                    limit: 50
                });

                // Filter out the current product from results
                const otherProducts = (data.products || []).filter(p => p.id !== product.id);
                setPdfResults(otherProducts);
                setShowResults(true);
            } catch (error) {
                console.error("PDF internal search failed:", error);
            } finally {
                setIsSearching(false);
            }
        };

        const timer = setTimeout(searchInPdf, 400);
        return () => clearTimeout(timer);
    }, [pdfQuery, product.source_file, product.id]);

    const handleSelectResult = (result) => {
        onSelectProduct(result);
        setShowResults(false);
        setPdfQuery("");
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
                layout
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{
                    opacity: 1,
                    scale: 1,
                    y: 0,
                    width: isExpanded ? '98%' : (showPdf ? '90%' : '100%'),
                    maxWidth: isExpanded ? 'none' : (showPdf ? '90rem' : '48rem'),
                    height: isExpanded ? '95vh' : (showPdf ? '85vh' : 'auto')
                }}
                style={{ maxHeight: isExpanded ? '95vh' : '90vh' }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                transition={{ type: "spring", damping: 25, stiffness: 300 }}
                onClick={(e) => e.stopPropagation()}
                className={`bg-slate-900 border border-white/10 overflow-hidden rounded-3xl shadow-2xl shadow-black/50 relative flex flex-col transition-all duration-500`}
            >
                {/* Close Button Header - Sticky */}
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/40 hover:bg-red-500/20 hover:text-red-400 backdrop-blur-sm rounded-full text-white transition-all border border-white/10 hover:border-red-500/30"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className={`flex flex-col lg:flex-row flex-1 min-h-0 overflow-hidden`}>

                    {/* Left Column: Product Details */}
                    <motion.div
                        initial={false}
                        animate={{
                            flexBasis: showPdf ? (isExpanded ? "0%" : "50%") : "100%",
                            width: showPdf ? (isExpanded ? 0 : "auto") : "100%", // Helper for non-flex fallbacks
                            opacity: isExpanded ? 0 : 1
                        }}
                        transition={{ duration: 0.3, ease: "easeInOut" }}
                        className="flex flex-col flex-shrink-0 overflow-y-auto overflow-x-hidden min-w-0" // min-w-0 important for flex shrinkage
                    >
                        <div className="p-8 pt-12 min-h-full flex flex-col w-full min-w-[300px]">
                            <div className="flex items-start justify-between gap-6 mb-8">
                                <div>
                                    <span className="inline-block text-xs font-bold tracking-wider text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full uppercase border border-blue-500/20 mb-3">
                                        {product.company || "Generic Brand"}
                                    </span>
                                    <h2 className="text-3xl font-bold text-white mb-2">{product.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-slate-400 font-mono">
                                        <Hash size={14} />
                                        <span>ID: {product.id?.slice(0, 8)}...</span>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none mb-8">
                                <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-3">
                                    <Info size={18} className="text-blue-400" />
                                    Description
                                </h3>
                                <p className="text-slate-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                                    {product.description || "No description provided for this product."}
                                </p>
                            </div>

                            {product.specifications && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                                        <Zap size={18} className="text-yellow-400" />
                                        Technical Specifications
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {renderSpecs(product.specifications)}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Source File</span>
                                    <span className="text-sm text-blue-200 font-medium truncate max-w-[200px] md:max-w-md">
                                        {product.source_file || "Unknown File"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-slate-400 bg-white/5 px-3 py-1.5 rounded-lg border border-white/5">
                                        Page {product.page_number}
                                    </span>
                                    {product.source_url && (
                                        <button
                                            onClick={() => setShowPdf(!showPdf)}
                                            className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                                        >
                                            {showPdf ? 'Close PDF' : 'View PDF'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    {/* Right Column: PDF Preview */}
                    <AnimatePresence>
                        {showPdf && product.source_url && (
                            <motion.div
                                initial={{ opacity: 0, flexGrow: 0, flexBasis: 0 }}
                                animate={{
                                    opacity: 1,
                                    flexGrow: 1, // Always grow to fill remaining space
                                    flexBasis: isExpanded ? "100%" : "50%" // Help bias the flex calculation
                                }}
                                exit={{ opacity: 0, flexGrow: 0, flexBasis: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className={`hidden lg:flex flex-col bg-slate-900 h-full relative overflow-hidden ${!isExpanded ? 'border-l border-white/10' : ''}`}
                            >
                                {/* PDF Controls Bar */}
                                <div className="h-14 border-b border-white/10 bg-slate-900 flex items-center px-4 justify-between shrink-0 gap-4">

                                    {/* Internal Search Bar */}
                                    <div className="relative flex-grow max-w-md group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={pdfQuery}
                                            onChange={(e) => setPdfQuery(e.target.value)}
                                            onFocus={() => setShowResults(true)}
                                            placeholder={`Search in ${product.source_file.length > 20 ? product.source_file.slice(0, 18) + '...' : product.source_file}...`}
                                            className="w-full bg-slate-800 border border-slate-700 rounded-lg py-1.5 pl-9 pr-4 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                                        />

                                        {/* Dropdown Results */}
                                        <AnimatePresence>
                                            {showResults && pdfQuery.length >= 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-30 max-h-80 overflow-y-auto"
                                                >
                                                    {isSearching ? (
                                                        <div className="p-4 text-center text-slate-500 text-sm">Searching...</div>
                                                    ) : pdfResults.length > 0 ? (
                                                        <div className="py-2">
                                                            <div className="px-3 pb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Found {pdfResults.length} matches</div>
                                                            {pdfResults.map(p => (
                                                                <button
                                                                    key={p.id}
                                                                    onClick={() => handleSelectResult(p)}
                                                                    className="w-full text-left px-4 py-3 hover:bg-slate-700/50 border-l-2 border-transparent hover:border-blue-500 transition-colors flex flex-col gap-1"
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <span className="text-white font-medium text-sm line-clamp-1">{p.name}</span>
                                                                        <span className="text-[10px] text-slate-400 bg-slate-900 px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">Pg {p.page_number}</span>
                                                                    </div>
                                                                    <span className="text-slate-500 text-xs line-clamp-1">{p.description}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center text-slate-500 text-sm">No matches found in this PDF.</div>
                                                    )}
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex items-center gap-2">
                                        <div className="h-6 w-px bg-white/10 mx-1"></div>
                                        <button
                                            onClick={() => setIsExpanded(!isExpanded)}
                                            className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
                                            title={isExpanded ? "Collapse View" : "Enlarge PDF"}
                                        >
                                            {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                                        </button>

                                        {/* Spacer to avoid overlap with sticky close button on far right */}
                                        <div className="w-8"></div>
                                    </div>
                                </div>

                                <iframe
                                    src={`${product.source_url}#page=${product.page_number}&view=FitH`}
                                    className="w-full flex-grow border-none bg-slate-200"
                                    title="Product Brochure"
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Mobile PDF Fallback (Stacked) */}
                    {showPdf && product.source_url && (
                        <div className="lg:hidden h-[500px] w-full bg-slate-950 border-t border-white/10 flex-shrink-0">
                            <iframe
                                src={`${product.source_url}#page=${product.page_number}&view=FitH`}
                                className="w-full h-full border-none"
                                title="Product Brochure"
                            />
                        </div>
                    )}

                </div>
            </motion.div >
        </motion.div >,
        document.body
    );
}
