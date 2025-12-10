import type {MaintenanceItem} from '../types/api'
import {API_BASE_URL, authorizedGet, authorizedPost, buildQuery} from './http'

export interface MaintenanceFilters {
    maintenance_type?: number
    machine_serial?: string
    service_company_name?: string
}

export interface NewMaintenancePayload {
    machine_id: number
    maintenance_type_id: number
    maintenance_date: string
    operating_time?: number | null
    work_order_number?: string
    work_order_date?: string
    service_organization_id?: number
}

export async function fetchMyMaintenance(
    accessToken: string,
    filters: MaintenanceFilters = {},
): Promise<MaintenanceItem[]> {
    const params: Record<string, string | number | null | undefined> = {
        maintenance_type: filters.maintenance_type,
    }

    if (filters.machine_serial) {
        params['machine__serial_number'] = filters.machine_serial
    }

    if (filters.service_company_name) {
        params['service_company__profile__organization_name'] = filters.service_company_name
    }

    const query = buildQuery(params)

    const url =
        query.length > 0
            ? `${API_BASE_URL}/api/maintenance/?${query}`
            : `${API_BASE_URL}/api/maintenance/`

    return authorizedGet<MaintenanceItem[]>(url, accessToken)
}

export async function createMaintenance(
    accessToken: string,
    payload: NewMaintenancePayload,
): Promise<MaintenanceItem> {
    const url = `${API_BASE_URL}/api/maintenance/`
    return authorizedPost<NewMaintenancePayload, MaintenanceItem>(url, accessToken, payload)
}

export async function fetchMaintenanceById(
    accessToken: string,
    id: number,
): Promise<MaintenanceItem> {
    const response = await fetch(`${API_BASE_URL}/api/maintenance/${id}/`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(
            `Не удалось загрузить запись ТО (id=${id}): ${response.status} ${text}`,
        )
    }

    return response.json()
}

