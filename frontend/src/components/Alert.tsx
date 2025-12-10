import React from 'react'

interface AlertProps {
    type?: 'info' | 'error'
    children: React.ReactNode
}

const Alert: React.FC<AlertProps> = ({type = 'info', children}) => {
    const isError = type === 'error'
    const role = isError ? 'alert' : 'status'
    const ariaLive = isError ? 'assertive' : 'polite'

    return (
        <div
            className={`alert alert--${type}`}
            role={role}
            aria-live={ariaLive}
        >
            {children}
        </div>
    )
}

export default Alert
