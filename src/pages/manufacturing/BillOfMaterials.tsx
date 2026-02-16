import React, { useState, useEffect } from 'react';
import { Package, Plus, X, Search, Edit2, Trash2, Copy, FileText, AlertCircle } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';

interface BOMItem {
    materialId: string;
    materialName: string;
    quantity: number;
    unit: string;
    cost: number;
}

interface BOM {
    id: string;
    productName: string;
    productSKU: string;
    version: string;
    materials: BOMItem[];
    totalCost: number;
    laborCost: number;
    overheadCost: number;
    finalCost: number;
    notes?: string;
    userId: string;
    createdAt: any;
}

export const BillOfMaterials: React.FC = () => {
    const [boms, setBoms] = useState<BOM[]>([]);
    const [materials, setMaterials] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        productName: '',
        productSKU: '',
        version: '1.0',
        materials: [] as BOMItem[],
        laborCost: 0,
        overheadCost: 0,
        notes: ''
    });

    const [newMaterial, setNewMaterial] = useState({
        materialId: '',
        materialName: '',
        quantity: 1,
        unit: 'pcs',
        cost: 0
    });

    useEffect(() => {
        fetchBOMs();
        fetchMaterials();
    }, []);

    const fetchBOMs = async () => {
        setLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            const bomsRef = collection(db, 'boms');
            const q = query(bomsRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(q);

            const bomsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as BOM[];

            setBoms(bomsList);
        } catch (error) {
            console.error('Failed to fetch BOMs:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaterials = async () => {
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            // Fetch from products collection (raw materials)
            const productsRef = collection(db, 'products');
            const q = query(productsRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(q);

            const materialsList = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            setMaterials(materialsList);
        } catch (error) {
            console.error('Failed to fetch materials:', error);
        }
    };

    const addMaterialToBOM = () => {
        if (!newMaterial.materialName || newMaterial.quantity <= 0) {
            alert('Please fill in all material details');
            return;
        }

        setFormData({
            ...formData,
            materials: [...formData.materials, { ...newMaterial }]
        });

        setNewMaterial({
            materialId: '',
            materialName: '',
            quantity: 1,
            unit: 'pcs',
            cost: 0
        });
    };

    const removeMaterial = (index: number) => {
        setFormData({
            ...formData,
            materials: formData.materials.filter((_, i) => i !== index)
        });
    };

    const calculateTotalCost = () => {
        const materialsCost = formData.materials.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
        return materialsCost + formData.laborCost + formData.overheadCost;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.materials.length === 0) {
            alert('Please add at least one material');
            return;
        }

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            const materialsCost = formData.materials.reduce((sum, item) => sum + (item.quantity * item.cost), 0);
            const finalCost = calculateTotalCost();

            const bomData = {
                ...formData,
                totalCost: materialsCost,
                finalCost,
                userId: user.uid,
                createdAt: serverTimestamp()
            };

            if (editingId) {
                await updateDoc(doc(db, 'boms', editingId), bomData);
            } else {
                await addDoc(collection(db, 'boms'), bomData);
            }

            setShowModal(false);
            setEditingId(null);
            setFormData({
                productName: '',
                productSKU: '',
                version: '1.0',
                materials: [],
                laborCost: 0,
                overheadCost: 0,
                notes: ''
            });
            fetchBOMs();
        } catch (error) {
            console.error('Failed to save BOM:', error);
            alert('Failed to save BOM');
        }
    };

    const handleEdit = (bom: BOM) => {
        setFormData({
            productName: bom.productName,
            productSKU: bom.productSKU,
            version: bom.version,
            materials: bom.materials,
            laborCost: bom.laborCost,
            overheadCost: bom.overheadCost,
            notes: bom.notes || ''
        });
        setEditingId(bom.id);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this BOM?')) return;

        try {
            await deleteDoc(doc(db, 'boms', id));
            fetchBOMs();
        } catch (error) {
            console.error('Failed to delete BOM:', error);
        }
    };

    const duplicateBOM = (bom: BOM) => {
        setFormData({
            productName: `${bom.productName} (Copy)`,
            productSKU: `${bom.productSKU}-COPY`,
            version: '1.0',
            materials: bom.materials,
            laborCost: bom.laborCost,
            overheadCost: bom.overheadCost,
            notes: bom.notes || ''
        });
        setEditingId(null);
        setShowModal(true);
    };

    const filteredBOMs = boms.filter(bom =>
        bom.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bom.productSKU.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-orange-500 to-red-600 p-3 rounded-xl text-white shadow-lg">
                        <Package size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Bill of Materials</h1>
                        <p className="text-gray-500 font-semibold">Manage product recipes and costs</p>
                    </div>
                </div>

                <button
                    onClick={() => {
                        setEditingId(null);
                        setFormData({
                            productName: '',
                            productSKU: '',
                            version: '1.0',
                            materials: [],
                            laborCost: 0,
                            overheadCost: 0,
                            notes: ''
                        });
                        setShowModal(true);
                    }}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                    <Plus size={20} />
                    Create BOM
                </button>
            </div>

            {/* Search */}
            <div className="mb-6">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search by product name or SKU..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none font-semibold"
                    />
                </div>
            </div>

            {/* BOMs List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-500 border-t-transparent"></div>
                </div>
            ) : filteredBOMs.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-lg border-2 border-gray-100 text-center">
                    <Package className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No BOMs found</h3>
                    <p className="text-gray-500">Create your first Bill of Materials to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {filteredBOMs.map(bom => (
                        <div key={bom.id} className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <h3 className="text-2xl font-black text-gray-900">{bom.productName}</h3>
                                        <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-xs font-bold">
                                            v{bom.version}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 font-semibold">SKU: {bom.productSKU}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => duplicateBOM(bom)}
                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                                        title="Duplicate"
                                    >
                                        <Copy size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleEdit(bom)}
                                        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-all"
                                        title="Edit"
                                    >
                                        <Edit2 size={20} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(bom.id)}
                                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-all"
                                        title="Delete"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                            </div>

                            {/* Materials Table */}
                            <div className="mb-4">
                                <h4 className="text-sm font-bold text-gray-700 uppercase mb-3">Materials Required</h4>
                                <div className="bg-gray-50 rounded-xl overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-gray-100">
                                            <tr>
                                                <th className="text-left p-3 text-xs font-bold text-gray-600 uppercase">Material</th>
                                                <th className="text-right p-3 text-xs font-bold text-gray-600 uppercase">Quantity</th>
                                                <th className="text-right p-3 text-xs font-bold text-gray-600 uppercase">Unit Cost</th>
                                                <th className="text-right p-3 text-xs font-bold text-gray-600 uppercase">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {bom.materials.map((material, index) => (
                                                <tr key={index} className="border-t border-gray-200">
                                                    <td className="p-3 font-semibold text-gray-900">{material.materialName}</td>
                                                    <td className="p-3 text-right text-gray-700">{material.quantity} {material.unit}</td>
                                                    <td className="p-3 text-right text-gray-700">₹{material.cost}</td>
                                                    <td className="p-3 text-right font-bold text-gray-900">
                                                        ₹{(material.quantity * material.cost).toFixed(2)}
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Cost Breakdown */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                                <div>
                                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Materials</p>
                                    <p className="text-lg font-black text-gray-900">₹{bom.totalCost.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Labor</p>
                                    <p className="text-lg font-black text-gray-900">₹{bom.laborCost.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-gray-600 uppercase mb-1">Overhead</p>
                                    <p className="text-lg font-black text-gray-900">₹{bom.overheadCost.toFixed(2)}</p>
                                </div>
                                <div>
                                    <p className="text-xs font-bold text-orange-600 uppercase mb-1">Total Cost</p>
                                    <p className="text-2xl font-black text-orange-600">₹{bom.finalCost.toFixed(2)}</p>
                                </div>
                            </div>

                            {bom.notes && (
                                <div className="mt-4 p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <p className="text-sm text-gray-700"><strong>Notes:</strong> {bom.notes}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Create/Edit Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-2xl font-black text-gray-900">
                                {editingId ? 'Edit BOM' : 'Create New BOM'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
                            {/* Product Info */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Product Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.productName}
                                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">SKU *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.productSKU}
                                        onChange={(e) => setFormData({ ...formData, productSKU: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Version *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.version}
                                        onChange={(e) => setFormData({ ...formData, version: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Materials Section */}
                            <div>
                                <h3 className="text-lg font-black text-gray-900 mb-4">Materials</h3>

                                {/* Add Material Form */}
                                <div className="bg-gray-50 p-4 rounded-xl mb-4">
                                    <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-3">
                                        <div className="md:col-span-2">
                                            <input
                                                type="text"
                                                placeholder="Material name"
                                                value={newMaterial.materialName}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, materialName: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Quantity"
                                                min="0.01"
                                                step="0.01"
                                                value={newMaterial.quantity}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, quantity: parseFloat(e.target.value) })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <select
                                                value={newMaterial.unit}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, unit: e.target.value })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                                            >
                                                <option value="pcs">Pieces</option>
                                                <option value="kg">Kilograms</option>
                                                <option value="ltr">Liters</option>
                                                <option value="m">Meters</option>
                                                <option value="box">Boxes</option>
                                            </select>
                                        </div>
                                        <div>
                                            <input
                                                type="number"
                                                placeholder="Cost per unit"
                                                min="0"
                                                step="0.01"
                                                value={newMaterial.cost}
                                                onChange={(e) => setNewMaterial({ ...newMaterial, cost: parseFloat(e.target.value) })}
                                                className="w-full px-3 py-2 border-2 border-gray-200 rounded-lg focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={addMaterialToBOM}
                                        className="w-full py-2 bg-orange-500 text-white rounded-lg font-bold hover:bg-orange-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Plus size={18} />
                                        Add Material
                                    </button>
                                </div>

                                {/* Materials List */}
                                {formData.materials.length > 0 && (
                                    <div className="space-y-2">
                                        {formData.materials.map((material, index) => (
                                            <div key={index} className="flex items-center justify-between p-3 bg-white border-2 border-gray-200 rounded-lg">
                                                <div className="flex-1">
                                                    <p className="font-bold text-gray-900">{material.materialName}</p>
                                                    <p className="text-sm text-gray-600">
                                                        {material.quantity} {material.unit} × ₹{material.cost} = ₹{(material.quantity * material.cost).toFixed(2)}
                                                    </p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => removeMaterial(index)}
                                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-all"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Costs */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Labor Cost</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.laborCost}
                                        onChange={(e) => setFormData({ ...formData, laborCost: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Overhead Cost</label>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        value={formData.overheadCost}
                                        onChange={(e) => setFormData({ ...formData, overheadCost: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none"
                                    />
                                </div>
                            </div>

                            {/* Total Cost Display */}
                            <div className="p-4 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                                <p className="text-sm font-bold text-gray-600 uppercase mb-1">Estimated Total Cost</p>
                                <p className="text-3xl font-black text-orange-600">₹{calculateTotalCost().toFixed(2)}</p>
                            </div>

                            {/* Notes */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-orange-500 outline-none resize-none"
                                    placeholder="Additional notes or instructions..."
                                />
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    {editingId ? 'Update BOM' : 'Create BOM'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-bold hover:bg-gray-200 transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};
