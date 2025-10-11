import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, CheckCircle, Settings, Activity } from 'lucide-react';
import { StatusChangeNotification } from '@/services/cameraService';

interface CameraStatusNotificationsProps {
    notifications: StatusChangeNotification[];
    onDismiss: (index: number) => void;
}

export const CameraStatusNotifications: React.FC<CameraStatusNotificationsProps> = ({
    notifications,
    onDismiss
}) => {
    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return <CheckCircle className="h-4 w-4 text-green-500" />;
            case 'OFFLINE':
                return <AlertTriangle className="h-4 w-4 text-red-500" />;
            case 'MAINTENANCE':
                return <Settings className="h-4 w-4 text-yellow-500" />;
            default:
                return <Activity className="h-4 w-4 text-blue-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'ACTIVE':
                return 'border-green-200 bg-green-50';
            case 'OFFLINE':
                return 'border-red-200 bg-red-50';
            case 'MAINTENANCE':
                return 'border-yellow-200 bg-yellow-50';
            default:
                return 'border-blue-200 bg-blue-50';
        }
    };

    // Auto-dismiss notifications after 10 seconds
    useEffect(() => {
        notifications.forEach((_, index) => {
            const timer = setTimeout(() => {
                onDismiss(index);
            }, 10000);

            return () => clearTimeout(timer);
        });
    }, [notifications, onDismiss]);

    return (
        <div className="fixed top-4 right-4 z-50 space-y-2">
            <AnimatePresence>
                {notifications.map((notification, index) => (
                    <motion.div
                        key={`${notification.cameraId}-${notification.timestamp.getTime()}`}
                        initial={{ opacity: 0, x: 300, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 300, scale: 0.8 }}
                        transition={{ duration: 0.3 }}
                        className={`
              max-w-sm p-4 rounded-lg border shadow-lg
              ${getStatusColor(notification.newStatus)}
            `}
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start space-x-3">
                                {getStatusIcon(notification.newStatus)}
                                <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">
                                        {notification.cameraName}
                                    </h4>
                                    <p className="text-sm text-gray-600">
                                        Status changed: {notification.previousStatus} → {notification.newStatus}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-1">
                                        {notification.timestamp.toLocaleTimeString()}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={() => onDismiss(index)}
                                className="text-gray-400 hover:text-gray-600 transition-colors"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </AnimatePresence>
        </div>
    );
};