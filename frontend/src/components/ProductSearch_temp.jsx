import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { api } from '../lib/api';
import { Search, Package, Zap, ArrowRight, X, Info, Filter, ChevronRight, Hash, Layers, Maximize2, Minimize2, ShoppingCart, Check, Plus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { CartModal } from './CartModal';

export function ProductSearch({ companies, sessionId, cart = [], refreshCart, onViewCart }) {
    const [query, setQuery] = useState('');
    const [company, setCompany] = useState('');
    const [brandSearchQuery, setBrandSearchQuery] = useState('');
    const [showBrandDropdown, setShowBrandDropdown] = useState(false);
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

    // Helper to find quantity in cart
    const getCartItem = (productId) => cart.find(p => p.id === productId);


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

    // Filter companies based on brand search
    const filteredCompanies = companies.filter(c =>
        (c.company || c).toLowerCase().includes(brandSearchQuery.toLowerCase())
    );

    return (
        <div className="w-full">
            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <StatCard
                    label="Total Products"
                    value={total}
                    icon={Package}
                    color="text-black"
                    bg="bg-gray-900/10"
                />
                <StatCard
                    label="Brands Indexed"
                    value={companies.length}
                    icon={Layers}
                    color="text-black"
                    bg="bg-gray-100"
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
            <div className="sticky top-24 z-30 bg-white/80 backdrop-blur-xl border border-gray-200 rounded-2xl p-4 mb-8 shadow-2xl shadow-gray-500/50">
                <div className="flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={20} />
                        <input
                            type="text"
                            placeholder="Search by model, specs, or description..."
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            className="w-full bg-gray-50/50 border border-gray-300/50 rounded-xl py-3 pl-12 pr-4 text-black placeholder-slate-500 focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>

                    {/* Searchable Brands Dropdown */}
                    <div className="relative w-full md:w-auto min-w-[200px]">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 z-10 pointer-events-none" size={18} />
                        <button
                            onClick={() => setShowBrandDropdown(!showBrandDropdown)}
                            className="w-full appearance-none bg-gray-50/50 border border-gray-300/50 rounded-xl py-3 pl-12 pr-10 text-black focus:outline-none focus:border-blue-500/50 font-medium text-left"
                        >
                            {company || 'All Brands'}
                        </button>
                        <ChevronRight className="absolute right-4 top-1/2 -translate-y-1/2 rotate-90 text-gray-500 pointer-events-none" size={16} />

                        {/* Dropdown Menu */}
                        <AnimatePresence>
                            {showBrandDropdown && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="absolute top-full mt-2 w-full bg-gray-50 border border-gray-200 rounded-xl shadow-2xl overflow-hidden z-50"
                                >
                                    {/* Search within dropdown */}
                                    <div className="p-2 border-b border-gray-200">
                                        <input
                                            type="text"
                                            value={brandSearchQuery}
                                            onChange={(e) => setBrandSearchQuery(e.target.value)}
                                            placeholder="Search brands..."
                                            className="w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-black placeholder-slate-500 focus:outline-none focus:border-blue-500/50"
                                            autoFocus
                                        />
                                    </div>

                                    {/* Brands List */}
                                    <div className="max-h-64 overflow-y-auto">
                                        <button
                                            onClick={() => {
                                                setCompany('');
                                                setShowBrandDropdown(false);
                                                setBrandSearchQuery('');
                                            }}
                                            className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 transition-colors ${!company ? 'bg-black/20 text-gray-700' : 'text-gray-700'}`}
                                        >
                                            All Brands
                                        </button>
                                        {filteredCompanies.map(c => (
                                            <button
                                                key={c.company || c}
                                                onClick={() => {
                                                    setCompany(c.company || c);
                                                    setShowBrandDropdown(false);
                                                    setBrandSearchQuery('');
                                                }}
                                                className={`w-full text-left px-4 py-2.5 hover:bg-gray-100 transition-colors ${company === (c.company || c) ? 'bg-black/20 text-gray-700' : 'text-gray-700'}`}
                                            >
                                                {c.company || c}
                                            </button>
                                        ))}
                                        {filteredCompanies.length === 0 && (
                                            <div className="px-4 py-3 text-sm text-gray-500 italic">No brands found</div>
                                        )}
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Floating Cart Button Removed */}

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
                            isInCart={!!getCartItem(product.id)}
                            cartItem={getCartItem(product.id)}
                            onToggleCart={(e) => { e.stopPropagation(); }}
                            onUpdateQty={async (newQty) => {
                                try {
                                    const item = getCartItem(product.id);
                                    if (newQty === 1 && !item) {
                                        // Add new
                                        await api.addToCart({
                                            sessionId,
                                            productId: product.id,
                                            quantity: 1,
                                            product: product
                                        });
                                    } else if (item) {
                                        if (newQty <= 0) {
                                            await api.removeFromCart(sessionId, item.cartItemId);
                                        } else {
                                            await api.updateCartItem({
                                                id: item.cartItemId,
                                                sessionId,
                                                quantity: newQty
                                            });
                                        }
                                    }
                                    refreshCart();
                                } catch (e) { console.error(e); }
                            }}
                        />
                    ))}
                </AnimatePresence>
            </div>

            {/* Loading States */}
            {loading && products.length === 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="h-80 bg-gray-50/50 rounded-2xl animate-pulse border border-gray-200" />
                    ))}
                </div>
            )}

            {!loading && products.length === 0 && (
                <div className="flex flex-col items-center justify-center py-24 text-gray-500">
                    <div className="bg-gray-50/50 p-6 rounded-full mb-4">
                        <Package size={48} className="opacity-50" />
                    </div>
                    <h3 className="text-xl font-semibold text-black mb-2">No products found</h3>
                    <p>Try adjusting your search or filters.</p>
                </div>
            )}

            {!loading && hasMore && products.length > 0 && (
                <div className="flex justify-center mt-16 pb-12">
                    <button
                        onClick={handleLoadMore}
                        className="group relative px-8 py-3 bg-gray-50 hover:bg-gray-100 text-black rounded-full font-medium transition-all hover:scale-105 active:scale-95 border border-gray-200"
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

// Cart API Helpers
async function updateCartQty(sessionId, product, newQty) {
    try {
        if (newQty <= 0) {
            // Remove
            // We need the cartItemId. 
            // Since we don't readily have it in "product" alone if it's from catalog, 
            // we rely on the backend possibly handling access by productId OR (better) we look it up from the cart cache if passed.
            // But wait, ProductSearch has 'cart' prop. We didn't pass 'cart' to this function.
            // Actually, for simplicity, we can just use the generic 'addToCart' if 0->1.
            // If 1->0, we need ID.

            // To simplify: We'll assume the 'product' object passed here MIGHT have cartItemId if it came from the cart list, 
            // OR we fetch the cart again to find it. 
            // BETTER: The backend 'RemoveFromCart' takes cartItemId. 
            // The backend 'AddToCart' handles upsert (increment).
            // We need a specific 'UpdateQuantity' or 'SetQuantity'.

            // Let's use the 'api.updateCartItem' which expects { id, sessionId, quantity }.
            // We need the cartItemId.
            // In App.jsx, we mapped cart items to have 'cartItemId'.
            // In ProductSearch, we pass `cartItem` to ProductCard. 
            // So we should pass `cartItem` to this function if it exists.
        }
    } catch (e) { }
}

// Redefining to be used in the component
/*
    The logic is moved inline to the onUpdateQty prop in the component render
    to access the cartItem directly.
*/


function StatCard({ label, value, icon: Icon, color, bg }) {
    return (
        <div className="bg-white/40 backdrop-blur-md border border-gray-200 rounded-2xl p-5 flex items-center gap-4 hover:border-gray-200 transition-colors group">
            <div className={`p-3 rounded-xl ${bg} ${color} group-hover:scale-110 transition-transform`}>
                <Icon size={24} />
            </div>
            <div>
                <p className="text-gray-600 text-xs uppercase tracking-wider font-semibold">{label}</p>
                <p className="text-2xl font-bold text-black mt-0.5 font-mono">{value}</p>
            </div>
        </div>
    );
}

function ProductCard({ product, index, onClick, isInCart, cartItem, onUpdateQty }) {
    const handleQtyChange = async (e, delta) => {
        e.stopPropagation();
        const currentQty = cartItem?.quantity || 0;
        const newQty = currentQty + delta;
        onUpdateQty(newQty);
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
            onClick={onClick}
            className={`bg-white/40 backdrop-blur-sm rounded-2xl border transition-all p-5 flex flex-col h-full cursor-pointer group relative overflow-hidden ${isInCart ? 'border-blue-500/50 shadow-lg shadow-blue-500/10' : 'border-gray-200 hover:border-blue-500/30 hover:bg-gray-50/60'}`}
        >
            <div className="absolute top-0 right-0 p-4 z-10 flex gap-2">
                {/* Qty Controls */}
                {isInCart ? (
                    <div className="flex items-center bg-gray-50 rounded-full border border-blue-500/30 shadow-lg overflow-hidden animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                        <button
                            onClick={(e) => handleQtyChange(e, -1)}
                            className="w-8 h-8 flex items-center justify-center text-black hover:bg-gray-100 transition-colors active:bg-slate-600"
                        >
                            -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-black font-mono">
                            {cartItem.quantity}
                        </span>
                        <button
                            onClick={(e) => handleQtyChange(e, 1)}
                            className="w-8 h-8 flex items-center justify-center text-black hover:bg-gray-100 transition-colors active:bg-slate-600"
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <button
                        onClick={(e) => handleQtyChange(e, 1)}
                        className={`p-2 rounded-full shadow-lg transition-all opacity-0 group-hover:opacity-100 bg-black text-black shadow-blue-500/20 hover:bg-blue-700`}
                        title="Add to Cart"
                    >
                        <Plus size={16} />
                    </button>
                )}
            </div>

            <div className="mb-4">
                <span className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-gray-700 bg-gray-900/10 px-2.5 py-1 rounded-md uppercase border border-blue-500/10 mb-3">
                    {product.company || "Generic"}
                </span>
                <h3 className="text-lg font-bold text-slate-100 leading-snug group-hover:text-blue-200 transition-colors line-clamp-2">
                    {product.name}
                </h3>
            </div>

            <p className="text-gray-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
                {product.description || "No description available."}
            </p>


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
            try { parsedSpecs = JSON.parse(specs); } catch { return <span className="text-gray-700">{specs}</span>; }
        }
        if (typeof parsedSpecs !== 'object' || parsedSpecs === null) return <span className="text-gray-700">{String(parsedSpecs)}</span>;

        if (Array.isArray(parsedSpecs)) return <span className="text-gray-700">{parsedSpecs.join(', ')}</span>;

        return (
            <div className={`grid gap-y-2 ${depth > 0 ? 'mt-3 mb-3 pl-3 border-l-2 border-gray-200 bg-gray-50 p-3 rounded-lg' : ''}`}>
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
                                <div className="text-xs font-bold text-black mb-2 uppercase tracking-widest border-b border-blue-500/20 pb-1">{key}</div>
                                {renderSpecs(cleanVal, depth + 1)}
                            </div>
                        );
                    }

                    return (
                        <div key={key} className="grid grid-cols-[140px_1fr] gap-4 items-start border-b border-gray-200 pb-1.5 last:border-0 hover:bg-gray-100 transition-colors px-2 rounded">
                            <span className="text-sm text-gray-600 font-medium capitalize break-words">{key.replace(/_/g, ' ')}</span>
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
                className={`bg-white border border-gray-200 overflow-hidden rounded-3xl shadow-2xl shadow-gray-500/50 relative flex flex-col transition-all duration-500`}
            >
                {/* Close Button Header - Sticky */}
                <div className="absolute top-4 right-4 z-50">
                    <button
                        onClick={onClose}
                        className="p-2 bg-black/40 hover:bg-red-500/20 hover:text-red-400 backdrop-blur-sm rounded-full text-black transition-all border border-gray-200 hover:border-red-500/30"
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
                                    <span className="inline-block text-xs font-bold tracking-wider text-black bg-gray-900/10 px-3 py-1 rounded-full uppercase border border-blue-500/20 mb-3">
                                        {product.company || "Generic Brand"}
                                    </span>
                                    <h2 className="text-3xl font-bold text-black mb-2">{product.name}</h2>
                                    <div className="flex items-center gap-2 text-sm text-gray-600 font-mono">
                                        <Hash size={14} />
                                        <span>ID: {product.id?.slice(0, 8)}...</span>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-invert max-w-none mb-8">
                                <h3 className="text-lg font-semibold text-black flex items-center gap-2 mb-3">
                                    <Info size={18} className="text-black" />
                                    Description
                                </h3>
                                <p className="text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-xl border border-gray-200">
                                    {product.description || "No description provided for this product."}
                                </p>
                            </div>

                            {product.specifications && (
                                <div className="mb-8">
                                    <h3 className="text-lg font-semibold text-black flex items-center gap-2 mb-4">
                                        <Zap size={18} className="text-yellow-400" />
                                        Technical Specifications
                                    </h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        {(() => {
                                            const isValidValue = (v) => {
                                                if (!v) return false;
                                                const s = String(v).trim();
                                                // Must contain at least one alphanumeric char
                                                return /[a-zA-Z0-9]/.test(s);
                                            };

                                            const filterSpecs = (s) => {
                                                if (!s || typeof s !== 'object') return null;
                                                if (Array.isArray(s)) {
                                                    const validItems = s.filter(isValidValue);
                                                    return validItems.length > 0 ? validItems : null;
                                                }
                                                const clean = {};
                                                let hasValid = false;
                                                Object.entries(s).forEach(([k, v]) => {
                                                    if (typeof v === 'object' && v !== null) {
                                                        const nested = filterSpecs(v);
                                                        if (nested) {
                                                            clean[k] = nested;
                                                            hasValid = true;
                                                        }
                                                    } else if (isValidValue(v)) {
                                                        clean[k] = v;
                                                        hasValid = true;
                                                    }
                                                });
                                                return hasValid ? clean : null;
                                            };

                                            const cleanSpecs = filterSpecs(product.specifications);

                                            if (cleanSpecs) {
                                                return renderSpecs(cleanSpecs);
                                            }

                                            return (
                                                <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 text-gray-600 italic text-sm text-center">
                                                    Detailed specifications not available. Please refer to the PDF source file.
                                                </div>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between p-4 bg-gray-900/5 border border-blue-500/10 rounded-xl mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-xs text-gray-500 uppercase tracking-widest font-semibold">Source File</span>
                                    <span className="text-sm text-blue-200 font-medium truncate max-w-[200px] md:max-w-md">
                                        {product.source_file || "Unknown File"}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm text-gray-600 bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-200">
                                        Page {product.page_number}
                                    </span>
                                    {product.source_url && (
                                        <button
                                            onClick={() => setShowPdf(!showPdf)}
                                            className="bg-black hover:bg-gray-900 text-black px-4 py-2 rounded-lg text-sm font-medium transition-colors"
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
                                className={`hidden lg:flex flex-col bg-white h-full relative overflow-hidden ${!isExpanded ? 'border-l border-gray-200' : ''}`}
                            >
                                {/* PDF Controls Bar */}
                                <div className="h-14 border-b border-gray-200 bg-white flex items-center px-4 justify-between shrink-0 gap-4">

                                    {/* Internal Search Bar */}
                                    <div className="relative flex-grow max-w-md group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-black transition-colors" size={16} />
                                        <input
                                            type="text"
                                            value={pdfQuery}
                                            onChange={(e) => setPdfQuery(e.target.value)}
                                            onFocus={() => setShowResults(true)}
                                            placeholder={`Search in ${product.source_file.length > 20 ? product.source_file.slice(0, 18) + '...' : product.source_file}...`}
                                            className="w-full bg-gray-50 border border-gray-300 rounded-lg py-1.5 pl-9 pr-4 text-sm text-black focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all placeholder:text-slate-600"
                                        />

                                        {/* Dropdown Results */}
                                        <AnimatePresence>
                                            {showResults && pdfQuery.length >= 2 && (
                                                <motion.div
                                                    initial={{ opacity: 0, y: 10 }}
                                                    animate={{ opacity: 1, y: 0 }}
                                                    exit={{ opacity: 0, y: 10 }}
                                                    className="absolute top-full left-0 right-0 mt-2 bg-gray-50 border border-gray-200 rounded-xl shadow-xl overflow-hidden z-30 max-h-80 overflow-y-auto"
                                                >
                                                    {isSearching ? (
                                                        <div className="p-4 text-center text-gray-500 text-sm">Searching...</div>
                                                    ) : pdfResults.length > 0 ? (
                                                        <div className="py-2">
                                                            <div className="px-3 pb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Found {pdfResults.length} matches</div>
                                                            {pdfResults.map(p => (
                                                                <button
                                                                    key={p.id}
                                                                    onClick={() => handleSelectResult(p)}
                                                                    className="w-full text-left px-4 py-3 hover:bg-gray-100/50 border-l-2 border-transparent hover:border-blue-500 transition-colors flex flex-col gap-1"
                                                                >
                                                                    <div className="flex justify-between items-start">
                                                                        <span className="text-black font-medium text-sm line-clamp-1">{p.name}</span>
                                                                        <span className="text-[10px] text-gray-600 bg-white px-1.5 py-0.5 rounded ml-2 whitespace-nowrap">Pg {p.page_number}</span>
                                                                    </div>
                                                                    <span className="text-gray-500 text-xs line-clamp-1">{p.description}</span>
                                                                </button>
                                                            ))}
                                                        </div>
                                                    ) : (
                                                        <div className="p-4 text-center text-gray-500 text-sm">No matches found in this PDF.</div>
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
                                            className="p-2 hover:bg-gray-50 rounded-lg text-gray-600 hover:text-black transition-colors"
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
                        <div className="lg:hidden h-[500px] w-full bg-slate-950 border-t border-gray-200 flex-shrink-0">
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
