import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type {
  MachineAuthorized,
  MaintenanceItem,
  ReferenceItem,
} from '../../types/api'
import {
  createMaintenance,
  fetchMyMachines,
  fetchMyMaintenance,
  fetchReferenceItems,
  type MaintenanceFilters,
} from '../../api/client'
import Alert from '../../components/Alert'

interface MaintenanceTabProps {
  accessToken: string
}

const MaintenanceTab: React.FC<MaintenanceTabProps> = ({ accessToken }) => {
  const navigate = useNavigate()

  const [items, setItems] = useState<MaintenanceItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [maintenanceTypes, setMaintenanceTypes] = useState<ReferenceItem[]>([])
  const [serviceOrganizations, setServiceOrganizations] = useState<
    ReferenceItem[]
  >([])
  const [availableMachines, setAvailableMachines] = useState<
    MachineAuthorized[]
  >([])

  const [filters, setFilters] = useState<MaintenanceFilters>({})

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [formValues, setFormValues] = useState({
    machine_id: '',
    maintenance_type_id: '',
    maintenance_date: '',
    operating_time: '',
    work_order_number: '',
    work_order_date: '',
    service_organization_id: '',
  })

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  // справочники + список машин
  useEffect(() => {
    const loadRefsAndMachines = async () => {
      try {
        const [types, orgs, machines] = await Promise.all([
          fetchReferenceItems(accessToken, 'maintenance_type'),
          fetchReferenceItems(accessToken, 'service_organization'),
          fetchMyMachines(accessToken, {}),
        ])

        setMaintenanceTypes(types)
        setServiceOrganizations(orgs)
        setAvailableMachines(machines)
      } catch (err) {
        console.error(
          'Ошибка при загрузке справочников или списка машин для формы ТО',
          err,
        )
      }
    }

    loadRefsAndMachines()
  }, [accessToken])

  // список ТО с фильтрами
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchMyMaintenance(accessToken, filters)
        setItems(data)
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Ошибка при загрузке данных ТО'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [accessToken, filters])

  const handleTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFilters((prev) => ({
      ...prev,
      maintenance_type: value ? Number(value) : undefined,
    }))
  }

  const handleSerialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setFilters((prev) => ({
      ...prev,
      machine_serial: value || undefined,
    }))
  }

  const handleServiceCompanyChange = (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const value = e.target.value
    setFilters((prev) => ({
      ...prev,
      service_company_name: value || undefined,
    }))
  }

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError('')

    if (
      !formValues.machine_id ||
      !formValues.maintenance_type_id ||
      !formValues.maintenance_date
    ) {
      setCreateError(
        'Заполните минимум: машину, вид ТО и дату проведения.',
      )
      return
    }

    try {
      setCreating(true)

      const payload = {
        machine_id: Number(formValues.machine_id),
        maintenance_type_id: Number(formValues.maintenance_type_id),
        maintenance_date: formValues.maintenance_date,
        operating_time: formValues.operating_time
          ? Number(formValues.operating_time)
          : undefined,
        work_order_number: formValues.work_order_number || undefined,
        work_order_date: formValues.work_order_date || undefined,
        service_organization_id: formValues.service_organization_id
          ? Number(formValues.service_organization_id)
          : undefined,
      }

      await createMaintenance(accessToken, payload)

      const updated = await fetchMyMaintenance(accessToken, filters)
      setItems(updated)

      setShowCreateForm(false)
      setFormValues({
        machine_id: '',
        maintenance_type_id: '',
        maintenance_date: '',
        operating_time: '',
        work_order_number: '',
        work_order_date: '',
        service_organization_id: '',
      })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ошибка при создании записи ТО'
      setCreateError(message)
    } finally {
      setCreating(false)
    }
  }

  const handleExportJson = () => {
    try {
      setExportError('')
      setExporting(true)

      const blob = new Blob([JSON.stringify(items, null, 2)], {
        type: 'application/json;charset=utf-8',
      })

      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

      link.href = url
      link.download = `maintenance-${timestamp}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось экспортировать данные ТО в JSON'
      setExportError(message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="filters-row filters-row--bottom">
        <label className="filter-label">
          Вид ТО
          <select
            className="filter-select"
            value={filters.maintenance_type ?? ''}
            onChange={handleTypeChange}
          >
            <option value="">Все</option>
            {maintenanceTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-label">
          Зав. № машины
          <input
            className="filter-select"
            type="text"
            value={filters.machine_serial ?? ''}
            onChange={handleSerialChange}
            placeholder="Например, MACH-001"
          />
        </label>

        <label className="filter-label">
          Сервисная компания
          <input
            className="filter-select"
            type="text"
            value={filters.service_company_name ?? ''}
            onChange={handleServiceCompanyChange}
            placeholder="Часть названия организации"
          />
        </label>

        <div className="tabs-row__spacer">
          <button
            type="button"
            className="search-button"
            onClick={() => setShowCreateForm((prev) => !prev)}
          >
            {showCreateForm ? 'Скрыть форму ТО' : 'Добавить ТО'}
          </button>
        </div>
      </div>

      {exportError && <Alert type="error">{exportError}</Alert>}

      <div className="form-actions">
        <button
          type="button"
          className="tab-button"
          onClick={handleExportJson}
          disabled={exporting || items.length === 0}
        >
          {exporting ? 'Экспорт…' : 'Экспорт в JSON'}
        </button>
      </div>

      {showCreateForm && (
        <form className="card card--with-margin" onSubmit={handleCreateSubmit}>
          <h2 className="card-title card-title--small">Новая запись ТО</h2>

          {createError && <Alert type="error">{createError}</Alert>}

          <div className="filters-row">
            <label className="filter-label">
              Машина
              <select
                className="filter-select"
                name="machine_id"
                value={formValues.machine_id}
                onChange={handleFormChange}
                required
              >
                <option value="">Выберите машину</option>
                {availableMachines.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.serial_number}{' '}
                    {m.machine_model?.name ? `(${m.machine_model.name})` : ''}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-label">
              Вид ТО
              <select
                className="filter-select"
                name="maintenance_type_id"
                value={formValues.maintenance_type_id}
                onChange={handleFormChange}
                required
              >
                <option value="">Выберите вид ТО</option>
                {maintenanceTypes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-label">
              Дата проведения ТО
              <input
                className="filter-select"
                type="date"
                name="maintenance_date"
                value={formValues.maintenance_date}
                onChange={handleFormChange}
                required
              />
            </label>

            <label className="filter-label">
              Наработка, м/час
              <input
                className="filter-select"
                type="number"
                name="operating_time"
                value={formValues.operating_time}
                onChange={handleFormChange}
                min={0}
              />
            </label>
          </div>

          <div className="filters-row">
            <label className="filter-label">
              № заказ-наряда
              <input
                className="filter-select"
                type="text"
                name="work_order_number"
                value={formValues.work_order_number}
                onChange={handleFormChange}
              />
            </label>

            <label className="filter-label">
              Дата заказ-наряда
              <input
                className="filter-select"
                type="date"
                name="work_order_date"
                value={formValues.work_order_date}
                onChange={handleFormChange}
              />
            </label>

            <label className="filter-label">
              Организация, проводившая ТО
              <select
                className="filter-select"
                name="service_organization_id"
                value={formValues.service_organization_id}
                onChange={handleFormChange}
              >
                <option value="">Не указано</option>
                {serviceOrganizations.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" className="search-button" disabled={creating}>
              {creating ? 'Сохранение…' : 'Сохранить ТО'}
            </button>
          </div>
        </form>
      )}

      {loading && <Alert type="info">Загрузка информации о ТО…</Alert>}
      {error && <Alert type="error">{error}</Alert>}
      {!loading && !error && items.length === 0 && (
        <Alert type="info">Записей о ТО не найдено.</Alert>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <caption>История технического обслуживания</caption>
            <thead>
              <tr>
                <th scope="col">Дата ТО</th>
                <th scope="col">Вид ТО</th>
                <th scope="col">Зав. № машины</th>
                <th scope="col">Наработка, м/ч</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr
                  key={m.id}
                  className="clickable-row"
                  tabIndex={0}
                  role="button"
                  onClick={() => navigate(`/app/maintenance/${m.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/app/maintenance/${m.id}`)
                    }
                  }}
                >
                  <td>{m.maintenance_date}</td>
                  <td>{m.maintenance_type?.name ?? '—'}</td>
                  <td>{m.machine?.serial_number}</td>
                  <td>{m.operating_time ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default MaintenanceTab
