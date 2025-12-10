import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type {
  ClaimItem,
  MachineAuthorized,
  ReferenceItem,
  UserProfileShort,
} from '../../types/api'
import {
  type ClaimFilters,
  createClaim,
  fetchMyClaims,
  fetchMyMachines,
  fetchReferenceItems,
} from '../../api/client'
import Alert from '../../components/Alert'

type UserRole = UserProfileShort['role'] | undefined

interface ClaimsTabProps {
  accessToken: string
  userRole: UserRole
}

const ClaimsTab: React.FC<ClaimsTabProps> = ({ accessToken, userRole }) => {
  const navigate = useNavigate()

  const [items, setItems] = useState<ClaimItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [failureNodes, setFailureNodes] = useState<ReferenceItem[]>([])
  const [repairMethods, setRepairMethods] = useState<ReferenceItem[]>([])
  const [availableMachines, setAvailableMachines] = useState<
    MachineAuthorized[]
  >([])
  const [filters, setFilters] = useState<ClaimFilters>({})

  const [showCreateForm, setShowCreateForm] = useState(false)
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState('')

  const [formValues, setFormValues] = useState({
    machine_id: '',
    failure_date: '',
    operating_time: '',
    failure_node_id: '',
    failure_description: '',
    repair_method_id: '',
    spare_parts: '',
    recovery_date: '',
  })

  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  // справочники + список машин
  useEffect(() => {
    const loadRefsAndMachines = async () => {
      try {
        const [nodes, methods, machines] = await Promise.all([
          fetchReferenceItems(accessToken, 'failure_node'),
          fetchReferenceItems(accessToken, 'repair_method'),
          fetchMyMachines(accessToken, {}),
        ])
        setFailureNodes(nodes)
        setRepairMethods(methods)
        setAvailableMachines(machines)
      } catch (err) {
        console.error(
          'Ошибка при загрузке справочников или списка машин (рекламации)',
          err,
        )
      }
    }

    loadRefsAndMachines()
  }, [accessToken])

  // список рекламаций с фильтрами
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchMyClaims(accessToken, filters)
        setItems(data)
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Ошибка при загрузке рекламаций'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [accessToken, filters])

  const handleFailureNodeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFilters((prev) => ({
      ...prev,
      failure_node: value ? Number(value) : undefined,
    }))
  }

  const handleRepairMethodChange = (
    e: React.ChangeEvent<HTMLSelectElement>,
  ) => {
    const value = e.target.value
    setFilters((prev) => ({
      ...prev,
      repair_method: value ? Number(value) : undefined,
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
    e:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
      | React.ChangeEvent<HTMLTextAreaElement>,
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
      !formValues.failure_date ||
      !formValues.failure_node_id ||
      !formValues.repair_method_id ||
      !formValues.failure_description
    ) {
      setCreateError(
        'Заполните минимум: машину, дату отказа, узел отказа, способ восстановления и описание отказа.',
      )
      return
    }

    try {
      setCreating(true)

      const payload = {
        machine_id: Number(formValues.machine_id),
        failure_date: formValues.failure_date,
        operating_time: formValues.operating_time
          ? Number(formValues.operating_time)
          : undefined,
        failure_node_id: Number(formValues.failure_node_id),
        failure_description: formValues.failure_description,
        repair_method_id: Number(formValues.repair_method_id),
        spare_parts: formValues.spare_parts || undefined,
        recovery_date: formValues.recovery_date || undefined,
      }

      await createClaim(accessToken, payload)

      const updated = await fetchMyClaims(accessToken, filters)
      setItems(updated)

      setShowCreateForm(false)
      setFormValues({
        machine_id: '',
        failure_date: '',
        operating_time: '',
        failure_node_id: '',
        failure_description: '',
        repair_method_id: '',
        spare_parts: '',
        recovery_date: '',
      })
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Ошибка при создании рекламации'
      setCreateError(message)
    } finally {
      setCreating(false)
    }
  }

  const canCreate = userRole === 'service' || userRole === 'manager'

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
      link.download = `claims-${timestamp}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось экспортировать данные рекламаций в JSON'
      setExportError(message)
    } finally {
      setExporting(false)
    }
  }

  return (
    <>
      <div className="filters-row" style={{ alignItems: 'flex-end' }}>
        <label className="filter-label">
          Узел отказа
          <select
            className="filter-select"
            value={filters.failure_node ?? ''}
            onChange={handleFailureNodeChange}
          >
            <option value="">Все</option>
            {failureNodes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-label">
          Способ восстановления
          <select
            className="filter-select"
            value={filters.repair_method ?? ''}
            onChange={handleRepairMethodChange}
          >
            <option value="">Все</option>
            {repairMethods.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
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

        {canCreate && (
          <div style={{ marginLeft: 'auto' }}>
            <button
              type="button"
              className="search-button"
              onClick={() => setShowCreateForm((prev) => !prev)}
            >
              {showCreateForm
                ? 'Скрыть форму рекламации'
                : 'Добавить рекламацию'}
            </button>
          </div>
        )}
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

      {canCreate && showCreateForm && (
        <form
          className="card"
          style={{ marginBottom: '0.75rem' }}
          onSubmit={handleCreateSubmit}
        >
          <h2 className="card-title" style={{ fontSize: '1rem' }}>
            Новая рекламация
          </h2>

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
              Дата отказа
              <input
                className="filter-select"
                type="date"
                name="failure_date"
                value={formValues.failure_date}
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
              Узел отказа
              <select
                className="filter-select"
                name="failure_node_id"
                value={formValues.failure_node_id}
                onChange={handleFormChange}
                required
              >
                <option value="">Выберите узел отказа</option>
                {failureNodes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="filter-label">
              Способ восстановления
              <select
                className="filter-select"
                name="repair_method_id"
                value={formValues.repair_method_id}
                onChange={handleFormChange}
                required
              >
                <option value="">Выберите способ восстановления</option>
                {repairMethods.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="filters-row">
            <label className="filter-label" style={{ flex: '1 1 100%' }}>
              Описание отказа
              <textarea
                className="filter-select"
                name="failure_description"
                value={formValues.failure_description}
                onChange={handleFormChange}
                rows={3}
                required
              />
            </label>
          </div>

          <div className="filters-row">
            <label className="filter-label" style={{ flex: '1 1 50%' }}>
              Используемые запасные части
              <textarea
                className="filter-select"
                name="spare_parts"
                value={formValues.spare_parts}
                onChange={handleFormChange}
                rows={2}
              />
            </label>

            <label className="filter-label">
              Дата восстановления
              <input
                className="filter-select"
                type="date"
                name="recovery_date"
                value={formValues.recovery_date}
                onChange={handleFormChange}
              />
            </label>
          </div>

          <div style={{ marginTop: '0.5rem' }}>
            <button type="submit" className="search-button" disabled={creating}>
              {creating ? 'Сохранение…' : 'Сохранить рекламацию'}
            </button>
          </div>
        </form>
      )}

      {loading && <Alert type="info">Загрузка рекламаций…</Alert>}
      {error && <Alert type="error">{error}</Alert>}
      {!loading && !error && items.length === 0 && (
        <Alert type="info">Рекламаций не найдено.</Alert>
      )}

      {!loading && !error && items.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <caption>Рекламации по технике</caption>
            <thead>
              <tr>
                <th scope="col">Дата отказа</th>
                <th scope="col">Зав. № машины</th>
                <th scope="col">Узел отказа</th>
                <th scope="col">Способ восстановления</th>
                <th scope="col">Простой, дни</th>
              </tr>
            </thead>
            <tbody>
              {items.map((c) => (
                <tr
                  key={c.id}
                  className="clickable-row"
                  tabIndex={0}
                  role="button"
                  onClick={() => navigate(`/app/claims/${c.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/app/claims/${c.id}`)
                    }
                  }}
                >
                  <td>{c.failure_date}</td>
                  <td>{c.machine?.serial_number}</td>
                  <td>{c.failure_node?.name ?? '—'}</td>
                  <td>{c.repair_method?.name ?? '—'}</td>
                  <td>{c.downtime ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default ClaimsTab
