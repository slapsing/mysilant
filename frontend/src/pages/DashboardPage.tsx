import React, {useEffect, useState} from 'react'
import {Link} from 'react-router-dom'

import {useAuth} from '../auth/AuthContext'
import Alert from '../components/Alert'
import {API_BASE_URL, fetchCurrentUser} from '../api/client'
import type {UserProfileShort, UserShort} from '../types/api'

import MachinesTab from '../features/dashboard/MachinesTab'
import MaintenanceTab from '../features/dashboard/MaintenanceTab'
import ClaimsTab from '../features/dashboard/ClaimsTab'
import DashboardTabsBar, {type DashboardTabId,} from '../features/dashboard/DashboardTabsBar'

import silantLogoRed from '../assets/logo/logo-silant-red.png'

type UserRole = UserProfileShort['role'] | undefined

const ROLE_LABELS: Record<string, string> = {
    client: 'Клиент',
    service: 'Сервисная организация',
    manager: 'Менеджер',
}

/**
 * Строим URL для Swagger/Redoc в зависимости от API_BASE_URL.
 */
const buildDocsUrl = (kind: 'swagger' | 'redoc'): string => {
    const base = API_BASE_URL.replace(/\/+$/, '')
    const hasApiSegment = /\/api$/.test(base)
    const root = hasApiSegment ? base : `${base}/api`
    return `${root}/schema/${kind}/`
}

const DashboardPage: React.FC = () => {
    const {accessToken, username, logout} = useAuth()
    const [activeTab, setActiveTab] = useState<DashboardTabId>('machines')

    const [currentUser, setCurrentUser] = useState<UserShort | null>(null)
    const [userError, setUserError] = useState('')
    const role: UserRole = currentUser?.profile?.role

    useEffect(() => {
        if (!accessToken) return

        const loadUser = async () => {
            try {
                setUserError('')
                const data = await fetchCurrentUser(accessToken)
                setCurrentUser(data)
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Ошибка при загрузке профиля'
                setUserError(message)
            }
        }

        loadUser()
    }, [accessToken])

    if (!accessToken) {
        return null
    }

    const displayName = currentUser?.username ?? username ?? 'пользователь'

    return (
        <div className="app-root">
            <a href="#main-content" className="skip-link">
                Перейти к основному содержанию
            </a>

            <header className="app-header" role="banner">
                <div className="app-header-inner">
                    <div className="app-header-top">
                        {/* Логотип + "Мой Силант" */}
                        <Link to="/app" className="app-header-logo app-header-logo--link">
                            <img
                                src={silantLogoRed}
                                alt="Логотип «Силант»"
                                className="app-logo-img"
                            />
                            <span className="app-header-brand-text">Мой Силант</span>
                        </Link>


                        <div className="app-header-contacts">
                            <span>{displayName}</span>
                            {role && (
                                <>
                                    <span className="contact-separator">·</span>
                                    <span>{ROLE_LABELS[role] ?? role}</span>
                                </>
                            )}
                            <span className="contact-separator">·</span>
                            <a href="tel:+78352201209" className="contact-link">
                                +7 8352 20-12-09
                            </a>
                            <span className="contact-separator">·</span>
                            <a
                                href="https://t.me/"
                                target="_blank"
                                rel="noreferrer"
                                className="contact-link contact-link--telegram"
                            >
                                Telegram
                            </a>
                        </div>

                        <div className="app-header-auth">
                            <button
                                type="button"
                                className="secondary-link-button secondary-link-button--sm"
                                onClick={logout}
                            >
                                Выйти
                            </button>
                        </div>
                    </div>

                    <div className="app-header-bottom">
                        <div className="app-subtitle">
                            Доступ к технике, ТО и рекламациям в зависимости от роли
                            пользователя
                        </div>
                    </div>

                    {/* Блок кнопок для менеджера */}
                    {role === 'manager' && (
                        <div className="manager-actions">
                            <Link
                                to="/app/references"
                                className="manager-actions__button manager-actions__button--primary"
                            >
                                Управление справочниками
                            </Link>

                            <a
                                href={buildDocsUrl('swagger')}
                                target="_blank"
                                rel="noreferrer"
                                className="manager-actions__button"
                            >
                                Swagger UI
                            </a>

                            <a
                                href={buildDocsUrl('redoc')}
                                target="_blank"
                                rel="noreferrer"
                                className="manager-actions__button"
                            >
                                Redoc
                            </a>
                        </div>
                    )}
                </div>
            </header>

            <main
                id="main-content"
                className="app-main"
                role="main"
                aria-labelledby="dashboard-heading"
            >
                <section className="card">
                    <h1 id="dashboard-heading" className="card-title">
                        Личный кабинет
                    </h1>

                    <p className="search-help">
                        Вы вошли как <strong>{displayName}</strong>
                        {currentUser?.profile?.role && (
                            <>
                                {' '}
                                (роль:{' '}
                                <strong>
                                    {ROLE_LABELS[currentUser.profile.role] ??
                                        currentUser.profile.role}
                                </strong>
                                {currentUser.profile.organization_name
                                    ? `, ${currentUser.profile.organization_name}`
                                    : ''}
                                )
                            </>
                        )}
                        .
                    </p>

                    {userError && <Alert type="error">{userError}</Alert>}

                    <DashboardTabsBar
                        activeTab={activeTab}
                        onTabChange={setActiveTab}
                    />

                    {activeTab === 'machines' && (
                        <MachinesTab accessToken={accessToken}/>
                    )}
                    {activeTab === 'maintenance' && (
                        <MaintenanceTab accessToken={accessToken}/>
                    )}
                    {activeTab === 'claims' && (
                        <ClaimsTab
                            accessToken={accessToken}
                            userRole={currentUser?.profile?.role}
                        />
                    )}

                    <p className="search-help" style={{marginTop: '0.75rem'}}>
                        <Link to="/" className="back-link">
                            ← Вернуться на страницу гостевого поиска
                        </Link>
                    </p>
                </section>
            </main>

            <footer className="app-footer" role="contentinfo">
                <div className="app-footer-inner">
                    <div>© {new Date().getFullYear()} «Силант». Все права защищены.</div>
                    <div>Сервисный контроль эксплуатации вилочных погрузчиков.</div>
                </div>
            </footer>
        </div>
    )
}

export default DashboardPage
