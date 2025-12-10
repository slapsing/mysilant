import React, {createContext, type ReactNode, useContext, useEffect, useState,} from 'react'
import {loginRequest, type TokenResponse} from '../api/auth'

interface AuthState {
    accessToken: string | null
    refreshToken: string | null
    username: string | null
}

interface AuthContextValue extends AuthState {
    login: (username: string, password: string) => Promise<void>
    logout: () => void
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

const STORAGE_KEYS = {
    access: 'mysilant_access',
    refresh: 'mysilant_refresh',
    username: 'mysilant_username',
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({children}) => {
    const [accessToken, setAccessToken] = useState<string | null>(null)
    const [refreshToken, setRefreshToken] = useState<string | null>(null)
    const [username, setUsername] = useState<string | null>(null)


    useEffect(() => {
        const storedAccess = window.localStorage.getItem(STORAGE_KEYS.access)
        const storedRefresh = window.localStorage.getItem(STORAGE_KEYS.refresh)
        const storedUsername = window.localStorage.getItem(STORAGE_KEYS.username)

        if (storedAccess) setAccessToken(storedAccess)
        if (storedRefresh) setRefreshToken(storedRefresh)
        if (storedUsername) setUsername(storedUsername)
    }, [])


    useEffect(() => {
        if (accessToken) {
            window.localStorage.setItem(STORAGE_KEYS.access, accessToken)
        } else {
            window.localStorage.removeItem(STORAGE_KEYS.access)
        }

        if (refreshToken) {
            window.localStorage.setItem(STORAGE_KEYS.refresh, refreshToken)
        } else {
            window.localStorage.removeItem(STORAGE_KEYS.refresh)
        }

        if (username) {
            window.localStorage.setItem(STORAGE_KEYS.username, username)
        } else {
            window.localStorage.removeItem(STORAGE_KEYS.username)
        }
    }, [accessToken, refreshToken, username])

    const login = async (loginUsername: string, password: string) => {
        const tokens: TokenResponse = await loginRequest(loginUsername, password)
        setAccessToken(tokens.access)
        setRefreshToken(tokens.refresh)
        setUsername(loginUsername)
    }

    const logout = () => {
        setAccessToken(null)
        setRefreshToken(null)
        setUsername(null)
    }

    const value: AuthContextValue = {
        accessToken,
        refreshToken,
        username,
        login,
        logout,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = (): AuthContextValue => {
    const ctx = useContext(AuthContext)
    if (!ctx) {
        throw new Error('useAuth должен использоваться внутри AuthProvider')
    }
    return ctx
}
