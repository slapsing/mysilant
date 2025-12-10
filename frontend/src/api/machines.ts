import type {MachineAuthorized, MachineDetail} from '../types/api'
import {API_BASE_URL, authorizedGet, buildQuery} from './http'

export interface MachineFilters
    extends Record<string, string | number | null | undefined> {
    machine_model?: number
    engine_model?: number
    transmission_model?: number
    drive_axle_model?: number
    steer_axle_model?: number
}


export async function fetchMyMachines(
    accessToken: string,
    filters: MachineFilters = {},
): Promise<MachineAuthorized[]> {
    const params: Record<string, string | number | null | undefined> = {
        machine_model: filters.machine_model,
        engine_model: filters.engine_model,
        transmission_model: filters.transmission_model,
        steer_axle_model: filters.steer_axle_model,
        drive_axle_model: filters.drive_axle_model,
    }

    const query = buildQuery(params)

    const url =
        query.length > 0
            ? `${API_BASE_URL}/api/machines/?${query}`
            : `${API_BASE_URL}/api/machines/`

    return authorizedGet<MachineAuthorized[]>(url, accessToken)
}

export async function fetchMachineById(
    accessToken: string,
    id: number,
): Promise<MachineDetail> {
    const url = `${API_BASE_URL}/api/machines/${id}/`
    return authorizedGet<MachineDetail>(url, accessToken)
}
