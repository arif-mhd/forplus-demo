
"use client";
import { useState, useEffect } from 'react';
import { CartPage } from '../components/CartPage';
import { api } from '../lib/api';
import { Loader2, AlertCircle, ShoppingCart } from 'lucide-react';

export default function Home() {
    const [cart, setCart] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sessionId, setSessionId] = useState(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const sid = params.get('session');

            if (sid) {
                setSessionId(sid);
                fetchData(sid);
            } else {
                setError("No Session ID provided. Please open Cart from the Main Catalog.");
                setLoading(false);
            }
        }
    }, []);

    const fetchData = async (sid) => {
        setLoading(true);
        try {
            const [cartData, companiesData] = await Promise.all([
                api.getCart(sid),
                api.getCompanies()
            ]);

            const adaptedCart = cartData.reduce((acc, item) => {
                const existing = acc.find(p => p.id === item.product.id);
                if (existing) {
                    existing.quantity += (parseInt(item.quantity) || 1);
                } else {
                    acc.push({
                        ...item.product,
                        cartItemId: item.id,
                        quantity: parseInt(item.quantity) || 1
                    });
                }
                return acc;
            }, []);

            setCart(adaptedCart);
            setCompanies(companiesData);
        } catch (err) {
            console.error(err);
            setError("Failed to load cart data.");
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        if (!sessionId) return;
        const item = cart.find(p => p.id === productId);
        if (!item || !item.cartItemId) return;
        const oldCart = [...cart];
        setCart(prev => prev.filter(p => p.id !== productId));
        try { await api.removeFromCart(sessionId, item.cartItemId); }
        catch (err) { alert("Failed to remove item"); setCart(oldCart); }
    };

    const handleUpdateQuantity = async (productId, newQty) => {
        if (!sessionId) return;
        const item = cart.find(p => p.id === productId);
        if (!item) return;
        setCart(prev => prev.map(p => p.id === productId ? { ...p, quantity: newQty } : p));
        try {
            await api.updateCartItem({ id: item.cartItemId, sessionId, quantity: newQty });
            if (newQty <= 0) setCart(prev => prev.filter(p => p.id !== productId));
        } catch (err) { console.error(err); fetchData(sessionId); }
    };

    if (loading && !error) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center text-black">
                <Loader2 className="animate-spin mb-4 text-black" size={32} />
                <span className="font-black uppercase tracking-[0.2em] text-[10px]">Synchronizing Cart Data</span>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center text-zinc-400 gap-4 font-black uppercase tracking-widest text-xs p-8 text-center">
                <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center border border-zinc-100 mb-2">
                    <AlertCircle size={32} className="text-zinc-200" />
                </div>
                {error}
                <button onClick={() => window.location.href = 'http://localhost:3000'} className="mt-4 px-8 py-3 bg-black text-white rounded-xl text-[10px]">Return to Catalog</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-zinc-100/30">
            <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-zinc-300/50 shadow-sm">
                <div className="max-w-full mx-auto px-8 py-5 flex items-center justify-between">
                    <div className="flex-1">
                        <h1 className="text-2xl font-black tracking-tighter cursor-pointer" onClick={() => window.location.href = `http://localhost:3000/?session=${sessionId}`}>
                            <span className="text-black uppercase">For</span>
                            <span className="text-zinc-400 font-light">plus</span>
                        </h1>
                    </div>
                    <div className="flex-[2] flex justify-center">
                        <div className="bg-zinc-200/50 backdrop-blur-md px-6 py-2.5 rounded-2xl border border-zinc-300/50 flex items-center gap-3 shadow-sm">
                            <ShoppingCart size={16} className="text-zinc-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-black">Procurement Dashboard</span>
                        </div>
                    </div>
                    <div className="flex-1"></div>
                </div>
            </header>

            <main className="max-w-full mx-auto">
                <CartPage
                    cart={cart}
                    companies={companies}
                    onRemoveFromCart={handleRemove}
                    onUpdateQuantity={handleUpdateQuantity}
                    onBack={() => {
                        window.location.href = `http://localhost:3000/?session=${sessionId}`;
                    }}
                />
            </main>
        </div>
    );
}
