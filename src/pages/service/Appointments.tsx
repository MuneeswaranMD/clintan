import React, { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, Clock, User, Phone, Mail, Plus, X, Check, AlertCircle, Search, Filter } from 'lucide-react';
import { collection, query, where, getDocs, addDoc, updateDoc, deleteDoc, doc, serverTimestamp, Timestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { getAuth } from 'firebase/auth';

interface Appointment {
    id: string;
    customerName: string;
    customerPhone: string;
    customerEmail?: string;
    service: string;
    date: Date;
    time: string;
    duration: number; // in minutes
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    userId: string;
}

export const Appointments: React.FC = () => {
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [filterStatus, setFilterStatus] = useState<'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const [formData, setFormData] = useState({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        service: '',
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        duration: 60,
        notes: ''
    });

    useEffect(() => {
        fetchAppointments();
    }, [selectedDate]);

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            const appointmentsRef = collection(db, 'appointments');
            const q = query(appointmentsRef, where('userId', '==', user.uid));
            const snapshot = await getDocs(q);

            const appointmentsList = snapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    ...data,
                    date: data.date?.toDate() || new Date()
                } as Appointment;
            });

            setAppointments(appointmentsList);
        } catch (error) {
            console.error('Failed to fetch appointments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const auth = getAuth();
            const user = auth.currentUser;
            if (!user) return;

            const appointmentData = {
                ...formData,
                date: Timestamp.fromDate(new Date(formData.date)),
                status: 'pending',
                userId: user.uid,
                createdAt: serverTimestamp()
            };

            await addDoc(collection(db, 'appointments'), appointmentData);

            setShowModal(false);
            setFormData({
                customerName: '',
                customerPhone: '',
                customerEmail: '',
                service: '',
                date: new Date().toISOString().split('T')[0],
                time: '09:00',
                duration: 60,
                notes: ''
            });
            fetchAppointments();
        } catch (error) {
            console.error('Failed to create appointment:', error);
            alert('Failed to create appointment');
        }
    };

    const updateStatus = async (appointmentId: string, newStatus: Appointment['status']) => {
        try {
            const appointmentRef = doc(db, 'appointments', appointmentId);
            await updateDoc(appointmentRef, { status: newStatus });
            fetchAppointments();
        } catch (error) {
            console.error('Failed to update status:', error);
        }
    };

    const deleteAppointment = async (appointmentId: string) => {
        if (!confirm('Are you sure you want to delete this appointment?')) return;

        try {
            await deleteDoc(doc(db, 'appointments', appointmentId));
            fetchAppointments();
        } catch (error) {
            console.error('Failed to delete appointment:', error);
        }
    };

    const filteredAppointments = appointments.filter(apt => {
        const matchesStatus = filterStatus === 'all' || apt.status === filterStatus;
        const matchesSearch = apt.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            apt.service.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const todayAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const today = new Date();
        return aptDate.toDateString() === today.toDateString();
    });

    const upcomingAppointments = filteredAppointments.filter(apt => {
        const aptDate = new Date(apt.date);
        const today = new Date();
        return aptDate > today;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const getStatusColor = (status: Appointment['status']) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
            case 'confirmed': return 'bg-blue-100 text-blue-700 border-blue-300';
            case 'completed': return 'bg-green-100 text-green-700 border-green-300';
            case 'cancelled': return 'bg-red-100 text-red-700 border-red-300';
        }
    };

    const services = [
        'Consultation',
        'Haircut',
        'Massage',
        'Facial',
        'Manicure',
        'Pedicure',
        'Therapy Session',
        'Training',
        'Other'
    ];

    return (
        <div className="p-6 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-3 rounded-xl text-white shadow-lg">
                        <CalendarIcon size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-gray-900">Appointments</h1>
                        <p className="text-gray-500 font-semibold">Manage your bookings and schedule</p>
                    </div>
                </div>

                <button
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                >
                    <Plus size={20} />
                    New Appointment
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[300px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                            <input
                                type="text"
                                placeholder="Search by customer or service..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                            />
                        </div>
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter size={18} className="text-gray-500" />
                        {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map(status => (
                            <button
                                key={status}
                                onClick={() => setFilterStatus(status)}
                                className={`px-4 py-2 rounded-xl font-bold transition-all ${filterStatus === status
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                    }`}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                    <p className="text-sm font-bold text-gray-500 uppercase mb-1">Today</p>
                    <p className="text-3xl font-black text-purple-600">{todayAppointments.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                    <p className="text-sm font-bold text-gray-500 uppercase mb-1">Upcoming</p>
                    <p className="text-3xl font-black text-blue-600">{upcomingAppointments.length}</p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                    <p className="text-sm font-bold text-gray-500 uppercase mb-1">Pending</p>
                    <p className="text-3xl font-black text-yellow-600">
                        {appointments.filter(a => a.status === 'pending').length}
                    </p>
                </div>
                <div className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100">
                    <p className="text-sm font-bold text-gray-500 uppercase mb-1">Completed</p>
                    <p className="text-3xl font-black text-green-600">
                        {appointments.filter(a => a.status === 'completed').length}
                    </p>
                </div>
            </div>

            {/* Appointments List */}
            {loading ? (
                <div className="flex items-center justify-center py-20">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-500 border-t-transparent"></div>
                </div>
            ) : filteredAppointments.length === 0 ? (
                <div className="bg-white p-12 rounded-2xl shadow-lg border-2 border-gray-100 text-center">
                    <CalendarIcon className="mx-auto text-gray-300 mb-4" size={64} />
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No appointments found</h3>
                    <p className="text-gray-500">Create your first appointment to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredAppointments.map(appointment => (
                        <div key={appointment.id} className="bg-white p-6 rounded-2xl shadow-lg border-2 border-gray-100 hover:shadow-xl transition-all">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <h3 className="text-xl font-black text-gray-900 mb-1">{appointment.customerName}</h3>
                                    <p className="text-purple-600 font-bold mb-2">{appointment.service}</p>
                                    <div className="space-y-1 text-sm text-gray-600">
                                        <div className="flex items-center gap-2">
                                            <Phone size={16} />
                                            <span>{appointment.customerPhone}</span>
                                        </div>
                                        {appointment.customerEmail && (
                                            <div className="flex items-center gap-2">
                                                <Mail size={16} />
                                                <span>{appointment.customerEmail}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-2">
                                            <CalendarIcon size={16} />
                                            <span>{new Date(appointment.date).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock size={16} />
                                            <span>{appointment.time} ({appointment.duration} min)</span>
                                        </div>
                                    </div>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold border-2 ${getStatusColor(appointment.status)}`}>
                                    {appointment.status.toUpperCase()}
                                </span>
                            </div>

                            {appointment.notes && (
                                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                                    <p className="text-sm text-gray-700"><strong>Notes:</strong> {appointment.notes}</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                {appointment.status === 'pending' && (
                                    <button
                                        onClick={() => updateStatus(appointment.id, 'confirmed')}
                                        className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} />
                                        Confirm
                                    </button>
                                )}
                                {appointment.status === 'confirmed' && (
                                    <button
                                        onClick={() => updateStatus(appointment.id, 'completed')}
                                        className="flex-1 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Check size={16} />
                                        Complete
                                    </button>
                                )}
                                <button
                                    onClick={() => updateStatus(appointment.id, 'cancelled')}
                                    className="flex-1 py-2 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-all flex items-center justify-center gap-2"
                                >
                                    <X size={16} />
                                    Cancel
                                </button>
                                <button
                                    onClick={() => deleteAppointment(appointment.id)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200 transition-all"
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Create Appointment Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b-2 border-gray-100 flex items-center justify-between sticky top-0 bg-white">
                            <h2 className="text-2xl font-black text-gray-900">New Appointment</h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-all"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Customer Name *</label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.customerName}
                                        onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Phone *</label>
                                    <input
                                        type="tel"
                                        required
                                        value={formData.customerPhone}
                                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Email (Optional)</label>
                                <input
                                    type="email"
                                    value={formData.customerEmail}
                                    onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Service *</label>
                                <select
                                    required
                                    value={formData.service}
                                    onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                                >
                                    <option value="">Select a service</option>
                                    {services.map(service => (
                                        <option key={service} value={service}>{service}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Date *</label>
                                    <input
                                        type="date"
                                        required
                                        value={formData.date}
                                        onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Time *</label>
                                    <input
                                        type="time"
                                        required
                                        value={formData.time}
                                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Duration (min) *</label>
                                    <input
                                        type="number"
                                        required
                                        min="15"
                                        step="15"
                                        value={formData.duration}
                                        onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) })}
                                        className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">Notes (Optional)</label>
                                <textarea
                                    rows={3}
                                    value={formData.notes}
                                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                    className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:border-purple-500 outline-none resize-none"
                                    placeholder="Any special requirements or notes..."
                                />
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="submit"
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-xl font-bold hover:shadow-lg transition-all"
                                >
                                    Create Appointment
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
