import {API_BASE_URL} from './http'
import type {MachinePublic} from '../types/api'

export async function fetchPublicMachineBySerial(
    serial: string,
): Promise<MachinePublic> {
    const trimmed = serial.trim()
    if (!trimmed) {
        throw new Error('Введите заводской номер машины')
    }

    const url = `${API_BASE_URL}/api/public/machines/search/?serial=${encodeURIComponent(
        trimmed,
    )}`

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    })

    if (response.status === 400) {
        const data = (await response.json().catch(() => null)) as { detail?: string } | null
        throw new Error(data?.detail || 'Некорректный запрос')
    }

    if (response.status === 404) {
        throw new Error('Данных о машине с таким заводским номером нет в системе')
    }

    if (!response.ok) {
        let message = `Ошибка сервера (${response.status})`
        try {
            const data = (await response.json()) as { detail?: string }
            if (data?.detail) message = data.detail
        } catch {
            // ignore
        }
        throw new Error(message)
    }

    const data = (await response.json()) as MachinePublic
    return data
}
