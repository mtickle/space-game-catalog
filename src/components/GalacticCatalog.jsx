import React, { useState, useEffect } from 'react';
import { Database, Globe, Moon, Building, Bug, ChevronLeft, ChevronRight, Loader2, Info, X, Star, Map, AlignLeft, Flag } from 'lucide-react';

const categories = [
    { id: 'systems', label: 'Star Systems', icon: Database },
    { id: 'planets', label: 'Planets', icon: Globe },
    { id: 'moons', label: 'Moons', icon: Moon },
    { id: 'settlements', label: 'Settlements', icon: Building },
    { id: 'species', label: 'Flora & Fauna', icon: Bug },
    { id: 'factions', label: 'Factions', icon: Database }
];

const categoryColumns = {
    systems: ['name', 'description', 'faction_name', 'total_planets', 'total_moons', 'total_settlements'],
    planets: ['name', 'planet_type', 'weather', 'temperature', 'toxicity', 'radiation', 'economy_name', 'industry_name', 'atmosphere_makeup'],
    moons: ['id', 'planet_id', 'name', 'type', 'radius'],
    settlements: ['id', 'planet_id', 'name', 'population', 'faction'],
    species: ['id', 'name', 'diet', 'aggression_level']
};

const GalacticCatalog = () => {
    const [activeCategory, setActiveCategory] = useState('systems');
    const [data, setData] = useState([]);
    const [meta, setMeta] = useState({ currentPage: 1, totalPages: 1, totalRecords: 0 });
    const [loading, setLoading] = useState(true);

    // NEW: State to track the currently selected row for the modal
    const [selectedRecord, setSelectedRecord] = useState(null);

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
        // Reset the modal if the user changes tabs
        setSelectedRecord(null);
    }, [activeCategory]);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= meta.totalPages) {
            fetchData(activeCategory, newPage);
        }
    };

    // --- Helper Sub-Component for expandable sections ---
    const InfoSection = ({ title, icon: Icon, children, defaultOpen = false }) => {
        const [isOpen, setIsOpen] = useState(defaultOpen);

        return (
            <div className="mb-2 bg-black/20 rounded border border-cyan-900/30 overflow-hidden">
                <button
                    className="w-full flex items-center justify-between p-3 font-bold text-cyan-500 hover:text-cyan-300 hover:bg-cyan-900/20 transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                >
                    <div className="flex items-center gap-2">
                        <Icon size={16} />
                        <span className="tracking-widest text-sm">{title}</span>
                    </div>
                    <span className="text-cyan-700">{isOpen ? '▼' : '▶'}</span>
                </button>
                {isOpen && (
                    <div className="p-4 border-t border-cyan-900/30 text-sm text-gray-300 bg-black/40">
                        {children}
                    </div>
                )}
            </div>
        );
    };

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
                                            {col.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim()}
                                        </th>
                                    ))}
                                    {/* NEW: Actions Column Header */}
                                    <th className="px-4 py-3 uppercase tracking-wider font-bold text-xs text-right">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-green-900/30 text-gray-300">
                                {data.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-green-900/20 transition-colors">
                                        {columns.map((col) => {
                                            let cellValue = row[col];
                                            if (typeof cellValue === 'boolean') cellValue = cellValue ? 'TRUE' : 'FALSE';
                                            if (cellValue === null || cellValue === undefined) cellValue = '—';
                                            if (typeof cellValue === 'object') cellValue = JSON.stringify(cellValue);

                                            return (
                                                <td key={`${rowIndex}-${col}`} className="px-4 py-3 max-w-[200px] truncate text-md" title={String(cellValue)}>
                                                    {String(cellValue)}
                                                </td>
                                            );
                                        })}
                                        {/* NEW: Details Button Cell */}
                                        <td className="px-4 py-3 text-right">
                                            <button
                                                onClick={() => setSelectedRecord(row)}
                                                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold tracking-wider border border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/20 hover:border-cyan-400 rounded transition-all"
                                            >
                                                <Info size={14} /> DETAILS
                                            </button>
                                        </td>
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

            {/* NEW: DETAILS MODAL OVERLAY */}
            {/* UPGRADED: DETAILS MODAL OVERLAY */}
            {selectedRecord && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
                    <div className="bg-[#090914] border border-cyan-500/50 rounded-lg shadow-[0_0_40px_rgba(34,211,238,0.1)] w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">

                        {/* Modal Header - Darker Bar with Icon */}
                        <div className="flex justify-between items-start p-6 bg-gradient-to-r from-cyan-950/80 to-transparent border-b border-cyan-500/30">
                            <div className="flex gap-4 items-center">
                                <div className="p-3 bg-cyan-900/30 rounded-lg border border-cyan-500/30 text-cyan-400">
                                    {activeCategory === 'systems' ? <Star size={28} /> : <Database size={28} />}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold tracking-widest text-white uppercase">
                                        {selectedRecord.name || selectedRecord.planetName || 'UNKNOWN RECORD'}
                                    </h2>
                                    <p className="text-xs text-cyan-500 uppercase tracking-widest mt-1 flex items-center gap-2">
                                        <Map size={12} /> ID: {selectedRecord.id || selectedRecord.star_id}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => setSelectedRecord(null)}
                                className="p-2 text-cyan-600 hover:text-cyan-400 hover:bg-cyan-900/50 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        {/* Modal Body - Expandable Rows */}
                        <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-transparent to-cyan-950/10">

                            {activeCategory === 'systems' ? (
                                <div className="space-y-1">
                                    <InfoSection title="SYSTEM OVERVIEW" icon={AlignLeft} defaultOpen={true}>
                                        <p className="italic text-cyan-100/70 leading-relaxed">
                                            "{selectedRecord.description || 'No charting data available for this sector.'}"
                                        </p>
                                        <div className="mt-4 pt-4 border-t border-cyan-900/50 grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="block text-xs text-cyan-600 mb-1 uppercase">Controlling Faction</span>
                                                <span className="flex items-center gap-2 text-white">
                                                    {selectedRecord.faction_name || 'Uncharted'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-cyan-600 mb-1 uppercase">Temperature</span>
                                                <span className="text-white">{selectedRecord.temperature || 'Unknown'}</span>
                                            </div>
                                        </div>
                                        <div className="mt-4 pt-4 border-t border-cyan-900/50 grid grid-cols-2 gap-4">
                                            <div>
                                                <span className="block text-xs text-cyan-600 mb-1 uppercase">Station Name</span>
                                                <span className="flex items-center gap-2 text-white">
                                                    {selectedRecord.station_name || 'Uncharted'}
                                                </span>
                                            </div>
                                            <div>
                                                <span className="block text-xs text-cyan-600 mb-1 uppercase">Station Type</span>
                                                <span className="text-white">{selectedRecord.station_type || 'Unknown'}</span>
                                            </div>
                                        </div>
                                    </InfoSection>

                                    <InfoSection title="IN THIS SYSTEM" icon={Globe} defaultOpen={true}>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="bg-black/50 p-3 rounded border border-cyan-900/30">
                                                <Globe size={20} className="mx-auto mb-2 text-green-400" />
                                                <div className="text-2xl font-bold text-white">{selectedRecord.total_planets || 0}</div>
                                                <div className="text-[10px] text-cyan-600 uppercase mt-1">Planets</div>
                                            </div>
                                            <div className="bg-black/50 p-3 rounded border border-cyan-900/30">
                                                <Moon size={20} className="mx-auto mb-2 text-gray-400" />
                                                <div className="text-2xl font-bold text-white">{selectedRecord.total_moons || 0}</div>
                                                <div className="text-[10px] text-cyan-600 uppercase mt-1">Moons</div>
                                            </div>
                                            <div className="bg-black/50 p-3 rounded border border-cyan-900/30">
                                                <Building size={20} className="mx-auto mb-2 text-blue-400" />
                                                <div className="text-2xl font-bold text-white">{selectedRecord.total_settlements || 0}</div>
                                                <div className="text-[10px] text-cyan-600 uppercase mt-1">Settlements</div>
                                            </div>
                                        </div>
                                    </InfoSection>

                                    <InfoSection title="RAW TELEMETRY" icon={Database}>
                                        <pre className="text-cyan-400/50 font-mono text-[10px] whitespace-pre-wrap leading-relaxed">
                                            {JSON.stringify(selectedRecord, null, 2)}
                                        </pre>
                                    </InfoSection>
                                </div>
                            ) : (
                                /* Fallback for non-system categories until you style them */
                                <InfoSection title="RAW TELEMETRY" icon={Database} defaultOpen={true}>
                                    <pre className="text-cyan-400/80 font-mono text-xs whitespace-pre-wrap leading-relaxed">
                                        {JSON.stringify(selectedRecord, null, 2)}
                                    </pre>
                                </InfoSection>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GalacticCatalog;