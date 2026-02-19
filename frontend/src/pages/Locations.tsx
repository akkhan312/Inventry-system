import { useState, useEffect } from 'react';
import { MapPin, Plus, Trash2, Edit2, X, Loader2, MapPin as LocationOn, User, Info } from 'lucide-react';
import MobileHeader from '../components/MobileHeader';
import { useIsMobile } from '../hooks/useMediaQuery';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

interface Location {
    id: string;
    name: string;
    address: string;
    type: string;
    manager?: string | null;
    status?: string;
}

const LOC_STATUS = ['active', 'inactive', 'pending'] as const;
type LocationStatus = (typeof LOC_STATUS)[number];

const Locations = () => {
    const [locations, setLocations] = useState<Location[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [modalOpen, setModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState<{
        name: string;
        address: string;
        type: string;
        manager: string;
        status: LocationStatus;
    }>({
        name: '',
        address: '',
        type: 'store',
        manager: '',
        status: 'active'
    });
    const location = useLocation();
    const isMobileQuery = new URLSearchParams(location.search).get('mobile') === 'true';
    const isMobile = useIsMobile() || isMobileQuery;
    const navigate = useNavigate();

    useEffect(() => {
        fetchLocations();
    }, []);

    const fetchLocations = async () => {
        setIsLoading(true);
        try {
            const response = await api.get<Location[]>('/locations');
            setLocations(response.data);
        } catch (error) {
            console.error('Error fetching locations:', error);
            alert('Failed to load locations.');
        } finally {
            setIsLoading(false);
        }
    };

    const displayId = (id: string) => {
        if (!id) return 'LOC-000';
        const short = id.replace(/^.*?(.{6})$/, '$1').toUpperCase();
        return `LOC-${short}`;
    };

    const handleOpenAdd = () => {
        setEditingId(null);
        setFormData({
            name: '',
            address: '',
            type: 'store',
            manager: '',
            status: 'active'
        });
        setModalOpen(true);
    };

    const handleEdit = (loc: Location) => {
        setEditingId(loc.id);
        setFormData({
            name: loc.name,
            address: loc.address,
            type: loc.type || 'store',
            manager: loc.manager ?? '',
            status: (loc.status as LocationStatus) || 'active'
        });
        setModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const payload = {
            name: formData.name.trim(),
            address: formData.address.trim(),
            type: formData.type,
            manager: formData.manager.trim() || undefined,
            status: formData.status
        };
        if (!payload.name || !payload.address) {
            alert('Location name and address are required.');
            return;
        }
        try {
            if (editingId) {
                const response = await api.put<Location>(`/locations/${editingId}`, payload);
                setLocations(locations.map(l => (l.id === editingId ? response.data : l)));
            } else {
                const response = await api.post<Location>('/locations', payload);
                setLocations([response.data, ...locations]);
            }
            setModalOpen(false);
            setFormData({ name: '', address: '', type: 'store', manager: '', status: 'active' });
        } catch (error) {
            console.error('Error saving location:', error);
            alert('Failed to save location.');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('Are you sure you want to delete this location?')) return;
        try {
            await api.delete(`/locations/${id}`);
            setLocations(locations.filter(l => l.id !== id));
            if (editingId === id) setModalOpen(false);
        } catch (err: unknown) {
            const e = err as { response?: { data?: { error?: string } } };
            alert(e.response?.data?.error ?? 'Failed to delete location.');
        }
    };

    const getStatusClass = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-800';
            case 'inactive': return 'bg-red-100 text-red-800';
            case 'pending': return 'bg-amber-100 text-amber-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusLabel = (status: string) =>
        status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Active';

    // ----- Mobile UI (match locationsmobile.html) -----
    const mobileContent = (
        <div className="relative flex flex-col h-full max-w-[430px] mx-auto bg-white shadow-lg overflow-hidden rounded-b-2xl">
            <header className="bg-[#5c6bc0] text-white py-6 px-6 flex items-center gap-4 shadow-md shrink-0">
                <LocationOn size={28} className="shrink-0" />
                <h1 className="text-2xl font-medium">Locations</h1>
            </header>
            <div className="flex-1 overflow-y-auto p-4">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-500">
                        <Loader2 size={32} className="animate-spin mb-2" />
                        <p>Loading locations...</p>
                    </div>
                ) : locations.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
                        <MapPin size={64} className="text-gray-300 mb-4" />
                        <h3 className="text-xl font-medium text-gray-500 mb-2">No locations yet</h3>
                        <p className="text-gray-400">Add your first location using the button below.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {locations.map(loc => (
                            <div
                                key={loc.id}
                                className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 relative"
                            >
                                <div className="flex justify-between items-center mb-3">
                                    <span className="text-sm text-gray-500">ID: {displayId(loc.id)}</span>
                                    <button
                                        type="button"
                                        onClick={() => handleEdit(loc)}
                                        className="p-1.5 text-[#5c6bc0] hover:bg-[#5c6bc0]/10 rounded-lg transition-colors"
                                        aria-label="Edit"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                </div>
                                <h3 className="text-xl font-medium text-gray-900 mb-3">{loc.name}</h3>
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start gap-2 text-base text-gray-700">
                                        <MapPin size={18} className="text-gray-500 shrink-0 mt-0.5" />
                                        <span>{loc.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-base text-gray-700">
                                        <User size={18} className="text-gray-500 shrink-0" />
                                        <span>{loc.manager || '—'}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Info size={18} className="text-gray-500 shrink-0" />
                                        <span
                                            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusClass(loc.status || 'active')}`}
                                        >
                                            {getStatusLabel(loc.status || 'active')}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            <button
                type="button"
                onClick={handleOpenAdd}
                className="absolute bottom-6 right-6 w-14 h-14 rounded-full bg-[#5c6bc0] text-white shadow-lg flex items-center justify-center hover:scale-105 hover:shadow-xl transition-all z-10"
                aria-label="Add location"
            >
                <Plus size={28} />
            </button>

            {/* Add/Edit Modal */}
            {modalOpen && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4"
                    onClick={() => setModalOpen(false)}
                >
                    <div
                        className="bg-white rounded-t-2xl sm:rounded-2xl w-full max-w-lg max-h-[85vh] overflow-y-auto shadow-2xl transition-transform duration-300 ease-out"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-white flex justify-between items-center p-6 border-b border-gray-200">
                            <h2 className="text-2xl font-medium text-gray-900">
                                {editingId ? 'Edit Location' : 'Add New Location'}
                            </h2>
                            <button
                                type="button"
                                onClick={() => setModalOpen(false)}
                                className="p-2 text-gray-500 hover:text-gray-700 rounded-lg"
                            >
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-5">
                                <div>
                                    <label htmlFor="loc-name" className="block text-sm font-medium text-gray-700 mb-2">
                                        Location Name
                                    </label>
                                    <input
                                        id="loc-name"
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c6bc0] focus:border-[#5c6bc0] outline-none"
                                        placeholder="Enter location name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="loc-address" className="block text-sm font-medium text-gray-700 mb-2">
                                        Address
                                    </label>
                                    <textarea
                                        id="loc-address"
                                        required
                                        rows={3}
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c6bc0] focus:border-[#5c6bc0] outline-none resize-y min-h-[80px]"
                                        placeholder="Enter full address"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="loc-manager" className="block text-sm font-medium text-gray-700 mb-2">
                                        Manager
                                    </label>
                                    <input
                                        id="loc-manager"
                                        type="text"
                                        value={formData.manager}
                                        onChange={e => setFormData({ ...formData, manager: e.target.value })}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c6bc0] focus:border-[#5c6bc0] outline-none"
                                        placeholder="Enter manager name"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="loc-status" className="block text-sm font-medium text-gray-700 mb-2">
                                        Status
                                    </label>
                                    <select
                                        id="loc-status"
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as LocationStatus })}
                                        className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c6bc0] focus:border-[#5c6bc0] outline-none"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={() => setModalOpen(false)}
                                    className="px-6 py-3 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-6 py-3 rounded-lg font-medium bg-[#5c6bc0] text-white hover:bg-[#3f51b5]"
                                >
                                    {editingId ? 'Update' : 'Save Location'}
                                </button>
                            </div>
                            {editingId && (
                                <div className="mt-4 pt-4 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => handleDelete(editingId)}
                                        className="flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                                    >
                                        <Trash2 size={18} />
                                        Delete location
                                    </button>
                                </div>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    // ----- Desktop: keep table/card layout with new fields -----
    const desktopContent = (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Locations</h1>
                <button
                    onClick={handleOpenAdd}
                    className="bg-[#5c6bc0] text-white px-4 py-2 rounded-lg font-medium hover:bg-[#3f51b5] transition-colors flex items-center gap-2"
                >
                    <Plus size={20} />
                    Add Location
                </button>
            </div>
            {isLoading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <Loader2 className="animate-spin mb-2" size={32} />
                    <p>Loading locations...</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {locations.map(loc => (
                        <div
                            key={loc.id}
                            className="bg-white rounded-xl p-4 shadow-md border border-gray-100 hover:shadow-lg transition-all"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <span className="text-xs text-gray-500">ID: {displayId(loc.id)}</span>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => handleEdit(loc)}
                                        className="p-1.5 text-[#5c6bc0] hover:bg-[#5c6bc0]/10 rounded-lg"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(loc.id)}
                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">{loc.name}</h3>
                            <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                <MapPin size={14} className="text-[#5c6bc0]" />
                                {loc.address}
                            </p>
                            {loc.manager && (
                                <p className="text-sm text-gray-600 flex items-center gap-1 mb-1">
                                    <User size={14} className="text-gray-500" />
                                    {loc.manager}
                                </p>
                            )}
                            <span className={`inline-block mt-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusClass(loc.status || 'active')}`}>
                                {getStatusLabel(loc.status || 'active')}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {!isLoading && locations.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-200">
                    <MapPin size={48} className="mx-auto text-gray-300 mb-3" />
                    <h3 className="text-lg font-bold text-gray-400">No locations yet</h3>
                    <p className="text-gray-400">Add your first location.</p>
                </div>
            )}
            {modalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] p-4" onClick={() => setModalOpen(false)}>
                    <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-6 border-b">
                            <h2 className="text-xl font-semibold">{editingId ? 'Edit Location' : 'Add New Location'}</h2>
                            <button type="button" onClick={() => setModalOpen(false)} className="p-2 text-gray-500 hover:text-gray-700">
                                <X size={24} />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Location Name</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.name}
                                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c6bc0]"
                                        placeholder="Enter location name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                    <textarea
                                        required
                                        rows={3}
                                        value={formData.address}
                                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c6bc0]"
                                        placeholder="Enter full address"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Manager</label>
                                    <input
                                        type="text"
                                        value={formData.manager}
                                        onChange={e => setFormData({ ...formData, manager: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c6bc0]"
                                        placeholder="Enter manager name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                    <select
                                        value={formData.status}
                                        onChange={e => setFormData({ ...formData, status: e.target.value as LocationStatus })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5c6bc0]"
                                    >
                                        <option value="active">Active</option>
                                        <option value="inactive">Inactive</option>
                                        <option value="pending">Pending</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 mt-6">
                                <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2 rounded-lg font-medium bg-gray-100 text-gray-700 hover:bg-gray-200">
                                    Cancel
                                </button>
                                <button type="submit" className="flex-1 py-2 rounded-lg font-medium bg-[#5c6bc0] text-white hover:bg-[#3f51b5]">
                                    {editingId ? 'Update' : 'Save Location'}
                                </button>
                            </div>
                            {editingId && (
                                <button
                                    type="button"
                                    onClick={() => handleDelete(editingId)}
                                    className="mt-4 flex items-center gap-2 text-red-600 hover:text-red-700 font-medium"
                                >
                                    <Trash2 size={18} /> Delete location
                                </button>
                            )}
                        </form>
                    </div>
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-[#f5f5f7]">
            {isMobile ? (
                <>
                    <div className="sticky top-0 z-10">
                        <MobileHeader title="Locations" showBack onBackClick={() => navigate('/mobile-ui')} />
                    </div>
                    <div className="relative h-[calc(100vh-56px)] overflow-auto pb-24">
                        <div className="min-h-full flex justify-center">
                            {mobileContent}
                        </div>
                    </div>
                </>
            ) : (
                <div className="p-6 max-w-6xl mx-auto">
                    {desktopContent}
                </div>
            )}
        </div>
    );
};

export default Locations;
