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

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            validateAndSetFile(e.target.files[0]);
        }
    };

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
        e.preventDefault();
        e.stopPropagation();
        if (e.type === "dragenter" || e.type === "dragover") {
            setDragActive(true);
        } else if (e.type === "dragleave") {
            setDragActive(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            validateAndSetFile(e.dataTransfer.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setError(null);
        setResult(null);

        try {
            const data = await api.uploadBrochure(file);
            setResult(data);
            setFile(null); // Clear file after successful upload
        } catch (err) {
            setError("Upload failed. Please try again.");
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400 mb-4">
                    Upload Brochure
                </h1>
                <p className="text-slate-400 text-lg max-w-2xl mx-auto">
                    Upload your lighting product catalogs (PDF) and let our AI automatically extract, categorize, and index the products for you.
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                {/* Upload Zone */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5 }}
                    className="flex flex-col gap-6"
                >
                    <div
                        className={`
                            relative border-2 border-dashed rounded-3xl p-10 flex flex-col items-center justify-center text-center transition-all duration-300 min-h-[300px]
                            ${dragActive
                                ? 'border-blue-500 bg-blue-500/10'
                                : 'border-slate-700 hover:border-slate-500 bg-slate-900/50'
                            }
                            ${file ? 'border-emerald-500/50 bg-emerald-500/5' : ''}
                        `}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />

                        <AnimatePresence mode="wait">
                            {!file ? (
                                <motion.div
                                    key="empty"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex flex-col items-center gap-4 cursor-pointer"
                                >
                                    <div className="p-4 bg-slate-800 rounded-full text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                                        <Upload size={40} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white">
                                        Drag & Drop PDF here
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                        or click to browse from files
                                    </p>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="file"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className="flex flex-col items-center gap-4"
                                >
                                    <div className="p-4 bg-emerald-500/20 text-emerald-400 rounded-full mb-2">
                                        <FileText size={40} />
                                    </div>
                                    <h3 className="text-xl font-semibold text-white max-w-[250px] truncate">
                                        {file.name}
                                    </h3>
                                    <p className="text-slate-400 text-sm">
                                        {(file.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setFile(null);
                                        }}
                                        className="text-xs text-red-400 hover:text-red-300 underline mt-2"
                                    >
                                        Remove file
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>

                    <button
                        onClick={handleUpload}
                        disabled={!file || uploading}
                        className={`
                            w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg
                            ${!file || uploading
                                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/25 hover:scale-[1.02] active:scale-[0.98]'
                            }
                        `}
                    >
                        {uploading ? (
                            <>
                                <Loader2 className="animate-spin" />
                                Processing with AI...
                            </>
                        ) : (
                            <>
                                Upload & Analyze
                                <ArrowRight size={20} />
                            </>
                        )}
                    </button>

                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 flex items-center gap-3 text-red-200"
                        >
                            <AlertCircle size={20} className="text-red-400 shrink-0" />
                            <p className="text-sm">{error}</p>
                        </motion.div>
                    )}
                </motion.div>

                {/* Results Preview / Instructions */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.5, delay: 0.2 }}
                    className="bg-slate-900/40 border border-white/5 rounded-3xl p-8 backdrop-blur-sm h-full"
                >
                    {result ? (
                        <div className="flex flex-col items-center justify-center h-full text-center py-6">
                            <div className="w-20 h-20 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle size={40} />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Processing Complete!</h2>
                            <p className="text-slate-300 mb-8 max-w-xs">
                                {result.message}
                            </p>

                            <div className="bg-white/5 rounded-2xl p-6 w-full mb-8">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-slate-400 text-sm">Products Found</span>
                                    <span className="text-white text-xl font-mono font-bold">{result.products_found}</span>
                                </div>
                                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                                    <div className="h-full bg-emerald-500 w-full" />
                                </div>
                            </div>

                            <button
                                onClick={onViewCatalog}
                                className="px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-full font-medium transition-all flex items-center gap-2"
                            >
                                View in Catalog
                                <ArrowRight size={16} />
                            </button>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col justify-center">
                            <h3 className="text-xl font-semibold text-white mb-6">How it works</h3>
                            <ul className="space-y-6">
                                {[
                                    { title: "Upload PDF", desc: "Drag and drop any lighting product brochure or catalog." },
                                    { title: "AI Analysis", desc: "Our advanced Gemini AI scans the document to identify products." },
                                    { title: "Extraction", desc: "Technical specs, images, and descriptions are automatically extracted." },
                                    { title: "Indexing", desc: "Products are instantly searchable in the main catalog." }
                                ].map((step, idx) => (
                                    <li key={idx} className="flex gap-4">
                                        <div className="flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center text-sm font-bold border border-blue-500/30">
                                                {idx + 1}
                                            </div>
                                            {idx < 3 && <div className="w-[2px] h-full bg-slate-800 my-2" />}
                                        </div>
                                        <div>
                                            <h4 className="text-white font-medium mb-1">{step.title}</h4>
                                            <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
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
