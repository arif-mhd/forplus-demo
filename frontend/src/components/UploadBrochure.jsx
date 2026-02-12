import { useState, useRef } from 'react';
import { api } from '../lib/api';
import { Upload, FileText, CheckCircle, AlertCircle, Loader2, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function UploadBrochure({ onViewCatalog }) {
    const [file, setFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [dragActive, setDragActive] = useState(false);
    const fileInputRef = useRef(null);

    const validateAndSetFile = (selectedFile) => {
        if (selectedFile.type !== 'application/pdf') {
            setError("Please upload a PDF file.");
            return;
        }
        setFile(selectedFile);
        setError(null);
        setResult(null);
    };

    const handleDrag = (e) => {
        e.preventDefault(); e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
        else if (e.type === "dragleave") setDragActive(false);
    };

    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) validateAndSetFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true); setError(null); setResult(null);
        try {
            const data = await api.uploadBrochure(file);
            setResult(data);
            setFile(null);
        } catch (err) { setError("Upload failed. Please try again."); } finally { setUploading(false); }
    };

    return (
        <div className="w-full max-w-5xl mx-auto">
            <div className="text-center mb-16">
                <h1 className="text-5xl md:text-6xl font-black text-black mb-6 uppercase tracking-[0.1em]">
                    Sync <span className="text-zinc-300">Archives</span>
                </h1>
                <p className="text-zinc-500 text-lg max-w-2xl mx-auto font-medium leading-relaxed">
                    Upload your lighting product catalogs (PDF) and let our AI automatically extract, categorize, and index the products for you.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col gap-8">
                    <div
                        className={`relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all duration-500 min-h-[400px] shadow-sm cursor-pointer
                            ${dragActive ? 'border-black bg-zinc-50 shadow-2xl shadow-black/5 scale-[1.02]' : 'border-zinc-300 hover:border-black/50 bg-white hover:bg-zinc-50/50'}
                            ${file ? 'border-black bg-zinc-50/50 shadow-inner' : ''}`}
                        onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input ref={fileInputRef} type="file" accept=".pdf" onChange={(e) => e.target.files?.[0] && validateAndSetFile(e.target.files[0])} className="hidden" />
                        <AnimatePresence mode="wait">
                            {!file ? (
                                <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
                                    <div className="p-6 bg-black rounded-2xl text-white shadow-2xl shadow-black/20 group-hover:scale-110 transition-transform"><Upload size={48} /></div>
                                    <div className="space-y-2">
                                        <h3 className="text-2xl font-black text-black uppercase tracking-tighter">Submit Brochure</h3>
                                        <p className="text-zinc-400 text-[10px] font-black uppercase tracking-[0.2em]">Drop PDF or click to browse</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div key="file" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} className="flex flex-col items-center gap-6">
                                    <div className="p-6 bg-zinc-100 text-black rounded-2xl"><FileText size={48} /></div>
                                    <div className="space-y-1">
                                        <h3 className="text-xl font-black text-black max-w-[300px] truncate uppercase tracking-tighter">{file.name}</h3>
                                        <p className="text-zinc-400 font-mono text-xs uppercase tracking-widest">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                    <button onClick={(e) => { e.stopPropagation(); setFile(null); }} className="text-[10px] font-black text-zinc-400 hover:text-black uppercase tracking-widest border-b border-zinc-200 hover:border-black transition-all">Detach File</button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleUpload} disabled={!file || uploading}
                        className={`w-full py-6 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] flex items-center justify-center gap-4 transition-all shadow-2xl shadow-black/15
                            ${!file || uploading ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed border border-zinc-200 shadow-none' : 'bg-black text-white hover:bg-zinc-800 hover:scale-[1.01] active:scale-[0.99]'}`}
                    >
                        {uploading ? <><Loader2 className="animate-spin" /> Deep Scanning Archive...</> : <>Synchronize with AI <ArrowRight size={18} /></>}
                    </button>
                </motion.div>

                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="bg-white border border-zinc-300 rounded-3xl p-10 h-full flex flex-col justify-between shadow-sm">
                    {result ? (
                        <div className="text-center py-6 flex flex-col items-center h-full justify-center">
                            <div className="w-24 h-24 bg-black text-white rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-black/20"><CheckCircle size={48} /></div>
                            <h2 className="text-3xl font-black text-black mb-4 uppercase tracking-tighter">Sync Successful</h2>
                            <p className="text-zinc-500 mb-10 max-w-sm font-medium leading-relaxed">{result.message}</p>
                            <div className="bg-white border border-zinc-100 rounded-2xl p-8 w-full mb-10 shadow-inner">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="text-left font-black text-[10px] text-zinc-400 uppercase tracking-widest">Assets Identified</div>
                                    <div className="text-5xl font-black text-black tracking-tighter">{result.products_found}</div>
                                </div>
                                <div className="h-2 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-black w-full" /></div>
                            </div>
                            <button onClick={onViewCatalog} className="px-12 py-5 bg-black text-white hover:bg-zinc-800 rounded-full font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-4 shadow-2xl shadow-black/20">Go to Dashboard <ArrowRight size={18} /></button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col">
                            <h3 className="text-2xl font-black text-black mb-10 uppercase tracking-tighter">Protocol Sequence</h3>
                            <ul className="space-y-10">
                                {[
                                    { title: "Ingestion", desc: "Submit your high-resolution PDF catalog archives." },
                                    { title: "Neuro Scanning", desc: "Proprietary AI pipelines analyze layouts and imagery." },
                                    { title: "Data Synthesis", desc: "Extraction of technical specs and product relationships." },
                                    { title: "Active Indexing", desc: "Instant deployment to the global searchable catalog." }
                                ].map((step, idx) => (
                                    <li key={idx} className="flex gap-6">
                                        <div className="flex flex-col items-center shrink-0">
                                            <div className="w-12 h-12 rounded-2xl bg-zinc-50 border border-zinc-100 text-black flex items-center justify-center text-xs font-black shadow-sm">{idx + 1}</div>
                                            {idx < 3 && <div className="w-px h-full bg-zinc-100 my-3" />}
                                        </div>
                                        <div>
                                            <h4 className="text-black font-black mb-1 uppercase text-[10px] tracking-[0.2em]">{step.title}</h4>
                                            <p className="text-zinc-400 text-xs leading-relaxed font-medium">{step.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </motion.div>
            </div>
        </div>
    );
}
