// Справочник (ReferenceItemSerializer)
export interface ReferenceItem {
    id: number
    category: string
    name: string
    description: string | null
}

// Публичная машина (MachinePublicSerializer)
export interface MachinePublic {
    serial_number: string

    machine_model: ReferenceItem
    engine_model: ReferenceItem
    engine_serial_number: string

    transmission_model: ReferenceItem
    transmission_serial_number: string

    drive_axle_model: ReferenceItem
    drive_axle_serial_number: string

    steer_axle_model: ReferenceItem
    steer_axle_serial_number: string
}

// Короткий профиль пользователя
export interface UserProfileShort {
    role: 'client' | 'service' | 'manager'
    organization_name: string | null
    phone: string | null
}

// Короткий пользователь
export interface UserShort {
    id: number
    username: string
    first_name: string
    last_name: string
    profile?: UserProfileShort
}

// Укороченная машина (MachineShortSerializer)
export interface MachineShort {
    id: number
    serial_number: string
    machine_model?: ReferenceItem | null
}

// Машина для списков (авторизованный API)
export interface MachineAuthorized extends MachineShort {
}

// Детальная машина (полный MachineSerializer для detail-view)
export interface MachineDetail extends MachineShort {
    engine_model?: ReferenceItem | null
    engine_serial_number: string

    transmission_model?: ReferenceItem | null
    transmission_serial_number: string

    drive_axle_model?: ReferenceItem | null
    drive_axle_serial_number: string

    steer_axle_model?: ReferenceItem | null
    steer_axle_serial_number: string

    supply_contract: string | null
    shipment_date: string | null

    consignee: string | null
    delivery_address: string | null
    equipment: string | null

    client?: UserShort | null
    service_company?: UserShort | null

    created_at: string
    updated_at: string
}

// ТО (MaintenanceSerializer)
export interface MaintenanceItem {
    id: number
    maintenance_type: ReferenceItem
    maintenance_date: string
    operating_time: number | null
    work_order_number: string
    work_order_date: string | null
    service_organization: ReferenceItem | null
    machine: MachineShort
    service_company: UserShort | null
    created_at: string
    updated_at: string
}

// Рекламация (ClaimSerializer)
export interface ClaimItem {
    id: number
    failure_date: string
    operating_time: number | null
    failure_node: ReferenceItem
    failure_description: string
    repair_method: ReferenceItem
    spare_parts: string
    recovery_date: string | null
    downtime: number | null
    machine: MachineShort
    service_company: UserShort | null
    created_at: string
    updated_at: string
}
