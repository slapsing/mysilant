import React, {useState} from 'react'
import {Link, Navigate, useNavigate} from 'react-router-dom'

import {useAuth} from '../auth/AuthContext'
import Alert from '../components/Alert'
import silantLogoRed from '../assets/logo/logo-silant-red.png'

const LoginPage: React.FC = () => {
    const {accessToken, login} = useAuth()
    const navigate = useNavigate()

    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Если уже авторизован — сразу в личный кабинет
    if (accessToken) {
        return <Navigate to="/app" replace/>
    }

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault()
        setError('')

        if (!username.trim() || !password) {
            setError('Введите логин и пароль.')
            return
        }

        try {
            setLoading(true)
            await login(username.trim(), password)
            navigate('/app')
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Не удалось выполнить вход. Проверьте логин и пароль.'
            setError(message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="app-root">
            <a href="#main-content" className="skip-link">
                Перейти к основному содержанию
            </a>

            <header className="app-header" role="banner">
                <div className="app-header-inner">
                    <div className="app-header-top">
                        <div className="app-header-logo">
                            <img
                                src={silantLogoRed}
                                alt="Логотип «Силант»"
                                className="app-logo-img"
                            />
                            <div className="app-header-brand-text">
                                Электронная сервисная книжка «Мой Силант»
                            </div>
                        </div>

                        <div className="app-header-contacts" aria-label="Контактная информация">
                            <a href="tel:+78001234567" className="contact-link">
                                8 800 123-45-67
                            </a>
                            <span className="contact-separator">•</span>
                            <a href="mailto:service@silant.example" className="contact-link">
                                service@silant.example
                            </a>
                        </div>
                    </div>

                    <div className="app-header-bottom">
                        <p className="app-subtitle">
                            Вход в личный кабинет для клиентов, сервисных организаций и менеджеров.
                        </p>
                    </div>
                </div>
            </header>

            <main
                id="main-content"
                className="app-main"
                role="main"
                aria-labelledby="login-heading"
            >
                <section className="card" aria-describedby="login-help">
                    <h1 id="login-heading" className="card-title">
                        Вход в личный кабинет
                    </h1>

                    <p id="login-help" className="search-help">
                        Используйте учётную запись, выданную отделом сервиса. Самостоятельная
                        регистрация недоступна.
                    </p>

                    {error && <Alert type="error">{error}</Alert>}

                    <form
                        className="search-form"
                        onSubmit={handleSubmit}
                        aria-label="Форма входа в личный кабинет"
                    >
                        <div className="search-form-row">
                            <label htmlFor="username" className="search-form-label">
                                Логин
                            </label>
                            <input
                                id="username"
                                className="search-input"
                                type="text"
                                autoComplete="username"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                placeholder="Например, client01"
                                aria-required="true"
                            />
                        </div>

                        <div className="search-form-row">
                            <label htmlFor="password" className="search-form-label">
                                Пароль
                            </label>
                            <input
                                id="password"
                                className="search-input"
                                type="password"
                                autoComplete="current-password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                aria-required="true"
                            />
                        </div>

                        <div className="search-form-row">
                            <button
                                type="submit"
                                className="search-button"
                                disabled={loading || !username.trim() || !password}
                            >
                                {loading ? 'Вход…' : 'Войти'}
                            </button>
                        </div>
                    </form>

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

export default LoginPage
