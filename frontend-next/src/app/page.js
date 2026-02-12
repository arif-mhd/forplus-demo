
"use client";
import { useState, useEffect } from 'react';
import { ProductSearch } from '../components/ProductSearch';
import { BrandsPage } from '../components/BrandsPage';
import { UploadBrochure } from '../components/UploadBrochure';
import { api } from '../lib/api';
import { Package, Building2, Upload, ShoppingCart, Loader2 } from 'lucide-react';

export default function Home() {
    const [activeTab, setActiveTab] = useState('catalog'); // 'catalog', 'brands', 'upload'
    const [companies, setCompanies] = useState([]);
    const [sessionId, setSessionId] = useState(null);
    const [cart, setCart] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Initialize session
        let sid = null;
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const urlSid = params.get('session');
            if (urlSid) {
                localStorage.setItem('forplus_session_id', urlSid);
                sid = urlSid;
            } else {
                const stored = localStorage.getItem('forplus_session_id');
                if (stored) sid = stored;
                else {
                    const newSid = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    localStorage.setItem('forplus_session_id', newSid);
                    sid = newSid;
                }
            }
            setSessionId(sid);
            loadData(sid);
        }
    }, []);

    const loadData = async (sid) => {
        setLoading(true);
        try {
            const [companiesData, cartData] = await Promise.all([
                api.getCompanies(),
                api.getCart(sid)
            ]);
            setCompanies(companiesData);
            setCart(cartData || []);
        } catch (err) {
            console.error("Failed to load data:", err);
        } finally {
            setLoading(false);
        }
    };

    const refreshCart = async () => {
        if (!sessionId) return;
        try {
            const data = await api.getCart(sessionId);
            setCart(data || []);
        } catch (err) { console.error(err); }
    };

    const handleViewCart = () => {
        // Redirect to the cart app on port 3001 with the session ID
        window.location.href = `http://localhost:3001/?session=${sessionId}`;
    };

    // Calculate total items in cart
    const cartCount = cart.reduce((sum, item) => sum + (parseInt(item.quantity) || 1), 0);

    if (loading && !sessionId) {
        return (
            <div className="min-h-screen bg-zinc-50 flex flex-col items-center justify-center text-black">
                <Loader2 className="animate-spin mb-4 text-black" size={32} />
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Loading Procurement System</span>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-100/30 text-zinc-900">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-300/50 shadow-sm">
                <div className="max-w-full mx-auto px-8 py-5">
                    <div className="flex items-center justify-between">
                        {/* Logo - Left aligned */}
                        <div className="flex-1 flex items-center gap-4">
                            <img src="/logo.png" alt="ForPlus Logo" className="w-10 h-10 object-contain" />
                            <h1 className="text-2xl font-black tracking-tighter">
                                <span className="text-black uppercase">For</span>
                                <span className="text-zinc-400 font-light">plus</span>
                            </h1>
                        </div>

                        {/* Navigation Tabs - Centered */}
                        <div className="flex-[2] flex justify-center">
                            <nav className="flex items-center gap-1 bg-zinc-200/50 backdrop-blur-md p-1.5 rounded-2xl border border-zinc-300/50 shadow-sm">
                                <button
                                    onClick={() => setActiveTab('catalog')}
                                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'catalog'
                                        ? 'bg-black text-white shadow-lg shadow-black/20'
                                        : 'text-zinc-400 hover:text-black hover:bg-black/5'
                                        }`}
                                >
                                    <Package size={16} />
                                    Catalog
                                </button>
                                <button
                                    onClick={() => setActiveTab('brands')}
                                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'brands'
                                        ? 'bg-black text-white shadow-lg shadow-black/20'
                                        : 'text-zinc-400 hover:text-black hover:bg-black/5'
                                        }`}
                                >
                                    <Building2 size={16} />
                                    Brands
                                </button>
                                <button
                                    onClick={() => setActiveTab('upload')}
                                    className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${activeTab === 'upload'
                                        ? 'bg-black text-white shadow-lg shadow-black/20'
                                        : 'text-zinc-400 hover:text-black hover:bg-black/5'
                                        }`}
                                >
                                    <Upload size={16} />
                                    Upload
                                </button>
                            </nav>
                        </div>

                        {/* Cart Button - Right aligned */}
                        <div className="flex-1 flex justify-end">
                            <button
                                onClick={handleViewCart}
                                className="flex items-center gap-3 px-5 py-2.5 bg-white hover:bg-zinc-50 border border-zinc-300 rounded-xl text-black transition-all group relative shadow-md shadow-black/5"
                            >
                                <ShoppingCart size={18} className="text-black group-hover:scale-110 transition-transform" />
                                <span className="font-black text-[10px] uppercase tracking-widest">View Cart</span>
                                {cartCount > 0 && (
                                    <span className="absolute -top-2 -right-2 bg-black text-white text-[10px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-xl">
                                        {cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-full mx-auto px-8 py-10 bg-zinc-50/30">
                {activeTab === 'catalog' && (
                    <ProductSearch
                        companies={companies}
                        sessionId={sessionId}
                        cart={cart}
                        refreshCart={refreshCart}
                    />
                )}
                {activeTab === 'brands' && <BrandsPage />}
                {activeTab === 'upload' && (
                    <UploadBrochure onViewCatalog={() => setActiveTab('catalog')} />
                )}
            </main>
        </div>
    );
}
