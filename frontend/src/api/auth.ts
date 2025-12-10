import {API_BASE_URL} from './client'

export interface TokenResponse {
    access: string
    refresh: string
}

export async function loginRequest(
    username: string,
    password: string,
): Promise<TokenResponse> {
    const response = await fetch(`${API_BASE_URL}/api/auth/token/`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
        },
        body: JSON.stringify({username, password}),
    })

    if (!response.ok) {
        let message = 'Неверный логин или пароль'
        try {
            const data = (await response.json()) as { detail?: string }
            if (data?.detail) message = data.detail
        } catch {
            // ignore
        }
        throw new Error(message)
    }

    const data = (await response.json()) as TokenResponse
    return data
}
