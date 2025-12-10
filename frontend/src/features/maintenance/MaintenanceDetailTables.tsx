import React from 'react'
import type {MaintenanceItem} from '../../types/api'

interface MaintenanceDetailTablesProps {
    maintenance: MaintenanceItem
}

const MaintenanceMainSection: React.FC<MaintenanceDetailTablesProps> = ({
                                                                            maintenance,
                                                                        }) => (
    <div className="table-wrapper">
        <table className="data-table">
            <caption>Сведения о техническом обслуживании</caption>
            <tbody>
            <tr>
                <th scope="row" className="data-table-key">
                    Дата проведения ТО
                </th>
                <td className="data-table-value">{maintenance.maintenance_date}</td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Вид ТО
                </th>
                <td className="data-table-value">
                    {maintenance.maintenance_type?.name ?? '—'}
                    {maintenance.maintenance_type?.description && (
                        <div className="search-help">
                            {maintenance.maintenance_type.description}
                        </div>
                    )}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Наработка, м/ч
                </th>
                <td className="data-table-value">
                    {maintenance.operating_time ?? '—'}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    № заказ-наряда
                </th>
                <td className="data-table-value">
                    {maintenance.work_order_number || '—'}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Дата заказ-наряда
                </th>
                <td className="data-table-value">
                    {maintenance.work_order_date || '—'}
                </td>
            </tr>
            </tbody>
        </table>
    </div>
)

const MaintenanceMachineSection: React.FC<MaintenanceDetailTablesProps> = (
    {
        maintenance,
    }) => (
    <div className="table-wrapper">
        <table className="data-table">
            <caption>Машина</caption>
            <tbody>
            <tr>
                <th scope="row" className="data-table-key">
                    Заводской номер
                </th>
                <td className="data-table-value">
                    {maintenance.machine?.serial_number ?? '—'}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Модель техники
                </th>
                <td className="data-table-value">
                    {maintenance.machine?.machine_model?.name ?? '—'}
                </td>
            </tr>
            </tbody>
        </table>
    </div>
)

const MaintenanceOrgSection: React.FC<MaintenanceDetailTablesProps> = (
    {
        maintenance,
    }) => (
    <div className="table-wrapper">
        <table className="data-table">
            <caption>Организации и служебная информация</caption>
            <tbody>
            <tr>
                <th scope="row" className="data-table-key">
                    Организация, проводившая ТО
                </th>
                <td className="data-table-value">
                    {maintenance.service_organization ? (
                        <>
                            {maintenance.service_organization.name}
                            {maintenance.service_organization.description && (
                                <div className="search-help">
                                    {maintenance.service_organization.description}
                                </div>
                            )}
                        </>
                    ) : (
                        '—'
                    )}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Сервисная компания
                </th>
                <td className="data-table-value">
                    {maintenance.service_company
                        ? maintenance.service_company.profile?.organization_name ||
                        maintenance.service_company.username
                        : '—'}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Создано
                </th>
                <td className="data-table-value">{maintenance.created_at}</td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Обновлено
                </th>
                <td className="data-table-value">{maintenance.updated_at}</td>
            </tr>
            </tbody>
        </table>
    </div>
)

const MaintenanceDetailTables: React.FC<MaintenanceDetailTablesProps> = (
    {
        maintenance,
    }) => (
    <>
        <MaintenanceMainSection maintenance={maintenance}/>
        <MaintenanceMachineSection maintenance={maintenance}/>
        <MaintenanceOrgSection maintenance={maintenance}/>
    </>
)

export default MaintenanceDetailTables
