export interface FeatureItem {
    id: string
    label: string
    description?: string
    iconSrc: string
    iconAlt: string
}

export interface FeatureGroup {
    id: string
    title: string
    items: FeatureItem[]
}

export const FEATURE_GROUPS: FeatureGroup[] = [
    {
        id: 'tech',
        title: 'Технологические преимущества',
        items: [
            {
                id: 'diesel',
                label: 'Дизельные двигатели',
                description: 'Надёжные силовые агрегаты под задачи склада и цеха.',
                iconSrc: 'frontend/src/assets/icons/technological/diesel-engine.svg',
                iconAlt: 'Иконка дизельного двигателя',
            },
            {
                id: 'gas-petrol',
                label: 'Газ-бензиновые двигатели',
                description: 'Экономичные решения для помещений и открытых площадок.',
                iconSrc: 'frontend/src/assets/icons/technological/tech-gas-petrol.svg',
                iconAlt: 'Иконка газ-бензинового двигателя',
            },
            {
                id: 'electric',
                label: 'Электрические погрузчики',
                description: 'Бесшумная и экологичная работа внутри помещений.',
                iconSrc: 'frontend/src/assets/icons/technological/electric-engine.svg',
                iconAlt: 'Иконка электрического двигателя',
            },
            {
                id: 'transmission',
                label: 'Трансмиссия и мосты',
                description: 'Продуманная кинематика под тяжёлые режимы.',
                iconSrc: 'frontend/src/assets/icons/technological/transmission.svg',
                iconAlt: 'Иконка трансмиссии',
            },
        ],
    },
    {
        id: 'operation',
        title: 'Эксплуатация',
        items: [
            {
                id: 'conditions-cold',
                label: 'Работа в мороз',
                description: 'Решения, проверенные северными складами.',
                iconSrc: 'frontend/src/assets/icons/exploitation/cold-exploitation.svg',
                iconAlt: 'Иконка снежинки — эксплуатация в мороз',
            },
            {
                id: 'conditions-heat',
                label: 'Работа в жару',
                description: 'Продуманное охлаждение и защита агрегатов.',
                iconSrc: 'frontend/src/assets/icons/exploitation/hot-exploitation.svg',
                iconAlt: 'Иконка солнца — эксплуатация в жару',
            },
            {
                id: 'comfort',
                label: 'Удобство оператора',
                description: 'Эргономичное место оператора и обзорность.',
                iconSrc: 'frontend/src/assets/icons/exploitation/operator-qol.svg',
                iconAlt: 'Иконка кресла — удобство оператора',
            },
            {
                id: 'safety',
                label: 'Безопасность',
                description: 'Комплекс решений по защите людей и техники.',
                iconSrc: 'frontend/src/assets/icons/exploitation/security.svg',
                iconAlt: 'Иконка щита — безопасность',
            },
        ],
    },
    {
        id: 'service',
        title: 'Сервис и ремонт',
        items: [
            {
                id: 'service-centers',
                label: 'Сервисные центры',
                description: 'Сеть партнёров и проверенные сервисные бригады.',
                iconSrc: 'frontend/src/assets/icons/service-department/service-centers.svg',
                iconAlt: 'Иконка карты с метками — сервисные центры',
            },
            {
                id: 'parts',
                label: 'Запчасти в наличии',
                description: 'Склад комплектующих под актуальный парк техники.',
                iconSrc: 'frontend/src/assets/icons/service-department/spare-in-stock.svg',
                iconAlt: 'Иконка ящика с галочкой — запчасти в наличии',
            },
            {
                id: 'hotline',
                label: 'Горячая линия',
                description: 'Консультации и поддержка по технике.',
                iconSrc: 'frontend/src/assets/icons/service-department/hotline.svg',
                iconAlt: 'Иконка наушников — горячая линия',
            },
            {
                id: 'knowledge',
                label: 'База знаний по ремонту',
                description: 'Регламенты, карты ТО и рекомендации по ремонту.',
                iconSrc: 'frontend/src/assets/icons/repair-suitability/knowledge.svg',
                iconAlt: 'Иконка книги и ключа — база знаний',
            },
        ],
    },
    {
        id: 'purchase',
        title: 'Условия покупки',
        items: [
            {
                id: 'wide-choice',
                label: 'Широкий выбор',
                description: 'Разные грузоподъёмности, мачты и конфигурации.',
                iconSrc: 'frontend/src/assets/icons/terms-of-purchase/wide-selection.svg',
                iconAlt: 'Иконка нескольких погрузчиков — широкий выбор',
            },
            {
                id: 'test-drive',
                label: 'Тест-драйв',
                description: 'Возможность попробовать технику в своих условиях.',
                iconSrc: 'frontend/src/assets/icons/terms-of-purchase/test-drive.svg',
                iconAlt: 'Иконка конуса — тест-драйв',
            },
            {
                id: 'leasing',
                label: 'Рассрочка и лизинг',
                description: 'Гибкие финансовые схемы для бизнеса.',
                iconSrc: 'frontend/src/assets/icons/terms-of-purchase/purchase-leasing.svg',
                iconAlt: 'Иконка календаря и рубля — рассрочка',
            },
            {
                id: 'used',
                label: 'Б/У техника',
                description: 'Поддержанные погрузчики с понятной историей.',
                iconSrc: 'frontend/src/assets/icons/terms-of-purchase/used-equipment.svg',
                iconAlt: 'Иконка погрузчика со стрелкой — б/у техника',
            },
        ],
    },
]
