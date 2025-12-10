import type {ClaimItem} from '../types/api'
import {API_BASE_URL, authorizedGet, authorizedPost, buildQuery} from './http'

export interface ClaimFilters {
    failure_node?: number
    repair_method?: number
    service_company_name?: string
}

export interface NewClaimPayload {
    machine_id: number
    failure_date: string
    operating_time?: number | null
    failure_node_id: number
    failure_description: string
    repair_method_id: number
    spare_parts?: string
    recovery_date?: string
}

export async function fetchMyClaims(
    accessToken: string,
    filters: ClaimFilters = {},
): Promise<ClaimItem[]> {
    const params: Record<string, string | number | null | undefined> = {
        failure_node: filters.failure_node,
        repair_method: filters.repair_method,
    }

    if (filters.service_company_name) {
        params['service_company__profile__organization_name'] = filters.service_company_name
    }

    const query = buildQuery(params)

    const url =
        query.length > 0
            ? `${API_BASE_URL}/api/claims/?${query}`
            : `${API_BASE_URL}/api/claims/`

    return authorizedGet<ClaimItem[]>(url, accessToken)
}

export async function createClaim(
    accessToken: string,
    payload: NewClaimPayload,
): Promise<ClaimItem> {
    const url = `${API_BASE_URL}/api/claims/`
    return authorizedPost<NewClaimPayload, ClaimItem>(url, accessToken, payload)
}

export async function fetchClaimById(
    accessToken: string,
    id: number,
): Promise<ClaimItem> {
    const response = await fetch(`${API_BASE_URL}/api/claims/${id}/`, {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const text = await response.text().catch(() => '')
        throw new Error(
            `Не удалось загрузить рекламацию (id=${id}): ${response.status} ${text}`,
        )
    }

    return response.json()
}
