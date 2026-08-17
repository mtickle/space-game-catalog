import React, { useState, useEffect } from 'react';
import { Database, Globe, Moon, Building, Bug, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';

const categories = [
    { id: 'systems', label: 'Star Systems', icon: Database },
    { id: 'planets', label: 'Planets', icon: Globe },
    { id: 'moons', label: 'Moons', icon: Moon },
    { id: 'settlements', label: 'Settlements', icon: Building },
    { id: 'species', label: 'Flora & Fauna', icon: Bug },
    { id: 'factions', label: 'Factions', icon: Database }
];

// --- COLUMN CONFIGURATION ---
// Define exactly which keys you want to display for each category, and in what order.
// Use the exact property names returned by your Express API (which likely match your Postgres columns).
const categoryColumns = {
    systems: ['name', 'temperature', 'description', 'faction_id'],
    planets: ['id', 'system_id', 'name', 'type', 'atmosphere', 'temperature'],
    moons: ['id', 'planet_id', 'name', 'type', 'radius'],
    settlements: ['id', 'planet_id', 'name', 'population', 'faction'],
    species: ['id', 'name', 'diet', 'aggression_level']
};

const GalacticCatalog = () => {
    const [activeCategory, setActiveCategory] = useState('systems');
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
    const [loading, setLoading] = useState(true);

    const fetchData = async (category, page = 1) => {
        setLoading(true);
        try {
            let apiKey = '';
            let baseUrl = '';
            if (typeof import.meta !== 'undefined' && import.meta.env) {
                apiKey = import.meta.env.VITE_API_KEY || '';
                baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
            }

            const response = await fetch(`${baseUrl}/api/v1/catalog/${category}?page=${page}&limit=25`, {
                headers: { 'x-api-key': apiKey }
            });

            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();
            setData(json.data || []);
            setMeta(json.meta || { currentPage: 1, totalPages: 1, totalRecords: 0 });
        } catch (error) {
            console.error("Failed to fetch catalog data:", error);
            setData([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData(activeCategory, 1);
    }, [activeCategory]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.totalPages) {
            fetchData(activeCategory, newPage);
        }
    };

    // --- SMART COLUMN SELECTION ---
    // 1. Check if the active category has a defined config.
    // 2. If yes, use the config.
    // 3. If no, fall back to auto-generating from the first row of data.
    const columns = categoryColumns[activeCategory]
        ? categoryColumns[activeCategory]
        : (data.length > 0 ? Object.keys(data[0]) : []);

    return (
        <div className="flex flex-col h-screen bg-[#0a0a1a] text-green-400 font-mono">
            {/* HEADER */}
            <div className="flex-none p-6 border-b border-green-500/30 bg-black/40">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold tracking-widest" style={{ textShadow: '0 0 10px rgba(52, 211, 153, 0.5)' }}>
                            GALACTIC ARCHIVE
                        </h1>
                        <p className="text-sm text-green-600 mt-1">Universal Cartography Database</p>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-cyan-400">{meta.totalRecords.toLocaleString()}</div>
                        <div className="text-xs text-cyan-600 uppercase tracking-widest">Total Records</div>
                    </div>
                </div>

                {/* CATEGORY TABS */}
                <div className="flex gap-4 mt-8 overflow-x-auto pb-2 custom-scrollbar">
                    {categories.map((cat) => {
                        const Icon = cat.icon;
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`flex items-center gap-2 px-4 py-2 rounded border transition-all duration-200 ${isActive
                                    ? 'bg-green-500/20 border-green-400 text-green-300 shadow-[0_0_15px_rgba(74,222,128,0.2)]'
                                    : 'bg-transparent border-green-900/50 text-green-700 hover:border-green-500/50 hover:text-green-500'
                                    }`}
                            >
                                <Icon size={18} />
                                <span className="font-bold uppercase tracking-wider text-sm">{cat.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* DATA TABLE AREA */}
            <div className="flex-1 overflow-hidden p-6 relative">
                {loading ? (
                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0a0a1a]/80 z-10">
                        <Loader2 className="w-12 h-12 animate-spin text-green-500 mb-4" />
                        <span className="animate-pulse tracking-widest">QUERYING DATABANKS...</span>
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex h-full items-center justify-center text-green-700 border border-green-900/30 rounded-lg border-dashed">
                        NO RECORDS FOUND IN THIS SECTOR
                    </div>
                ) : (
                    <div className="h-full overflow-auto border border-green-500/20 rounded-lg bg-black/20 custom-scrollbar">
                        <table className="w-full text-left text-sm whitespace-nowrap">
                            <thead className="sticky top-0 bg-gray-900 text-green-500 z-10 border-b border-green-500/30">
                                <tr>
                                    {columns.map((col) => (
                                        <th key={col} className="px-4 py-3 uppercase tracking-wider font-bold text-xs">
                                            {/* Formats snake_case and camelCase to readable headers */}
                                            {col.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-900/30 text-gray-300">
                                {data.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-green-900/20 transition-colors">
                                        {columns.map((col) => {
                                            // Safely fetch the value, even if it's deeply nested (optional chaining behavior)
                                            let cellValue = row[col];

                                            // Handle booleans, nulls, and objects so React doesn't crash
                                            if (typeof cellValue === 'boolean') cellValue = cellValue ? 'TRUE' : 'FALSE';
                                            if (cellValue === null || cellValue === undefined) cellValue = '—';
                                            if (typeof cellValue === 'object') cellValue = JSON.stringify(cellValue);

                                            return (
                                                <td key={`${rowIndex}-${col}`} className="px-4 py-3 max-w-[200px] truncate text-xs" title={String(cellValue)}>
                                                    {String(cellValue)}
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* PAGINATION FOOTER */}
            <div className="flex-none p-4 border-t border-green-500/30 bg-black/60 flex items-center justify-between">
                <div className="text-xs text-green-600">
                    PAGE <span className="text-green-400 font-bold">{meta.currentPage}</span> OF <span className="text-green-400 font-bold">{meta.totalPages}</span>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => handlePageChange(meta.currentPage - 1)}
                        disabled={meta.currentPage === 1 || loading}
                        className="p-2 border border-green-500/30 rounded text-green-500 hover:bg-green-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronLeft size={18} />
                    </button>
                    <button
                        onClick={() => handlePageChange(meta.currentPage + 1)}
                        disabled={meta.currentPage === meta.totalPages || loading}
                        className="p-2 border border-green-500/30 rounded text-green-500 hover:bg-green-500/20 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                    >
                        <ChevronRight size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default GalacticCatalog;