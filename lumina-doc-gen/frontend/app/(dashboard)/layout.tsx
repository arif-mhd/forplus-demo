import React from 'react';
import Sidebar from '@/src/components/layout/Sidebar';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="min-h-screen bg-[#050505] flex">
            {/* Sidebar (Always visible) */}
            <Sidebar />

            {/* Main Content Area */}
            <main className="flex-1 ml-64 relative min-h-screen overflow-y-auto">
                {/* Background Effects */}
                <div className="fixed inset-0 z-0 ml-64 pointer-events-none">
                    <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-indigo-900/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-900/10 rounded-full blur-[120px]" />
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 brightness-100 contrast-150 mix-blend-overlay"></div>
                </div>

                <div className="relative z-10 w-full h-full">
                    {children}
                </div>
            </main>
        </div>
    );
}
