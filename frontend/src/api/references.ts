import {API_BASE_URL} from './http'
import type {ReferenceItem} from '../types/api'

function authHeaders(accessToken: string, withJson = true): HeadersInit {
    const headers: HeadersInit = {
        Authorization: `Bearer ${accessToken}`,
    }
    if (withJson) {
        headers['Content-Type'] = 'application/json'
    }
    return headers
}

/**
 * Получить элементы справочника по категории.
 * Используется и в фильтрах, и в формах, и в админке справочников.
 */
export async function fetchReferenceItems(
    accessToken: string,
    category?: string,
): Promise<ReferenceItem[]> {
    const params = new URLSearchParams()
    if (category) {
        params.append('category', category)
    }

    const query = params.toString()
    const url = `${API_BASE_URL}/api/references/${query ? `?${query}` : ''}`

    const response = await fetch(url, {
        method: 'GET',
        headers: authHeaders(accessToken, false),
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(
            `Не удалось загрузить элементы справочника: ${response.status} ${text}`,
        )
    }

    return response.json()
}

export interface ReferenceItemPayload {
    category: string
    name: string
    description?: string | null
}

/**
 * Создать элемент справочника (только менеджер).
 */
export async function createReferenceItem(
    accessToken: string,
    payload: ReferenceItemPayload,
): Promise<ReferenceItem> {
    const response = await fetch(`${API_BASE_URL}/api/references/`, {
        method: 'POST',
        headers: authHeaders(accessToken, true),
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(
            `Не удалось создать элемент справочника: ${response.status} ${text}`,
        )
    }

    return response.json()
}

/**
 * Частично обновить элемент справочника (только менеджер).
 */
export async function updateReferenceItem(
    accessToken: string,
    id: number,
    payload: Partial<ReferenceItemPayload>,
): Promise<ReferenceItem> {
    const response = await fetch(`${API_BASE_URL}/api/references/${id}/`, {
        method: 'PATCH',
        headers: authHeaders(accessToken, true),
        body: JSON.stringify(payload),
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(
            `Не удалось обновить элемент справочника: ${response.status} ${text}`,
        )
    }

    return response.json()
}

/**
 * Удалить элемент справочника (только менеджер).
 */
export async function deleteReferenceItem(
    accessToken: string,
    id: number,
): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/api/references/${id}/`, {
        method: 'DELETE',
        headers: authHeaders(accessToken, false),
    })

    if (!response.ok) {
        const text = await response.text()
        throw new Error(
            `Не удалось удалить элемент справочника: ${response.status} ${text}`,
        )
    }
}
