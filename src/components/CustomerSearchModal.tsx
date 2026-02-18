import React, { useState, useEffect } from 'react';
import { Search, X, User, Phone, MapPin, Building2 } from 'lucide-react';
import { Customer } from '../types';

interface CustomerSearchModalProps {
    isOpen: boolean;
    onClose: () => void;
    customers: Customer[];
    onSelect: (customer: Customer) => void;
}

export const CustomerSearchModal: React.FC<CustomerSearchModalProps> = ({ isOpen, onClose, customers, onSelect }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>(customers);

    useEffect(() => {
        if (searchTerm) {
            const lower = searchTerm.toLowerCase();
            setFilteredCustomers(customers.filter(c =>
                c.name.toLowerCase().includes(lower) ||
                c.phone?.includes(searchTerm) ||
                c.company?.toLowerCase().includes(lower)
            ));
        } else {
            setFilteredCustomers(customers);
        }
    }, [searchTerm, customers]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-white z-[1000] flex flex-col animate-fade-in">
            <div className="w-full max-w-4xl mx-auto flex flex-col h-full">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white">
                    <h3 className="text-xl font-bold text-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center">
                            <User size={20} />
                        </div>
                        Search Customer
                    </h3>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-all">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                        <input
                            autoFocus
                            className="w-full bg-white border border-slate-200 pl-12 pr-4 py-4 rounded-xl text-lg font-medium outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-slate-800 shadow-sm"
                            placeholder="Search by name, phone or company..."
                            value={searchTerm}
                            onChange={e => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="overflow-y-auto flex-1 p-6 space-y-3 bg-white">
                    {filteredCustomers.length > 0 ? (
                        filteredCustomers.map(customer => (
                            <button
                                key={customer.id}
                                onClick={() => { onSelect(customer); onClose(); }}
                                className="w-full text-left p-6 rounded-xl hover:bg-blue-50 border border-slate-100 hover:border-blue-200 group transition-all shadow-sm hover:shadow-md"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-lg font-bold text-slate-800 group-hover:text-blue-700">{customer.name}</span>
                                    {customer.company && (
                                        <span className="text-xs font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-3 py-1 rounded-full group-hover:bg-blue-100 group-hover:text-blue-600 flex items-center gap-1">
                                            <Building2 size={12} /> {customer.company}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-6 text-sm text-slate-500 group-hover:text-blue-600/70">
                                    {customer.phone && <div className="flex items-center gap-2"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100"><Phone size={12} /></div> {customer.phone}</div>}
                                    {customer.address && <div className="flex items-center gap-2 truncate"><div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center group-hover:bg-blue-100"><MapPin size={12} /></div> {customer.address}</div>}
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-400">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                                <User size={40} className="opacity-20" />
                            </div>
                            <p className="font-medium text-lg">No customers found</p>
                            <p className="text-sm opacity-70 mt-1">Try searching for something else</p>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-slate-100 bg-slate-50 text-center flex justify-between items-center px-8">
                    <p className="text-xs font-medium text-slate-500">{filteredCustomers.length} results found</p>
                    <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
                        <span className="px-2 py-1 bg-white border border-slate-200 rounded text-slate-700">Esc</span> to close
                    </div>
                </div>
            </div>
        </div>
    );
};
