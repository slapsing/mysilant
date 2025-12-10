import React, {useEffect, useRef, useState} from 'react'
import {Link, useParams} from 'react-router-dom'

import {useAuth} from '../auth/AuthContext'
import {fetchMaintenanceById} from '../api/client'
import type {MaintenanceItem} from '../types/api'
import Alert from '../components/Alert'
import MaintenanceDetailTables from '../features/maintenance/MaintenanceDetailTables'

const MaintenanceDetailPage: React.FC = () => {
    const {id} = useParams<{ id: string }>()
    const {accessToken, logout} = useAuth()

    const [maintenance, setMaintenance] = useState<MaintenanceItem | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const headingRef = useRef<HTMLHeadingElement | null>(null)

    useEffect(() => {
        if (!accessToken || !id) return

        const load = async () => {
            try {
                setLoading(true)
                setError('')

                const numericId = Number(id)
                if (Number.isNaN(numericId)) {
                    setError('Некорректный идентификатор записи ТО')
                    return
                }

                const data = await fetchMaintenanceById(accessToken, numericId)
                setMaintenance(data)
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Ошибка при загрузке данных ТО'
                setError(message)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [accessToken, id])

    // Фокус на заголовок после успешной загрузки
    useEffect(() => {
        if (!loading && !error && maintenance && headingRef.current) {
            headingRef.current.focus()
        }
    }, [loading, error, maintenance])

    if (!accessToken) {
        return null
    }

    return (
        <div className="app-root">
            <a href="#main-content" className="skip-link">
                Перейти к основному содержанию
            </a>

            <header className="app-header" role="banner">
                <div className="app-header-inner">
                    <div className="app-title">«Мой Силант» — техническое обслуживание</div>
                    <div className="app-subtitle">
                        Детальная информация о проведённом техническом обслуживании
                    </div>
                </div>
            </header>

            <main
                id="main-content"
                className="app-main"
                role="main"
                aria-labelledby="maintenance-heading"
                aria-busy={loading}
            >
                <section className="card">
                    <h1
                        id="maintenance-heading"
                        className="card-title"
                        tabIndex={-1}
                        ref={headingRef}
                    >
                        Запись ТО №{maintenance?.id ?? ''}
                    </h1>

                    <p className="search-help">
                        <Link to="/app" className="back-link">
                            <span aria-hidden="true">←</span>
                            <span>Вернуться к списку ТО</span>
                        </Link>
                    </p>


                    {loading && <Alert type="info">Загрузка данных ТО…</Alert>}
                    {error && <Alert type="error">{error}</Alert>}
                    {!loading && !error && !maintenance && (
                        <Alert type="info">Запись ТО не найдена или недоступна.</Alert>
                    )}

                    {!loading && !error && maintenance && (
                        <MaintenanceDetailTables maintenance={maintenance}/>
                    )}
                </section>
            </main>

            <footer className="app-footer" role="contentinfo">
                <div className="app-footer-inner">
                    <div>© {new Date().getFullYear()} «Силант». Все права защищены.</div>
                    <div>
                        <button type="button" className="search-button" onClick={logout}>
                            Выйти
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default MaintenanceDetailPage
