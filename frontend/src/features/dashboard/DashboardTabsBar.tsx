import React from 'react'
import TabButton from './TabButton'

export type DashboardTabId = 'machines' | 'maintenance' | 'claims'

interface DashboardTabsBarProps {
    activeTab: DashboardTabId
    onTabChange: (tab: DashboardTabId) => void
}

const DashboardTabsBar: React.FC<DashboardTabsBarProps> = ({
                                                               activeTab,
                                                               onTabChange,
                                                           }) => {
    return (
        <div
            className="tabs-row"
            role="tablist"
            aria-label="Разделы личного кабинета"
        >
            <TabButton
                active={activeTab === 'machines'}
                onClick={() => onTabChange('machines')}
            >
                Общая информация
            </TabButton>

            <TabButton
                active={activeTab === 'maintenance'}
                onClick={() => onTabChange('maintenance')}
            >
                ТО
            </TabButton>

            <TabButton
                active={activeTab === 'claims'}
                onClick={() => onTabChange('claims')}
            >
                Рекламации
            </TabButton>
        </div>
    )
}

export default DashboardTabsBar
