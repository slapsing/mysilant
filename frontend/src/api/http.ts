export const API_BASE_URL = 'http://127.0.0.1:8000'

export function buildQuery(
    params: Record<string, string | number | null | undefined>,
): string {
    const entries = Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== null && String(value) !== '',
    )

    const searchParams = new URLSearchParams()
    for (const [key, value] of entries) {
        searchParams.append(key, String(value))
    }

    return searchParams.toString()
}

async function handleAuthError(response: Response): Promise<never> {
    if (response.status === 401 || response.status === 403) {
        throw new Error('Необходимо войти в систему')
    }
    throw new Error(`Ошибка сервера (${response.status})`)
}

export async function authorizedGet<T>(url: string, accessToken: string): Promise<T> {
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            Accept: 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
    })

    if (!response.ok) {
        await handleAuthError(response)
    }

    const data = (await response.json()) as T
    return data
}

export async function authorizedPost<TRequest, TResponse>(
    url: string,
    accessToken: string,
    body: TRequest,
): Promise<TResponse> {
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
            Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
    })

    if (!response.ok) {
        if (response.status === 400) {
            try {
                const data = (await response.json()) as any
                if (data && typeof data.detail === 'string') {
                    throw new Error(data.detail)
                }
                throw new Error('Ошибка валидации данных')
            } catch (err) {
                if (err instanceof Error) {
                    throw err
                }
                throw new Error('Ошибка валидации данных')
            }
        }

        await handleAuthError(response)
    }

    const data = (await response.json()) as TResponse
    return data
}
