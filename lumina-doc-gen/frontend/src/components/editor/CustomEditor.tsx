"use client";

import React, { useState, useRef, useEffect } from 'react';
import { DndContext, DragOverlay, useDraggable, useDroppable, DragStartEvent, DragEndEvent, closestCenter, PointerSensor, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Type, Image as ImageIcon, Table as TableIcon, PenTool, BoxSelect, GripHorizontal, Trash2, Plus, GripVertical, Move, Scaling, ArrowLeft, LayoutDashboard } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { nanoid } from 'nanoid';

// Types
export type ElementType = 'text' | 'image' | 'table' | 'signature' | 'container';

export interface TableRow {
    id: string;
    items: string[]; // Cell values
}

export interface DocElement {
    id: string;
    type: ElementType;
    content: string; // For text
    position: { x: number; y: number };
    dimensions: { width: number; height: number };
    style?: React.CSSProperties;
    tableData?: { headers: string[]; columnWidths: number[]; rows: TableRow[] }; // For tables
}

// Draggable Sidebar Item
function SidebarItem({ type, icon: Icon, label }: { type: ElementType, icon: any, label: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id: `sidebar-${type}`,
        data: { type, isSidebar: true, label }
    });

    return (
        <div
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`flex items-center gap-3 p-4 rounded-xl border border-white/5 bg-[#1A1A1A] hover:bg-[#252525] cursor-grab active:cursor-grabbing text-gray-300 transition-all group ${isDragging ? 'opacity-50 ring-2 ring-indigo-500/50' : 'opacity-100'}`}
        >
            <div className="p-2 bg-black/40 rounded-lg group-hover:bg-indigo-500/20 group-hover:text-indigo-400 transition-colors">
                <Icon size={20} />
            </div>
            <span className="text-sm font-medium">{label}</span>
        </div>
    );
}

// Resizable & Draggable Canvas Element
interface DraggableElementProps {
    element: DocElement;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: (id: string) => void;
    onUpdate: (id: string, updates: Partial<DocElement>) => void;
}

function DraggableElement({ element, isSelected, onSelect, onDelete, onUpdate }: DraggableElementProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: element.id,
        data: { ...element, isSidebar: false }
    });

    const style: React.CSSProperties = {
        position: 'absolute',
        left: element.position.x,
        top: element.position.y,
        width: element.dimensions.width,
        height: element.dimensions.height,
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        zIndex: isDragging ? 100 : isSelected ? 50 : 1,
        ...element.style
    };

    // Resizing Logic for the Element itself
    const handleElementResizeStart = (e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = element.dimensions.width;
        const startHeight = element.dimensions.height;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const newWidth = Math.max(100, startWidth + (moveEvent.clientX - startX));
            const newHeight = Math.max(40, startHeight + (moveEvent.clientY - startY));
            onUpdate(element.id, { dimensions: { width: newWidth, height: newHeight } });
        };

        const onPointerUp = () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    };

    // --- Table Specific Logic ---

    // Helper to get safe widths
    const getColumnWidths = () => element.tableData?.columnWidths || element.tableData?.headers.map(() => 100) || [];

    // 1. Column Resizing
    const handleColumnResizeStart = (index: number, e: React.PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!element.tableData) return;

        const startX = e.clientX;
        const currentWidths = getColumnWidths();
        const startWidth = currentWidths[index] || 100;

        const onPointerMove = (moveEvent: PointerEvent) => {
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.max(40, startWidth + delta);

            if (element.tableData) {
                const newWidths = [...getColumnWidths()];
                newWidths[index] = newWidth;
                onUpdate(element.id, { tableData: { ...element.tableData, columnWidths: newWidths } });
            }
        };

        const onPointerUp = () => {
            document.removeEventListener('pointermove', onPointerMove);
            document.removeEventListener('pointerup', onPointerUp);
        };

        document.addEventListener('pointermove', onPointerMove);
        document.addEventListener('pointerup', onPointerUp);
    };

    const updateTableCell = (rowIndex: number, colIndex: number, value: string) => {
        if (!element.tableData) return;
        const newRows = [...element.tableData.rows];
        newRows[rowIndex].items[colIndex] = value;
        onUpdate(element.id, { tableData: { ...element.tableData, rows: newRows } });
    };

    const updateTableHeader = (colIndex: number, value: string) => {
        if (!element.tableData) return;
        const newHeaders = [...element.tableData.headers];
        newHeaders[colIndex] = value;
        onUpdate(element.id, { tableData: { ...element.tableData, headers: newHeaders } });
    };

    const addTableRow = () => {
        if (!element.tableData) return;
        const newRow: TableRow = { id: nanoid(), items: new Array(element.tableData.headers.length).fill('') };
        onUpdate(element.id, { tableData: { ...element.tableData, rows: [...element.tableData.rows, newRow] } });
    };

    const addTableColumn = () => {
        if (!element.tableData) return;
        const newHeaders = [...element.tableData.headers, 'New Column'];
        const newWidths = [...getColumnWidths(), 100];
        const newRows = element.tableData.rows.map(row => ({
            ...row,
            items: [...row.items, '']
        }));

        // Also expand table width to accommodate new column
        const newTableWidth = element.dimensions.width + 100;

        onUpdate(element.id, {
            dimensions: { ...element.dimensions, width: newTableWidth },
            tableData: {
                ...element.tableData,
                headers: newHeaders,
                columnWidths: newWidths,
                rows: newRows
            }
        });
    };

    const removeTableColumn = (colIndex: number) => {
        if (!element.tableData || element.tableData.headers.length <= 1) return;

        const newHeaders = element.tableData.headers.filter((_, i) => i !== colIndex);
        const newWidths = getColumnWidths().filter((_, i) => i !== colIndex);
        const newRows = element.tableData.rows.map(row => ({
            ...row,
            items: row.items.filter((_, i) => i !== colIndex)
        }));

        onUpdate(element.id, {
            tableData: {
                ...element.tableData,
                headers: newHeaders,
                columnWidths: newWidths,
                rows: newRows
            }
        });
    }


    return (
        <div
            ref={setNodeRef}
            style={style}
            onClick={(e) => { e.stopPropagation(); onSelect(); }}
            className={`group absolute transition-shadow bg-transparent ${isSelected ? 'ring-2 ring-indigo-500 z-50' : 'hover:ring-1 hover:ring-indigo-300/50'}`}
        >
            {/* Controls (Visible on Hover/Select) */}
            <div
                className={`absolute -top-10 left-0 right-0 flex justify-center items-center gap-1 transition-opacity duration-200 ${isSelected || isDragging ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} pointer-events-none`}
            >
                <div className="bg-[#1A1A1A] text-white flex items-center rounded-lg shadow-xl border border-white/10 overflow-hidden pointer-events-auto">
                    {/* Drag Handle */}
                    <div {...listeners} {...attributes} className="cursor-grab active:cursor-grabbing p-2 hover:bg-white/10 border-r border-white/10" title="Drag to move">
                        <Move size={14} />
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onDelete(element.id); }}
                        className="p-2 hover:bg-red-500/20 hover:text-red-400 text-gray-400 transition-colors"
                        title="Delete"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {/* Resize Handle (Bottom Right) */}
            {isSelected && (
                <div
                    onPointerDown={handleElementResizeStart}
                    className="absolute -bottom-1.5 -right-1.5 w-4 h-4 bg-white border-2 border-indigo-500 rounded-full cursor-se-resize z-50 shadow-sm hover:scale-125 transition-transform"
                />
            )}

            {/* Content Render */}
            <div className="w-full h-full overflow-hidden">
                {element.type === 'text' && (
                    <div
                        contentEditable
                        suppressContentEditableWarning
                        onBlur={(e) => onUpdate(element.id, { content: e.currentTarget.innerText })}
                        className="w-full h-full outline-none whitespace-pre-wrap leading-relaxed px-4 py-2 hover:bg-gray-50/50 rounded-lg transition-colors empty:before:content-[attr(data-placeholder)] empty:before:text-gray-400"
                        style={{ color: 'inherit' }}
                        data-placeholder="Type something..."
                    >
                        {element.content || <span className="opacity-50">Type something...</span>}
                    </div>
                )}

                {element.type === 'image' && (
                    <div className="w-full h-full bg-gray-50 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200 rounded-xl hover:border-indigo-300 hover:bg-indigo-50/10 transition-colors">
                        <ImageIcon size={32} strokeWidth={1.5} />
                        <span className="text-xs font-medium mt-3">Upload or Drop Image</span>
                    </div>
                )}

                {element.type === 'container' && (
                    <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center bg-gray-50/50">
                        <div className="text-gray-400 text-sm flex items-center gap-2">
                            <Plus size={16} /> Container
                        </div>
                    </div>
                )}

                {element.type === 'table' && element.tableData && (
                    <div className="w-full h-full bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm flex flex-col relative">
                        {/* Table Header with Resizers */}
                        <div className="flex bg-gray-50 border-b border-gray-200 overflow-x-auto scrollbar-hide">
                            {element.tableData.headers.map((h, i) => (
                                <div
                                    key={i}
                                    className="relative flex-shrink-0 flex items-center border-r border-gray-200 last:border-0 group/header"
                                    style={{ width: (getColumnWidths()[i] || 100), minWidth: 40 }}
                                >
                                    <input
                                        value={h}
                                        onChange={(e) => updateTableHeader(i, e.target.value)}
                                        className="w-full bg-transparent px-3 py-2 text-xs font-bold text-gray-700 uppercase tracking-wider outline-none focus:bg-white"
                                    />
                                    {/* Column Delete Action (Hover) */}
                                    <div
                                        onClick={() => removeTableColumn(i)}
                                        className="absolute right-2 top-1 opacity-0 group-hover/header:opacity-100 cursor-pointer text-gray-300 hover:text-red-500"
                                    >
                                        &times;
                                    </div>

                                    {/* Column Resizer */}
                                    <div
                                        onPointerDown={(e) => handleColumnResizeStart(i, e)}
                                        className="absolute right-0 top-0 bottom-0 w-1 bg-transparent hover:bg-indigo-500 cursor-col-resize z-10"
                                    />
                                </div>
                            ))}
                            {/* Add Column Button */}
                            <button
                                onClick={addTableColumn}
                                className="flex-shrink-0 w-8 flex items-center justify-center bg-gray-50 border-l border-gray-200 hover:bg-indigo-50 text-gray-400 hover:text-indigo-500 transition-colors"
                                title="Add Column"
                            >
                                <Plus size={16} />
                            </button>
                        </div>

                        {/* Table Rows */}
                        <div className="flex-1 overflow-auto">
                            {element.tableData.rows.map((row, rowIndex) => (
                                <div key={row.id} className="flex border-b border-gray-100 last:border-0 hover:bg-gray-50/50 w-full">
                                    {row.items.map((item, colIndex) => (
                                        <div
                                            key={colIndex}
                                            className="border-r border-gray-100 relative flex-shrink-0"
                                            style={{ width: (getColumnWidths()[colIndex] || 100), minWidth: 40 }}
                                        >
                                            <input
                                                value={item}
                                                onChange={(e) => updateTableCell(rowIndex, colIndex, e.target.value)}
                                                className="w-full px-3 py-2.5 bg-transparent outline-none focus:bg-indigo-50/20 transition-colors"
                                                style={{
                                                    color: 'inherit',
                                                    fontFamily: 'inherit',
                                                    fontSize: 'inherit',
                                                    fontWeight: 'inherit'
                                                }}
                                                placeholder="..."
                                            />
                                        </div>
                                    ))}
                                </div>
                            ))}
                            <button
                                onClick={addTableRow}
                                className="w-full py-2 text-xs text-indigo-500 hover:bg-indigo-50 border-t border-dashed border-indigo-200 flex items-center justify-center gap-1 transition-colors sticky bottom-0 bg-white/90 backdrop-blur"
                            >
                                <Plus size={12} /> Add Row
                            </button>
                        </div>
                    </div>
                )}

                {element.type === 'signature' && (
                    <div className="w-full h-full flex flex-col justify-end pb-2">
                        <div className="h-px bg-gray-800 mb-2 mx-4"></div>
                        <div className="text-xs text-center text-gray-500 uppercase tracking-widest font-bold">Authorized Signature</div>
                    </div>
                )}
            </div>
        </div>
    );
}

// --- Properties Panel Component ---
function PropertiesPanel({ element, onUpdate }: { element: DocElement | null, onUpdate: (id: string, updates: Partial<DocElement>) => void }) {
    if (!element) {
        return (
            <aside className="w-80 border-l border-white/5 bg-[#0A0A0A] p-6 hidden lg:block overflow-y-auto">
                <div className="flex flex-col items-center justify-center h-64 text-center text-gray-500 space-y-4">
                    <BoxSelect size={48} className="opacity-20" />
                    <p className="text-sm">Select an element to edit its properties</p>
                </div>
            </aside>
        );
    }

    const handleChange = (key: keyof React.CSSProperties, value: any) => {
        onUpdate(element.id, {
            style: { ...element.style, [key]: value }
        });
    };

    return (
        <aside className="w-80 border-l border-white/5 bg-[#0A0A0A] p-6 hidden lg:block overflow-y-auto">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-6 border-b border-white/10 pb-2">
                {element.type === 'image' ? 'Image Settings' : element.type === 'table' ? 'Table Settings' : 'Text Settings'}
            </h3>

            <div className="space-y-6">
                {/* Dimensions (Read Only / Manual Input) */}
                <div className="space-y-2">
                    <label className="text-xs text-gray-400 font-medium">Dimensions</label>
                    <div className="grid grid-cols-2 gap-2">
                        <div className="bg-[#111] border border-white/10 rounded-lg p-2.5 flex items-center justify-between">
                            <span className="text-xs text-gray-500">W</span>
                            <span className="text-xs font-mono text-gray-300">{Math.round(element.dimensions.width)}</span>
                        </div>
                        <div className="bg-[#111] border border-white/10 rounded-lg p-2.5 flex items-center justify-between">
                            <span className="text-xs text-gray-500">H</span>
                            <span className="text-xs font-mono text-gray-300">{Math.round(element.dimensions.height)}</span>
                        </div>
                    </div>
                </div>

                {/* Typography Settings (Text & Table) */}
                {(element.type === 'text' || element.type === 'table') && (
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-medium">Font Family</label>
                            <select
                                value={element.style?.fontFamily || 'Inter'}
                                onChange={(e) => handleChange('fontFamily', e.target.value)}
                                className="w-full bg-[#111] border border-white/10 text-gray-300 text-sm rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-colors"
                            >
                                <option value="Inter">Inter (Sans-Serif)</option>
                                <option value="Merriweather">Merriweather (Serif)</option>
                                <option value="'JetBrains Mono'">JetBrains Mono (Code)</option>
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-medium">Size (px)</label>
                                <input
                                    type="number"
                                    value={parseInt(element.style?.fontSize as string) || 14}
                                    onChange={(e) => handleChange('fontSize', `${e.target.value}px`)}
                                    className="w-full bg-[#111] border border-white/10 text-gray-300 text-sm rounded-lg p-2.5 outline-none focus:border-indigo-500 transition-colors"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-gray-400 font-medium">Color</label>
                                <div className="h-[42px] bg-[#111] border border-white/10 rounded-lg p-1 flex items-center">
                                    <input
                                        type="color"
                                        value={element.style?.color as string || '#000000'}
                                        onChange={(e) => handleChange('color', e.target.value)}
                                        className="w-full h-full cursor-pointer bg-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs text-gray-400 font-medium">Background</label>
                            <div className="flex items-center gap-2">
                                <div className="h-[42px] flex-1 bg-[#111] border border-white/10 rounded-lg p-1 flex items-center">
                                    <input
                                        type="color"
                                        value={element.style?.backgroundColor as string || '#ffffff'}
                                        onChange={(e) => handleChange('backgroundColor', e.target.value)}
                                        className="w-full h-full cursor-pointer bg-transparent"
                                    />
                                </div>
                                <button
                                    onClick={() => handleChange('backgroundColor', 'transparent')}
                                    className="px-3 py-2.5 bg-[#111] border border-white/10 rounded-lg text-xs text-gray-400 hover:text-white hover:bg-white/5 transition-colors"
                                    title="Transparent"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Table Specifics */}
                {element.type === 'table' && (
                    <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 space-y-2">
                        <h4 className="text-xs font-bold text-indigo-400 uppercase">Table Tips</h4>
                        <ul className="text-xs text-indigo-300/80 space-y-1 list-disc pl-4">
                            <li>Click headers to rename</li>
                            <li>Use handles to resize columns</li>
                            <li>Drag right edge to widen table</li>
                        </ul>
                    </div>
                )}
            </div>
        </aside>
    );
}

// Canvas Component
function Canvas({ elements, onDrop, activeId, onDeleteElement, onUpdateElement, setElements, onSelect, selectedId }: {
    elements: DocElement[],
    onDrop: (e: DragEndEvent) => void,
    activeId: string | null,
    onDeleteElement: (id: string) => void,
    onUpdateElement: (id: string, updates: Partial<DocElement>) => void,
    setElements: React.Dispatch<React.SetStateAction<DocElement[]>>,
    onSelect: (id: string | null) => void,
    selectedId: string | null
}) {
    const { setNodeRef, isOver } = useDroppable({
        id: 'canvas',
    });

    return (
        <div
            ref={setNodeRef}
            onClick={() => onSelect(null)}
            className="flex-1 bg-[#121212] p-8 overflow-auto flex justify-center min-h-[calc(100vh-64px)] relative"
        >
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-20 pointer-events-none"
                style={{
                    backgroundImage: 'radial-gradient(#333 1px, transparent 1px)',
                    backgroundSize: '24px 24px'
                }}
            />

            <div
                className={`w-[210mm] min-h-[297mm] bg-white shadow-2xl relative transition-all duration-300 ${isOver ? 'ring-4 ring-indigo-500/20 scale-[1.01]' : ''}`}
            >
                {/* Empty State / Drop Hints */}
                {elements.length === 0 && (
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none opacity-40">
                        <div className="w-96 border-2 border-dashed border-gray-300 rounded-3xl p-12 flex flex-col items-center text-center">
                            <BoxSelect size={48} className="text-gray-300 mb-4" />
                            <h3 className="text-xl font-medium text-gray-400 mb-2">Drag elements here</h3>
                            <p className="text-sm text-gray-300">Start building your custom invoice by dragging items from the sidebar.</p>
                        </div>
                    </div>
                )}

                {elements.map((el) => (
                    <DraggableElement
                        key={el.id}
                        element={el}
                        isSelected={selectedId === el.id}
                        onSelect={() => onSelect(el.id)}
                        onDelete={onDeleteElement}
                        onUpdate={onUpdateElement}
                    />
                ))}
            </div>
        </div>
    );
}

export default function CustomEditor({ initialType = 'custom' }: { initialType?: string }) {
    const router = useRouter();
    const [elements, setElements] = useState<DocElement[]>([]);
    const [activeDragData, setActiveDragData] = useState<any>(null);
    const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        })
    );

    if (!isMounted) return null;

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        setActiveDragData(active.data.current);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over, delta } = event;
        setActiveDragData(null);

        if (!over) return;

        // 1. Handling New Item Drop (from Sidebar)
        if (active.data.current?.isSidebar) {
            const type = active.data.current.type as ElementType;

            // Create default data for the new element
            const newElement: DocElement = {
                id: nanoid(),
                type,
                content: type === 'text' ? 'Double click to edit' : '',
                position: {
                    x: 50 + (elements.length * 20),
                    y: 100 + (elements.length * 40)
                },
                dimensions: {
                    width: type === 'table' ? 600 : type === 'container' ? 500 : type === 'image' ? 300 : type === 'signature' ? 250 : 300,
                    height: type === 'table' ? 300 : type === 'container' ? 150 : type === 'image' ? 200 : type === 'signature' ? 100 : 80
                },
                style: {
                    color: '#000000', // Default black text
                    fontSize: '14px',
                    fontFamily: 'Inter',
                    backgroundColor: 'transparent'
                },
                tableData: type === 'table' ? {
                    headers: ['Item', 'Qty', 'Rate', 'Amount'],
                    columnWidths: [150, 80, 100, 120],
                    rows: [
                        { id: '1', items: ['', '', '', ''] },
                        { id: '2', items: ['', '', '', ''] }
                    ]
                } : undefined
            };
            setElements([...elements, newElement]);
            setSelectedElementId(newElement.id); // Auto-select new item
            return;
        }

        // 2. Handling Existing Item Move
        const elementId = active.id as string;
        setElements(prev => prev.map(el => {
            if (el.id === elementId) {
                return {
                    ...el,
                    position: {
                        x: el.position.x + delta.x,
                        y: el.position.y + delta.y,
                    }
                };
            }
            return el;
        }));
    };

    const handleDelete = (id: string) => {
        setElements(prev => prev.filter(el => el.id !== id));
        if (selectedElementId === id) setSelectedElementId(null);
    };

    const handleUpdate = (id: string, updates: Partial<DocElement>) => {
        setElements(prev => prev.map(el => el.id === id ? { ...el, ...updates } : el));
    };

    const selectedElement = elements.find(el => el.id === selectedElementId) || null;

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <div className="h-screen flex flex-col bg-[#050505] text-white overflow-hidden font-sans">
                {/* Header */}
                <header className="h-16 border-b border-white/5 flex items-center justify-between px-6 bg-[#0A0A0A]">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => router.push('/')}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                            title="Dashboard"
                        >
                            <LayoutDashboard size={20} />
                        </button>
                        <div className="h-6 w-px bg-white/10"></div>
                        <button
                            onClick={() => router.back()}
                            className="p-2 hover:bg-white/5 rounded-full transition-colors text-gray-400 hover:text-white"
                            title="Back"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <div className="flex items-center gap-3">
                            <span className="w-px h-6 bg-white/10"></span>
                            <div className="flex flex-col">
                                <h1 className="text-sm font-semibold text-white tracking-wide">Custom Invoice</h1>
                                <span className="text-[10px] text-gray-500 uppercase tracking-widest font-medium">Draft Mode</span>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Sidebar */}
                    <aside className="w-72 border-r border-white/5 bg-[#0A0A0A] flex flex-col">
                        <div className="p-6">
                            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Components</h3>
                            <div className="space-y-3">
                                <SidebarItem type="text" icon={Type} label="Text Block" />
                                <SidebarItem type="container" icon={BoxSelect} label="Container" />
                                <SidebarItem type="image" icon={ImageIcon} label="Image / Logo" />
                                <SidebarItem type="table" icon={TableIcon} label="Data Table" />
                                <SidebarItem type="signature" icon={PenTool} label="Signature" />
                            </div>
                        </div>
                    </aside>

                    {/* Canvas Area */}
                    <Canvas
                        elements={elements}
                        onDrop={handleDragEnd}
                        activeId={activeDragData?.id}
                        onDeleteElement={handleDelete}
                        onUpdateElement={handleUpdate}
                        setElements={setElements}
                        onSelect={setSelectedElementId}
                        selectedId={selectedElementId}
                    />

                    {/* Properties Panel (Right) */}
                    <PropertiesPanel element={selectedElement} onUpdate={handleUpdate} />
                </div>
            </div>

            <DragOverlay dropAnimation={null}>
                {activeDragData ? (
                    <div className="flex items-center gap-3 p-4 bg-[#1A1A1A] rounded-xl border border-indigo-500 shadow-2xl shadow-indigo-500/20 text-white cursor-grabbing w-64">
                        <div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400">
                            {activeDragData.type === 'image' ? <ImageIcon size={20} /> :
                                activeDragData.type === 'table' ? <TableIcon size={20} /> :
                                    activeDragData.type === 'signature' ? <PenTool size={20} /> :
                                        <Type size={20} />}
                        </div>
                        <span className="font-medium text-sm">{activeDragData.label || 'Element'}</span>
                    </div>
                ) : null}
            </DragOverlay>
        </DndContext>
    );
}
