import React from 'react'
import type {MachineDetail} from '../../types/api'

interface MachineDetailTablesProps {
    machine: MachineDetail
}

const MachineTechnicalSection: React.FC<MachineDetailTablesProps> = ({
                                                                         machine,
                                                                     }) => (
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
)

const MachineOperationSection: React.FC<MachineDetailTablesProps> = ({
                                                                         machine,
                                                                     }) => (
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
)

const MachineResponsibleSection: React.FC<MachineDetailTablesProps> = ({
                                                                           machine,
                                                                       }) => (
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
)

const MachineDetailTables: React.FC<MachineDetailTablesProps> = ({
                                                                     machine,
                                                                 }) => (
    <>
        <MachineTechnicalSection machine={machine}/>
        <MachineOperationSection machine={machine}/>
        <MachineResponsibleSection machine={machine}/>
    </>
)

export default MachineDetailTables
