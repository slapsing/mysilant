import React, {useState} from 'react'
import {Link} from 'react-router-dom'

import {useAuth} from '../auth/AuthContext'
import {fetchPublicMachineBySerial} from '../api/client'
import Alert from '../components/Alert'
import MachineDetailsTable from '../components/MachineDetailsTable'
import type {MachinePublic} from '../types/api'
import silantLogoRed from '../assets/logo/logo-silant-red.png'

const PublicMachineSearchPage: React.FC = () => {
    const {accessToken} = useAuth()

    const [serial, setSerial] = useState<string>('')
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string>('')
    const [machine, setMachine] = useState<MachinePublic | null>(null)

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError('')
        setMachine(null)

        try {
            setLoading(true)
            const data = await fetchPublicMachineBySerial(serial)
            setMachine(data)
        } catch (err) {
            const message =
                err instanceof Error ? err.message : 'Произошла ошибка при запросе'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app-root">
            <header className="app-header">
                <div className="app-header-inner">
                    <div className="app-header-top">
                        <Link
                            to={accessToken ? '/app' : '/'}
                            className="app-header-logo app-header-logo--link"
                        >
                            <img
                                src={silantLogoRed}
                                alt="Логотип «Силант»"
                                className="app-logo-img"
                            />
                            <span className="app-header-brand-text">Мой Силант</span>
                        </Link>

                        {/* Контакты */}
                        <div className="app-header-contacts">
                            <a href="tel:+78352201209" className="contact-link">
                                +7 835 220-12-09
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

                        {/* Авторизация */}
                        <div className="app-header-auth">
                            {!accessToken && (
                                <Link
                                    to="/login"
                                    className="primary-link-button primary-link-button--sm"
                                >
                                    Войти в личный кабинет
                                </Link>
                            )}
                            {accessToken && (
                                <Link
                                    to="/app"
                                    className="secondary-link-button secondary-link-button--sm"
                                >
                                    Личный кабинет
                                </Link>
                            )}
                        </div>
                    </div>

                    <div className="app-header-bottom">
                        <div className="app-subtitle">
                            Электронная сервисная книжка «Мой Силант»
                        </div>
                    </div>
                </div>
            </header>

            <main className="app-main">
                <section aria-labelledby="search-heading" className="card">
                    <h1 id="search-heading" className="card-title">
                        Поиск машины по заводскому номеру
                    </h1>

                    <form className="search-form" onSubmit={handleSubmit}>
                        <div className="search-form-row">
                            <label htmlFor="serial-input" className="search-form-label">
                                Заводской номер машины
                            </label>
                            <div className="search-form-input-wrapper">
                                <input
                                    id="serial-input"
                                    className="search-input"
                                    type="text"
                                    autoComplete="off"
                                    value={serial}
                                    onChange={(e) => setSerial(e.target.value)}
                                    placeholder="Например, MACH-001"
                                    aria-required="true"
                                />
                                <button
                                    type="submit"
                                    className="search-button"
                                    disabled={loading || !serial.trim()}
                                >
                                    {loading ? 'Поиск…' : 'Найти'}
                                </button>
                            </div>
                            <p className="search-help">
                                Введите точный заводской номер машины. Гостевой доступ
                                отображает только базовые технические характеристики (поля 1–10).
                            </p>
                        </div>
                    </form>

                    {error && <Alert type="error">{error}</Alert>}

                    {!error && !loading && !machine && (
                        <Alert type="info">
                            Для начала работы укажите заводской номер и нажмите «Найти».
                        </Alert>
                    )}

                    {machine && <MachineDetailsTable machine={machine}/>}
                </section>
            </main>

            <footer className="app-footer">
                <div className="app-footer-inner">
                    <div>© {new Date().getFullYear()} «Силант». Все права защищены.</div>
                    <div>Сервисный контроль эксплуатации вилочных погрузчиков.</div>
                </div>
            </footer>
        </div>
    )
}

export default PublicMachineSearchPage
