import React from 'react'
import type {UserProfileShort, UserShort} from '../../types/api'

type UserRole = UserProfileShort['role'] | undefined

const ROLE_LABELS: Record<string, string> = {
    client: 'Клиент',
    service: 'Сервисная организация',
    manager: 'Менеджер',
}

interface DashboardUserInfoProps {
    currentUser: UserShort | null
    fallbackUsername?: string | null
}

const DashboardUserInfo: React.FC<DashboardUserInfoProps> = ({
                                                                 currentUser,
                                                                 fallbackUsername,
                                                             }) => {
    const username = currentUser?.username ?? fallbackUsername ?? 'пользователь'
    const role: UserRole = currentUser?.profile?.role
    const organization = currentUser?.profile?.organization_name

    return (
        <p className="search-help">
            Вы вошли как <strong>{username}</strong>
            {role && (
                <>
                    {' '}
                    (роль:{' '}
                    <strong>{ROLE_LABELS[role] ?? role}</strong>
                    {organization ? `, ${organization}` : ''}
                    )
                </>
            )}
            .
        </p>
    )
}

export default DashboardUserInfo
