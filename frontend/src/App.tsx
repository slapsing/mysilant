import React from 'react'
import {Route, Routes} from 'react-router-dom'
import PublicMachineSearchPage from './pages/PublicMachineSearchPage'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ProtectedRoute from './components/ProtectedRoute'
import MachineDetailPage from './pages/MachineDetailPage'
import MaintenanceDetailPage from './pages/MaintenanceDetailPage'
import ClaimDetailPage from './pages/ClaimDetailPage'
import ReferenceAdminPage from './features/references/ReferenceAdminPage'


const App: React.FC = () => {
    return (
        <Routes>
            <Route path="/" element={<PublicMachineSearchPage/>}/>
            <Route path="/login" element={<LoginPage/>}/>

            <Route
                path="/app"
                element={
                    <ProtectedRoute>
                        <DashboardPage/>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/app/references"
                element={<ReferenceAdminPage/>
                }
            />

            <Route
                path="/app/machines/:id"
                element={
                    <ProtectedRoute>
                        <MachineDetailPage/>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/app/maintenance/:id"
                element={
                    <ProtectedRoute>
                        <MaintenanceDetailPage/>
                    </ProtectedRoute>
                }
            />

            <Route
                path="/app/claims/:id"
                element={
                    <ProtectedRoute>
                        <ClaimDetailPage/>
                    </ProtectedRoute>
                }
            />
        </Routes>
    )
}

export default App
