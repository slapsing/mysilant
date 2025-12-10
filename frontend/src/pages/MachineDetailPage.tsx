import React, {useEffect, useRef, useState} from 'react'
import {Link, useParams} from 'react-router-dom'

import {useAuth} from '../auth/AuthContext'
import {fetchMachineById} from '../api/client'
import type {MachineDetail} from '../types/api'
import Alert from '../components/Alert'

const MachineDetailPage: React.FC = () => {
    const {id} = useParams<{ id: string }>()
    const {accessToken, logout} = useAuth()

    const [machine, setMachine] = useState<MachineDetail | null>(null)
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
                    setError('Некорректный идентификатор машины')
                    return
                }

                const data = await fetchMachineById(accessToken, numericId)
                setMachine(data)
            } catch (err) {
                const message =
                    err instanceof Error ? err.message : 'Ошибка при загрузке данных машины'
                setError(message)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [accessToken, id])

    // Фокус на заголовок после загрузки
    useEffect(() => {
        if (!loading && !error && machine && headingRef.current) {
            headingRef.current.focus()
        }
    }, [loading, error, machine])

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
                    <div className="app-title">«Мой Силант» — машина</div>
                    <div className="app-subtitle">
                        Детальная информация о характеристиках и эксплуатации
                    </div>
                </div>
            </header>

            <main
                id="main-content"
                className="app-main"
                role="main"
                aria-labelledby="machine-heading"
                aria-busy={loading}
            >
                <section className="card">
                    <h1
                        id="machine-heading"
                        className="card-title"
                        tabIndex={-1}
                        ref={headingRef}
                    >
                        Машина {machine?.serial_number ?? ''}
                    </h1>

                    <p className="search-help">
                        <Link to="/app" className="back-link">
                            ← Вернуться к списку машин
                        </Link>
                    </p>

                    {loading && <Alert type="info">Загрузка данных машины…</Alert>}
                    {error && <Alert type="error">{error}</Alert>}
                    {!loading && !error && !machine && (
                        <Alert type="info">Машина не найдена или недоступна.</Alert>
                    )}

                    {!loading && !error && machine && (
                        <>
                            {/* Технические характеристики */}
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <caption>Технические характеристики</caption>
                                    <tbody>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Заводской номер
                                        </th>
                                        <td className="data-table-value">{machine.serial_number}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Модель техники
                                        </th>
                                        <td className="data-table-value">
                                            {machine.machine_model?.name ?? '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Модель двигателя
                                        </th>
                                        <td className="data-table-value">
                                            {machine.engine_model?.name ?? '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Зав. № двигателя
                                        </th>
                                        <td className="data-table-value">
                                            {machine.engine_serial_number || '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Модель трансмиссии
                                        </th>
                                        <td className="data-table-value">
                                            {machine.transmission_model?.name ?? '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Зав. № трансмиссии
                                        </th>
                                        <td className="data-table-value">
                                            {machine.transmission_serial_number || '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Модель ведущего моста
                                        </th>
                                        <td className="data-table-value">
                                            {machine.drive_axle_model?.name ?? '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Зав. № ведущего моста
                                        </th>
                                        <td className="data-table-value">
                                            {machine.drive_axle_serial_number || '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Модель управляемого моста
                                        </th>
                                        <td className="data-table-value">
                                            {machine.steer_axle_model?.name ?? '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Зав. № управляемого моста
                                        </th>
                                        <td className="data-table-value">
                                            {machine.steer_axle_serial_number || '—'}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* Эксплуатация и договор */}
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <caption>Эксплуатация и договор</caption>
                                    <tbody>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Договор поставки №, дата
                                        </th>
                                        <td className="data-table-value">
                                            {machine.supply_contract || '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Дата отгрузки с завода
                                        </th>
                                        <td className="data-table-value">
                                            {machine.shipment_date || '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Грузополучатель (конечный потребитель)
                                        </th>
                                        <td className="data-table-value">
                                            {machine.consignee || '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Адрес поставки (эксплуатации)
                                        </th>
                                        <td className="data-table-value">
                                            {machine.delivery_address || '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Комплектация (доп. опции)
                                        </th>
                                        <td className="data-table-value">
                                            {machine.equipment || '—'}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>

                            {/* служебное */}
                            <div className="table-wrapper">
                                <table className="data-table">
                                    <caption>Ответственные и служебная информация</caption>
                                    <tbody>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Клиент
                                        </th>
                                        <td className="data-table-value">
                                            {machine.client
                                                ? machine.client.profile?.organization_name ||
                                                machine.client.username
                                                : '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Сервисная компания
                                        </th>
                                        <td className="data-table-value">
                                            {machine.service_company
                                                ? machine.service_company.profile?.organization_name ||
                                                machine.service_company.username
                                                : '—'}
                                        </td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Создано
                                        </th>
                                        <td className="data-table-value">{machine.created_at}</td>
                                    </tr>
                                    <tr>
                                        <th scope="row" className="data-table-key">
                                            Обновлено
                                        </th>
                                        <td className="data-table-value">{machine.updated_at}</td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </>
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

export default MachineDetailPage
