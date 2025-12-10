import React, {useEffect, useRef, useState} from 'react'
import {Link, useParams} from 'react-router-dom'

import {useAuth} from '../auth/AuthContext'
import {API_BASE_URL} from '../api/client'
import Alert from '../components/Alert'

interface ReferenceItemShort {
    id: number
    name: string
}

interface MachineModelShort {
    id: number
    name: string
}

interface MachineShort {
    id: number
    serial_number: string
    machine_model?: MachineModelShort | null
}

interface UserProfileShort {
    organization_name?: string | null
}

interface UserShort {
    id: number
    username: string
    profile?: UserProfileShort | null
}

interface ClaimDetail {
    id: number
    failure_date: string
    operating_time: number | null
    failure_node: ReferenceItemShort | null
    failure_description: string
    repair_method: ReferenceItemShort | null
    spare_parts: string
    recovery_date: string | null
    downtime: number | null
    machine: MachineShort | null
    service_company: UserShort | null
    created_at: string
    updated_at: string
}

const ClaimDetailPage: React.FC = () => {
    const {id} = useParams<{ id: string }>()
    const {accessToken, logout} = useAuth()

    const [item, setItem] = useState<ClaimDetail | null>(null)
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
                    setError('Некорректный идентификатор рекламации')
                    return
                }

                const base = API_BASE_URL.replace(/\/+$/, '')
                const resp = await fetch(`${base}/api/claims/${numericId}/`, {
                    headers: {
                        Authorization: `Bearer ${accessToken}`,
                        Accept: 'application/json',
                    },
                })

                if (resp.status === 404) {
                    setError('Рекламация не найдена или недоступна.')
                    return
                }

                if (resp.status === 401 || resp.status === 403) {
                    setError('Недостаточно прав для просмотра этой рекламации.')
                    return
                }

                if (!resp.ok) {
                    setError(`Ошибка при загрузке данных рекламации (код ${resp.status}).`)
                    return
                }

                const data = (await resp.json()) as ClaimDetail
                setItem(data)
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Ошибка при загрузке данных рекламации'
                setError(message)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [accessToken, id])

    // Фокус на заголовок после загрузки
    useEffect(() => {
        if (!loading && !error && item && headingRef.current) {
            headingRef.current.focus()
        }
    }, [loading, error, item])

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
                    <div className="app-title">«Мой Силант» — рекламация</div>
                    <div className="app-subtitle">
                        Детальная информация об отказе, ремонте и простое техники
                    </div>
                </div>
            </header>

            <main
                id="main-content"
                className="app-main"
                role="main"
                aria-labelledby="claim-heading"
                aria-busy={loading}
            >
                <section className="card">
                    <h1
                        id="claim-heading"
                        className="card-title"
                        tabIndex={-1}
                        ref={headingRef}
                    >
                        Рекламация №{item?.id ?? ''}
                    </h1>

                    <p className="search-help">
                        <Link to="/app" className="back-link">
                            ← Вернуться к списку рекламаций
                        </Link>
                    </p>

                    {loading && <Alert type="info">Загрузка данных рекламации…</Alert>}
                    {error && <Alert type="error">{error}</Alert>}
                    {!loading && !error && !item && (
                        <Alert type="info">Рекламация не найдена или недоступна.</Alert>
                    )}

                    {!loading && !error && item && (
                        <div className="table-wrapper">
                            <table className="data-table">
                                <caption>Основные данные по рекламации</caption>
                                <tbody>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Дата отказа
                                    </th>
                                    <td className="data-table-value">{item.failure_date}</td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Наработка, м/час
                                    </th>
                                    <td className="data-table-value">
                                        {item.operating_time ?? '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Узел отказа
                                    </th>
                                    <td className="data-table-value">
                                        {item.failure_node?.name ?? '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Описание отказа
                                    </th>
                                    <td className="data-table-value">
                                        {item.failure_description || '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Способ восстановления
                                    </th>
                                    <td className="data-table-value">
                                        {item.repair_method?.name ?? '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Использованные запасные части
                                    </th>
                                    <td className="data-table-value">
                                        {item.spare_parts || '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Дата восстановления
                                    </th>
                                    <td className="data-table-value">
                                        {item.recovery_date || '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Время простоя техники (дней)
                                    </th>
                                    <td className="data-table-value">
                                        {item.downtime ?? '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Зав. № машины
                                    </th>
                                    <td className="data-table-value">
                                        {item.machine?.serial_number ?? '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Модель техники
                                    </th>
                                    <td className="data-table-value">
                                        {item.machine?.machine_model?.name ?? '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Сервисная компания
                                    </th>
                                    <td className="data-table-value">
                                        {item.service_company?.profile?.organization_name ||
                                            item.service_company?.username ||
                                            '—'}
                                    </td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Создано
                                    </th>
                                    <td className="data-table-value">{item.created_at}</td>
                                </tr>
                                <tr>
                                    <th scope="row" className="data-table-key">
                                        Обновлено
                                    </th>
                                    <td className="data-table-value">{item.updated_at}</td>
                                </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </section>
            </main>

            <footer className="app-footer" role="contentinfo">
                <div className="app-footer-inner">
                    <div>© {new Date().getFullYear()} «Силант». Все права защищены.</div>
                    <div>Сервисный контроль эксплуатации вилочных погрузчиков.</div>
                    <div>
                        <button type="button" className="secondary-link-button" onClick={logout}>
                            Выйти
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default ClaimDetailPage
