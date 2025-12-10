import {
  API_BASE_URL,
  buildQuery,
  fetchMyMachines,
  fetchReferenceItems,
  type MachineFilters,
} from '../../api/client'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import type { MachineAuthorized, ReferenceItem } from '../../types/api'
import Alert from '../../components/Alert'

interface MachinesTabProps {
  accessToken: string
}

const MachinesTab: React.FC<MachinesTabProps> = ({ accessToken }) => {
  const navigate = useNavigate()

  const [machines, setMachines] = useState<MachineAuthorized[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [machineModels, setMachineModels] = useState<ReferenceItem[]>([])
  const [engineModels, setEngineModels] = useState<ReferenceItem[]>([])
  const [transmissionModels, setTransmissionModels] = useState<ReferenceItem[]>(
    [],
  )
  const [driveAxleModels, setDriveAxleModels] = useState<ReferenceItem[]>([])
  const [steerAxleModels, setSteerAxleModels] = useState<ReferenceItem[]>([])

  const [filters, setFilters] = useState<MachineFilters>({})
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  useEffect(() => {
    const loadRefs = async () => {
      try {
        const [
          machineModelsData,
          engineModelsData,
          transmissionModelsData,
          driveAxleModelsData,
          steerAxleModelsData,
        ] = await Promise.all([
          fetchReferenceItems(accessToken, 'machine_model'),
          fetchReferenceItems(accessToken, 'engine_model'),
          fetchReferenceItems(accessToken, 'transmission_model'),
          fetchReferenceItems(accessToken, 'drive_axle_model'),
          fetchReferenceItems(accessToken, 'steer_axle_model'),
        ])

        setMachineModels(machineModelsData)
        setEngineModels(engineModelsData)
        setTransmissionModels(transmissionModelsData)
        setDriveAxleModels(driveAxleModelsData)
        setSteerAxleModels(steerAxleModelsData)
      } catch (err) {
        console.error('Ошибка при загрузке справочников (машины)', err)
      }
    }

    loadRefs()
  }, [accessToken])

  // экспорт в JSON
  const handleExportJson = async () => {
    try {
      setExportError('')
      setExporting(true)

      const query = buildQuery(filters)
      const params = query ? `${query}&export=1` : 'export=1'
      const url = `${API_BASE_URL}/api/machines/${params ? `?${params}` : ''}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!response.ok) {
        const text = await response.text()
        throw new Error(
          `Ошибка при экспорте машин в JSON: ${response.status} ${text}`,
        )
      }

      const data = await response.json()
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json;charset=utf-8',
      })

      const urlObject = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')

      link.href = urlObject
      link.download = `machines-${timestamp}.json`
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(urlObject)
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Не удалось экспортировать данные машин в JSON'
      setExportError(message)
    } finally {
      setExporting(false)
    }
  }

  // список машин
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await fetchMyMachines(accessToken, filters)
        setMachines(data)
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : 'Ошибка при загрузке списка машин'
        setError(message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [accessToken, filters])

  const handleFilterChange =
    (field: keyof MachineFilters) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      const value = e.target.value
      setFilters((prev) => ({
        ...prev,
        [field]: value ? Number(value) : undefined,
      }))
    }

  return (
    <>
      <div className="filters-row">
        <label className="filter-label">
          Модель техники
          <select
            className="filter-select"
            value={filters.machine_model ?? ''}
            onChange={handleFilterChange('machine_model')}
          >
            <option value="">Все</option>
            {machineModels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-label">
          Модель двигателя
          <select
            className="filter-select"
            value={filters.engine_model ?? ''}
            onChange={handleFilterChange('engine_model')}
          >
            <option value="">Все</option>
            {engineModels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-label">
          Модель трансмиссии
          <select
            className="filter-select"
            value={filters.transmission_model ?? ''}
            onChange={handleFilterChange('transmission_model')}
          >
            <option value="">Все</option>
            {transmissionModels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-label">
          Ведущий мост
          <select
            className="filter-select"
            value={filters.drive_axle_model ?? ''}
            onChange={handleFilterChange('drive_axle_model')}
          >
            <option value="">Все</option>
            {driveAxleModels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>

        <label className="filter-label">
          Управляемый мост
          <select
            className="filter-select"
            value={filters.steer_axle_model ?? ''}
            onChange={handleFilterChange('steer_axle_model')}
          >
            <option value="">Все</option>
            {steerAxleModels.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      {exportError && <Alert type="error">{exportError}</Alert>}

      <div className="form-actions">
        <button
          type="button"
          className="tab-button"
          onClick={handleExportJson}
          disabled={exporting}
        >
          {exporting ? 'Экспорт…' : 'Экспорт в JSON'}
        </button>
      </div>

      {loading && <Alert type="info">Загрузка списка машин…</Alert>}
      {error && <Alert type="error">{error}</Alert>}

      {!loading && !error && machines.length === 0 && (
        <Alert type="info">Доступных машин не найдено.</Alert>
      )}

      {!loading && !error && machines.length > 0 && (
        <div className="table-wrapper">
          <table className="data-table">
            <caption>Список доступных машин</caption>
            <thead>
              <tr>
                <th scope="col">Зав. № машины</th>
                <th scope="col">Модель техники</th>
              </tr>
            </thead>
            <tbody>
              {machines.map((m) => (
                <tr
                  key={m.id}
                  className="clickable-row"
                  tabIndex={0}
                  role="button"
                  onClick={() => navigate(`/app/machines/${m.id}`)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      navigate(`/app/machines/${m.id}`)
                    }
                  }}
                >
                  <td>{m.serial_number}</td>
                  <td>{m.machine_model?.name ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}

export default MachinesTab
