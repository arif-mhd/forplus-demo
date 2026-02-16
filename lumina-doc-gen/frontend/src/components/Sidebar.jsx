import React from 'react';
import { LayoutDashboard, FileText, History, Settings, LogOut, Sparkles } from 'lucide-react';

export default function Sidebar({ activeView, onViewChange }) {
    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'history', label: 'History', icon: History },
        { id: 'settings', label: 'Settings', icon: Settings },
    ];

    return (
        <div className="w-64 h-screen bg-[#0A0A0A] border-r border-white/5 flex flex-col fixed left-0 top-0 z-50">
            {/* Brand */}
            <div className="p-6 flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-500/25">
                    <Sparkles size={16} fill="currentColor" />
                </div>
                <span className="text-lg font-bold text-white tracking-tight">Lumina</span>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 mt-4">
                {navItems.map((item) => (
                    <button
                        key={item.id}
                        onClick={() => onViewChange(item.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group ${activeView === item.id
                            ? 'bg-white/10 text-white shadow-lg shadow-black/20'
                            : 'text-gray-400 hover:bg-white/5 hover:text-white'
                            }`}
                    >
                        <item.icon size={18} className={activeView === item.id ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'} />
                        {item.label}
                    </button>
                ))}
            </nav>

            {/* User Logic (Stub) */}
            <div className="p-4 border-t border-white/5">
                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-gray-400 hover:bg-red-500/10 hover:text-red-400 transition-colors">
                    <LogOut size={18} />
                    Sign Out
                </button>
            </div>
        </div>
    );
}
