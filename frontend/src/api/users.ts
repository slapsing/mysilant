import type {UserShort} from '../types/api'
import {API_BASE_URL, authorizedGet} from './http'

export async function fetchCurrentUser(accessToken: string): Promise<UserShort> {
    const url = `${API_BASE_URL}/api/me/`
    return authorizedGet<UserShort>(url, accessToken)
}
