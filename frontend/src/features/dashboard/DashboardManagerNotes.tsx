import React from 'react'
import {Link} from 'react-router-dom'
import {API_BASE_URL} from '../../api/client'

const DashboardManagerNotes: React.FC = () => {
    const apiBase = API_BASE_URL
    const backendRoot = apiBase.replace(/\/api\/?$/, '')
    const swaggerUrl = `${backendRoot}/api/schema/swagger/`
    const redocUrl = `${backendRoot}/api/schema/redoc/`

    return (
        <>
            <p className="search-help">
                Управление элементами справочников доступно в разделе{' '}
                <Link to="/app/references">«Справочники»</Link>.
            </p>
            <p className="search-help">
                Документация по API:{' '}
                <a href={swaggerUrl} target="_blank" rel="noreferrer">
                    Swagger UI
                </a>{' '}
                ·{' '}
                <a href={redocUrl} target="_blank" rel="noreferrer">
                    Redoc
                </a>
                .
            </p>
        </>
    )
}

export default DashboardManagerNotes
