import React from 'react'
import type {ClaimItem} from '../../types/api'

interface ClaimDetailTablesProps {
    claim: ClaimItem
}

const ClaimMainSection: React.FC<ClaimDetailTablesProps> = ({claim}) => (
    <div className="table-wrapper">
        <table className="data-table">
            <caption>Сведения о рекламации</caption>
            <tbody>
            <tr>
                <th scope="row" className="data-table-key">
                    Дата отказа
                </th>
                <td className="data-table-value">{claim.failure_date}</td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Дата восстановления
                </th>
                <td className="data-table-value">
                    {claim.recovery_date || '—'}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Простой техники, дни
                </th>
                <td className="data-table-value">
                    {claim.downtime ?? '—'}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Наработка, м/ч
                </th>
                <td className="data-table-value">
                    {claim.operating_time ?? '—'}
                </td>
            </tr>
            </tbody>
        </table>
    </div>
)

const ClaimReasonSection: React.FC<ClaimDetailTablesProps> = ({claim}) => (
    <div className="table-wrapper">
        <table className="data-table">
            <caption>Причина отказа и восстановление</caption>
            <tbody>
            <tr>
                <th scope="row" className="data-table-key">
                    Узел отказа
                </th>
                <td className="data-table-value">
                    {claim.failure_node?.name ?? '—'}
                    {claim.failure_node?.description && (
                        <div className="search-help">
                            {claim.failure_node.description}
                        </div>
                    )}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Способ восстановления
                </th>
                <td className="data-table-value">
                    {claim.repair_method?.name ?? '—'}
                    {claim.repair_method?.description && (
                        <div className="search-help">
                            {claim.repair_method.description}
                        </div>
                    )}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Описание отказа
                </th>
                <td className="data-table-value">
                    {claim.failure_description || '—'}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Используемые запасные части
                </th>
                <td className="data-table-value">
                    {claim.spare_parts || '—'}
                </td>
            </tr>
            </tbody>
        </table>
    </div>
)

const ClaimMachineSection: React.FC<ClaimDetailTablesProps> = ({claim}) => (
    <div className="table-wrapper">
        <table className="data-table">
            <caption>Машина и сервис</caption>
            <tbody>
            <tr>
                <th scope="row" className="data-table-key">
                    Заводской номер
                </th>
                <td className="data-table-value">
                    {claim.machine?.serial_number ?? '—'}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Модель техники
                </th>
                <td className="data-table-value">
                    {claim.machine?.machine_model?.name ?? '—'}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Сервисная компания
                </th>
                <td className="data-table-value">
                    {claim.service_company
                        ? claim.service_company.profile?.organization_name ||
                        claim.service_company.username
                        : '—'}
                </td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Создано
                </th>
                <td className="data-table-value">{claim.created_at}</td>
            </tr>
            <tr>
                <th scope="row" className="data-table-key">
                    Обновлено
                </th>
                <td className="data-table-value">{claim.updated_at}</td>
            </tr>
            </tbody>
        </table>
    </div>
)

const ClaimDetailTables: React.FC<ClaimDetailTablesProps> = ({claim}) => (
    <>
        <ClaimMainSection claim={claim}/>
        <ClaimReasonSection claim={claim}/>
        <ClaimMachineSection claim={claim}/>
    </>
)

export default ClaimDetailTables
