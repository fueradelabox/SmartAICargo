
import React, { useState, useEffect, useRef } from 'react';
import { BellIcon, CheckCircleIcon } from './icons';
import { apiService } from '../services/apiService';
import { useAuth } from '../contexts/AuthContext';
import { Notification } from '../types';

const NotificationBell: React.FC = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const { currentUser } = useAuth();
    const dropdownRef = useRef<HTMLDivElement>(null);

    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        const fetchNotifications = async () => {
            if (currentUser) {
                // In a real app, this would be a dedicated endpoint
                // We simulate by filtering all alerts for the current user
                const response = await apiService.getData<Notification[]>('alerts');
                if (response.success && response.data) {
                    const userNotifications = response.data.filter(
                        alert => !alert.recipientId || alert.recipientId === currentUser.id
                    );
                    setNotifications(userNotifications);
                }
            }
        };

        fetchNotifications();
        // Poll for new notifications every 30 seconds to simulate real-time
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, [currentUser]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleMarkAsRead = async (id: string) => {
        const updatedNotifications = notifications.map(n => n.id === id ? { ...n, isRead: true } : n);
        setNotifications(updatedNotifications);
        // Persist this change
        await apiService.updateData('alerts', updatedNotifications);
    };

    const handleMarkAllAsRead = async () => {
        const updatedNotifications = notifications.map(n => ({ ...n, isRead: true }));
        setNotifications(updatedNotifications);
        await apiService.updateData('alerts', updatedNotifications);
    };

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-white rounded-full hover:bg-[#2c3035] focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Ver notificaciones"
            >
                <BellIcon className="h-6 w-6" />
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 flex h-4 w-4">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 text-white text-xs items-center justify-center">
                            {unreadCount}
                        </span>
                    </span>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-80 bg-[#1a1f25] border border-[#40474f] rounded-xl shadow-lg z-20 max-h-96 overflow-y-auto">
                    <div className="p-3 flex justify-between items-center border-b border-[#40474f]">
                        <h3 className="font-semibold text-white">Notificaciones</h3>
                        {unreadCount > 0 && (
                            <button onClick={handleMarkAllAsRead} className="text-xs text-blue-400 hover:underline">
                                Marcar todas como leídas
                            </button>
                        )}
                    </div>
                    {notifications.length > 0 ? (
                        <ul>
                            {notifications.map(notification => (
                                <li key={notification.id} className={`p-3 border-b border-[#40474f] last:border-b-0 ${!notification.isRead ? 'bg-blue-500/10' : ''}`}>
                                    <p className="text-sm text-white">{notification.message}</p>
                                    <p className="text-xs text-gray-400 mt-1">{new Date(notification.timestamp).toLocaleString()}</p>
                                    {!notification.isRead && (
                                        <button onClick={() => handleMarkAsRead(notification.id)} className="text-xs text-green-400 hover:underline mt-2 flex items-center gap-1">
                                            <CheckCircleIcon className="h-4 w-4" /> Marcar como leída
                                        </button>
                                    )}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="p-4 text-sm text-center text-gray-400">No hay notificaciones.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
