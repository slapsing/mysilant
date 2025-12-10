import React from 'react'
import type {MachinePublic} from '../types/api'

interface MachineDetailsTableProps {
    machine: MachinePublic | null
}

interface Row {
    label: string
    value: string | number | null | undefined
}

const row = (label: string, value: Row['value']): Row => ({label, value})

const MachineDetailsTable: React.FC<MachineDetailsTableProps> = ({machine}) => {
    if (!machine) return null

    const rows: Row[] = [
        row('Зав. № машины', machine.serial_number),
        row('Модель техники', machine.machine_model?.name),
        row('Модель двигателя', machine.engine_model?.name),
        row('Зав. № двигателя', machine.engine_serial_number),
        row('Модель трансмиссии', machine.transmission_model?.name),
        row('Зав. № трансмиссии', machine.transmission_serial_number),
        row('Модель ведущего моста', machine.drive_axle_model?.name),
        row('Зав. № ведущего моста', machine.drive_axle_serial_number),
        row('Модель управляемого моста', machine.steer_axle_model?.name),
        row('Зав. № управляемого моста', machine.steer_axle_serial_number),
    ]

    return (
        <div className="table-wrapper" aria-live="polite">
            <table className="data-table">
                <caption>Технические характеристики (поля 1–10)</caption>
                <tbody>
                {rows.map((r) => {
                    const hasValue =
                        r.value !== null && r.value !== undefined && String(r.value).trim() !== ''
                    if (!hasValue) return null
                    return (
                        <tr key={r.label}>
                            <th scope="row" className="data-table-key">
                                {r.label}
                            </th>
                            <td className="data-table-value">{r.value}</td>
                        </tr>
                    )
                })}
                </tbody>
            </table>
        </div>
    )
}

export default MachineDetailsTable
