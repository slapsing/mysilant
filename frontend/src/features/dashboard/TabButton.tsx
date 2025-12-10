import React from 'react'

interface TabButtonProps
    extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    active: boolean
}

const TabButton: React.FC<TabButtonProps> = ({
                                                 active,
                                                 children,
                                                 ...rest
                                             }) => {
    return (
        <button
            type="button"
            className="tab-button"
            aria-pressed={active}
            aria-current={active ? 'page' : undefined}
            {...rest}
        >
            {children}
        </button>
    )
}

export default TabButton
