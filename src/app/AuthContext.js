"use client";
import { createContext } from "react";
import { useContext } from 'react';
import React, { useState } from "react";
export const AuthContext = createContext(true);

export const AuthProvider = ({ children }) => {
    const [isAuthorized, setIsAuthorized] = useState(true);
    return (
        <AuthContext.Provider value={{ isAuthorized, setIsAuthorized }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuthContext = () =>
    {
        const context = useContext(AuthContext);
        if (context === undefined) {
            throw new Error("useAuthContext must be used within an AuthProvider");
        }
        return context; 
    }