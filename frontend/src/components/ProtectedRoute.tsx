import React from 'react'
import {Navigate, useLocation} from 'react-router-dom'
import {useAuth} from '../auth/AuthContext'

interface ProtectedRouteProps {
    children: React.ReactElement
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({children}) => {
    const {accessToken} = useAuth()
    const location = useLocation()

    if (!accessToken) {
        return <Navigate to="/login" replace state={{from: location}}/>
    }

    return children
}

export default ProtectedRoute
