import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { X, AlertTriangle, CheckCircle, Info } from 'lucide-react';

type DialogType = 'alert' | 'confirm' | 'prompt';
type DialogVariant = 'info' | 'success' | 'warning' | 'danger';

interface DialogOptions {
    title?: string;
    message: string;
    variant?: DialogVariant;
    confirmText?: string;
    cancelText?: string;
}

interface DialogContextType {
    alert: (message: string, options?: Omit<DialogOptions, 'message'>) => Promise<void>;
    confirm: (message: string, options?: Omit<DialogOptions, 'message'>) => Promise<boolean>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export const useDialog = () => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('useDialog must be used within a DialogProvider');
    }
    return context;
};

export const DialogProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [config, setConfig] = useState<DialogOptions & { type: DialogType }>({
        message: '',
        type: 'alert',
        variant: 'info'
    });
    const [resolvePromise, setResolvePromise] = useState<(value: any) => void>(() => { });

    const openDialog = useCallback((type: DialogType, message: string, options: Omit<DialogOptions, 'message'> = {}) => {
        return new Promise<any>((resolve) => {
            setConfig({
                message,
                type,
                variant: options.variant || 'info', // Default variant
                title: options.title,
                confirmText: options.confirmText,
                cancelText: options.cancelText,
            });
            setResolvePromise(() => resolve);
            setIsOpen(true);
        });
    }, []);

    const alert = useCallback(async (message: string, options?: Omit<DialogOptions, 'message'>) => {
        await openDialog('alert', message, options);
    }, [openDialog]);

    const confirm = useCallback(async (message: string, options?: Omit<DialogOptions, 'message'>) => {
        return await openDialog('confirm', message, { variant: 'danger', ...options });
    }, [openDialog]);

    const handleClose = (result: boolean) => {
        setIsOpen(false);
        // Add a small timeout to allow animation to finish if we add one, 
        // but principally to let the state update before resolving
        setTimeout(() => {
            resolvePromise(result);
        }, 100);
    };

    // Icon mapping
    const getIcon = () => {
        switch (config.variant) {
            case 'danger': return <AlertTriangle className="text-red-500" size={32} />;
            case 'warning': return <AlertTriangle className="text-amber-500" size={32} />;
            case 'success': return <CheckCircle className="text-green-500" size={32} />;
            default: return <Info className="text-blue-500" size={32} />;
        }
    };

    // Color mapping for the confirm button
    const getConfirmButtonClass = () => {
        switch (config.variant) {
            case 'danger': return 'bg-red-600 hover:bg-red-700 focus:ring-red-200';
            case 'warning': return 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-200';
            case 'success': return 'bg-green-600 hover:bg-green-700 focus:ring-green-200';
            default: return 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-200';
        }
    };

    return (
        <DialogContext.Provider value={{ alert, confirm }}>
            {children}

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all duration-200"
                    onClick={() => config.type !== 'alert' && handleClose(false)} // Click outside to cancel if not alert
                >
                    <div
                        className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden transform transition-all scale-100 opacity-100"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6">
                            <div className="flex flex-col items-center text-center">
                                <div className={`mb-4 p-3 rounded-full ${config.variant === 'danger' ? 'bg-red-50' :
                                        config.variant === 'warning' ? 'bg-amber-50' :
                                            config.variant === 'success' ? 'bg-green-50' : 'bg-blue-50'
                                    }`}>
                                    {getIcon()}
                                </div>

                                {config.title && (
                                    <h3 className="text-xl font-bold text-slate-800 mb-2">{config.title}</h3>
                                )}

                                <p className="text-slate-600 leading-relaxed mb-6">
                                    {config.message}
                                </p>

                                <div className="flex items-center gap-3 w-full">
                                    {config.type === 'confirm' && (
                                        <button
                                            onClick={() => handleClose(false)}
                                            className="flex-1 px-4 py-2.5 bg-white border border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 font-semibold transition-colors duration-200"
                                        >
                                            {config.cancelText || 'Cancel'}
                                        </button>
                                    )}

                                    <button
                                        onClick={() => handleClose(true)}
                                        className={`flex-1 px-4 py-2.5 text-white rounded-xl font-semibold shadow-lg shadow-slate-200 transition-colors duration-200 focus:ring-4 ${getConfirmButtonClass()}`}
                                    >
                                        {config.confirmText || (config.type === 'alert' ? 'OK' : 'Confirm')}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </DialogContext.Provider>
    );
};
