
"use client";
import React from 'react';
import { X } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';
import { motion } from 'framer-motion';

export function PDFPreviewModal({ isOpen, onClose, document, fileName }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-white/20 backdrop-blur-sm print:hidden">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-5xl h-[85vh] rounded-2xl border border-zinc-200 shadow-2xl flex flex-col overflow-hidden"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white">
                    <div>
                        <h3 className="text-xl font-black text-black uppercase tracking-tighter">Invoice Preview</h3>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">{fileName}</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-3 hover:bg-black/5 rounded-full text-zinc-400 hover:text-black transition-all border border-zinc-100"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 bg-zinc-50 relative">
                    <PDFViewer
                        width="100%"
                        height="100%"
                        className="border-none w-full h-full"
                        showToolbar={true}
                    >
                        {document}
                    </PDFViewer>
                </div>
            </motion.div>
        </div>
    );
}
