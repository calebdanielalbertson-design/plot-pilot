"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AdminContextType {
    isAuthenticated: boolean;
    login: (password: string) => boolean;
    logout: () => void;
    showLoginModal: boolean;
    setShowLoginModal: (show: boolean) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export function AdminProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [showLoginModal, setShowLoginModal] = useState(false);

    // Persist login state (optional - for now session based is safer/simpler for "log out on close")
    // If user wants persistence, we can uncomment below:
    /*
    useEffect(() => {
        const stored = localStorage.getItem('plotpilot_admin_auth');
        if (stored === 'true') setIsAuthenticated(true);
    }, []);
    */

    const login = (password: string) => {
        if (password === 'plotpilot2025') {
            setIsAuthenticated(true);
            // localStorage.setItem('plotpilot_admin_auth', 'true');
            setShowLoginModal(false);
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        // localStorage.removeItem('plotpilot_admin_auth');
    };

    return (
        <AdminContext.Provider value={{ isAuthenticated, login, logout, showLoginModal, setShowLoginModal }}>
            {children}
            {/* Global Login Modal could be placed here if we wanted it always available, 
                but we might want more control over where it renders. 
                For now, let's export the Modal controls and let components render the modal if needed, 
                OR we can make a dedicated AdminLoginModal component that consumes this context. */}
        </AdminContext.Provider>
    );
}

export function useAdmin() {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
}
