import React, {useEffect, useState} from 'react'
import {useNavigate} from 'react-router-dom'

import {useAuth} from '../../auth/AuthContext'
import type {ReferenceItem, UserShort} from '../../types/api'
import {
    createReferenceItem,
    deleteReferenceItem,
    fetchCurrentUser,
    fetchReferenceItems,
    type ReferenceItemPayload,
    updateReferenceItem,
} from '../../api/client'
import Alert from '../../components/Alert'

const REFERENCE_CATEGORIES: { value: string; label: string }[] = [
    {value: 'machine_model', label: 'Модель техники'},
    {value: 'engine_model', label: 'Модель двигателя'},
    {value: 'transmission_model', label: 'Модель трансмиссии'},
    {value: 'drive_axle_model', label: 'Модель ведущего моста'},
    {value: 'steer_axle_model', label: 'Модель управляемого моста'},
    {value: 'maintenance_type', label: 'Вид ТО'},
    {value: 'service_organization', label: 'Организация, проводившая ТО'},
    {value: 'failure_node', label: 'Узел отказа'},
    {value: 'repair_method', label: 'Способ восстановления'},
]

const ReferenceAdminPage: React.FC = () => {
    const {accessToken, logout} = useAuth()
    const navigate = useNavigate()

    const [currentUser, setCurrentUser] = useState<UserShort | null>(null)
    const [userLoading, setUserLoading] = useState(true)
    const [userError, setUserError] = useState('')

    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const selectedCategoryLabel =
        REFERENCE_CATEGORIES.find((c) => c.value === selectedCategory)?.label ??
        selectedCategory

    const [items, setItems] = useState<ReferenceItem[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const [creating, setCreating] = useState(false)
    const [createError, setCreateError] = useState('')

    const [editingItem, setEditingItem] = useState<ReferenceItem | null>(null)
    const [editError, setEditError] = useState('')

    const [createForm, setCreateForm] = useState({
        name: '',
        description: '',
    })

    const [editForm, setEditForm] = useState({
        name: '',
        description: '',
    })

    if (!accessToken) {
        return null
    }

    // Грузим текущего пользователя, чтобы знать роль
    useEffect(() => {
        const loadUser = async () => {
            try {
                setUserLoading(true)
                setUserError('')
                const me = await fetchCurrentUser(accessToken)
                setCurrentUser(me)
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Ошибка при загрузке данных пользователя'
                setUserError(message)
            } finally {
                setUserLoading(false)
            }
        }

        loadUser()
    }, [accessToken])

    const role = currentUser?.profile?.role

    // Загрузка элементов выбранной категории
    useEffect(() => {
        const load = async () => {
            if (!selectedCategory) {
                setItems([])
                return
            }

            try {
                setLoading(true)
                setError('')
                const data = await fetchReferenceItems(accessToken, selectedCategory)
                setItems(data)
            } catch (err) {
                const message =
                    err instanceof Error
                        ? err.message
                        : 'Ошибка при загрузке элементов справочника'
                setError(message)
            } finally {
                setLoading(false)
            }
        }

        load()
    }, [accessToken, selectedCategory])

    const handleCreateChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const {name, value} = e.target
        setCreateForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleEditChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const {name, value} = e.target
        setEditForm((prev) => ({
            ...prev,
            [name]: value,
        }))
    }

    const handleCreateSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setCreateError('')

        if (!selectedCategory) {
            setCreateError('Сначала выберите тип справочника.')
            return
        }

        if (!createForm.name.trim()) {
            setCreateError('Название элемента обязательно.')
            return
        }

        const payload: ReferenceItemPayload = {
            category: selectedCategory,
            name: createForm.name.trim(),
            description: createForm.description.trim() || null,
        }

        try {
            setCreating(true)
            const created = await createReferenceItem(accessToken, payload)
            setItems((prev) => [...prev, created])
            setCreateForm({name: '', description: ''})
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Ошибка при создании элемента справочника'
            setCreateError(message)
        } finally {
            setCreating(false)
        }
    }

    const startEdit = (item: ReferenceItem) => {
        setEditingItem(item)
        setEditForm({
            name: item.name,
            description: item.description ?? '',
        })
        setEditError('')
    }

    const cancelEdit = () => {
        setEditingItem(null)
        setEditForm({name: '', description: ''})
        setEditError('')
    }

    const handleEditSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!editingItem) return
        setEditError('')

        if (!editForm.name.trim()) {
            setEditError('Название элемента обязательно.')
            return
        }

        const payload: Partial<ReferenceItemPayload> = {
            name: editForm.name.trim(),
            description: editForm.description.trim() || null,
        }

        try {
            const updated = await updateReferenceItem(
                accessToken,
                editingItem.id,
                payload,
            )
            setItems((prev) =>
                prev.map((it) => (it.id === updated.id ? updated : it)),
            )
            cancelEdit()
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Ошибка при обновлении элемента справочника'
            setEditError(message)
        }
    }

    const handleDelete = async (item: ReferenceItem) => {
        const ok = window.confirm(
            `Удалить элемент «${item.name}» из справочника?`,
        )
        if (!ok) return

        try {
            await deleteReferenceItem(accessToken, item.id)
            setItems((prev) => prev.filter((it) => it.id !== item.id))
            if (editingItem && editingItem.id === item.id) {
                cancelEdit()
            }
        } catch (err) {
            const message =
                err instanceof Error
                    ? err.message
                    : 'Ошибка при удалении элемента справочника'
            setError(message)
        }
    }

    return (
        <div className="app-root">
            <a href="#main-content" className="skip-link">
                Перейти к основному содержанию
            </a>

            <header className="app-header" role="banner">
                <div className="app-header-inner">
                    <div className="app-title">«Мой Силант» — справочники</div>
                    <div className="app-subtitle">
                        Управление элементами справочников (доступно менеджеру)
                    </div>
                </div>
            </header>

            <main
                id="main-content"
                className="app-main"
                role="main"
                aria-labelledby="refs-heading"
            >
                <section className="card">
                    <h1 id="refs-heading" className="card-title">
                        Справочники
                    </h1>

                    {userLoading && (
                        <Alert type="info">Загрузка данных пользователя…</Alert>
                    )}
                    {userError && <Alert type="error">{userError}</Alert>}

                    {role !== 'manager' && !userLoading && !userError && (
                        <>
                            <Alert type="error">
                                Раздел управления справочниками доступен только пользователям с
                                ролью «менеджер».
                            </Alert>
                            <p className="search-help">
                                <button
                                    type="button"
                                    className="search-button"
                                    onClick={() => navigate('/app')}
                                >
                                    Вернуться в личный кабинет
                                </button>
                            </p>
                        </>
                    )}

                    {role === 'manager' && (
                        <>
                            <p className="search-help">
                                Выберите тип справочника (например, «Модель техники»), затем добавляйте и
                                редактируйте элементы. Для каждого выбранного типа вы увидите его
                                элементы (название и описание).
                            </p>

                            <div className="filters-row">
                                <label className="filter-label">
                                    Тип справочника
                                    <select
                                        className="filter-select"
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                    >
                                        <option value="">— выберите тип —</option>
                                        {REFERENCE_CATEGORIES.map((c) => (
                                            <option key={c.value} value={c.value}>
                                                {c.label}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>

                            {error && <Alert type="error">{error}</Alert>}

                            {selectedCategory && (
                                <>
                                    {loading ? (
                                        <Alert type="info">
                                            Загрузка элементов справочника…
                                        </Alert>
                                    ) : items.length === 0 ? (
                                        <Alert type="info">
                                            В этом справочнике пока нет элементов. Добавьте первый.
                                        </Alert>
                                    ) : (
                                        <div className="table-wrapper">
                                            <table className="data-table">
                                                <caption>Элементы справочника{selectedCategoryLabel || '—'}</caption>
                                                <thead>
                                                <tr>
                                                    <th scope="col">Название</th>
                                                    <th scope="col">Описание</th>
                                                    <th scope="col">Действия</th>
                                                </tr>
                                                </thead>
                                                <tbody>
                                                {items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{item.name}</td>
                                                        <td>{item.description || '—'}</td>
                                                        <td>
                                                            <button
                                                                type="button"
                                                                className="tab-button"
                                                                onClick={() => startEdit(item)}
                                                            >
                                                                Редактировать
                                                            </button>
                                                            {' '}
                                                            <button
                                                                type="button"
                                                                className="tab-button"
                                                                onClick={() => handleDelete(item)}
                                                            >
                                                                Удалить
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    )}

                                    {/* форма создания */}
                                    <form onSubmit={handleCreateSubmit}>
                                        <h2 className="card-title card-title--small">
                                            Добавить элемент
                                        </h2>

                                        {createError && <Alert type="error">{createError}</Alert>}

                                        <div className="filters-row">
                                            <label className="filter-label filter-label--half">
                                                Название
                                                <input
                                                    className="filter-select"
                                                    name="name"
                                                    type="text"
                                                    value={createForm.name}
                                                    onChange={handleCreateChange}
                                                    required
                                                />
                                            </label>

                                            <label className="filter-label filter-label--wide">
                                                Описание
                                                <textarea
                                                    className="filter-select"
                                                    name="description"
                                                    value={createForm.description}
                                                    onChange={handleCreateChange}
                                                    rows={2}
                                                />
                                            </label>
                                        </div>

                                        <div className="form-actions">
                                            <button
                                                type="submit"
                                                className="search-button"
                                                disabled={creating}
                                            >
                                                {creating ? 'Сохранение…' : 'Добавить элемент'}
                                            </button>
                                        </div>
                                    </form>

                                    {/* форма редактирования */}
                                    {editingItem && (
                                        <form onSubmit={handleEditSubmit}>
                                            <h2 className="card-title card-title--small">
                                                Редактировать элемент «{editingItem.name}»
                                            </h2>

                                            {editError && <Alert type="error">{editError}</Alert>}

                                            <div className="filters-row">
                                                <label className="filter-label filter-label--half">
                                                    Название
                                                    <input
                                                        className="filter-select"
                                                        name="name"
                                                        type="text"
                                                        value={editForm.name}
                                                        onChange={handleEditChange}
                                                        required
                                                    />
                                                </label>

                                                <label className="filter-label filter-label--wide">
                                                    Описание
                                                    <textarea
                                                        className="filter-select"
                                                        name="description"
                                                        value={editForm.description}
                                                        onChange={handleEditChange}
                                                        rows={2}
                                                    />
                                                </label>
                                            </div>

                                            <div className="form-actions">
                                                <button type="submit" className="search-button">
                                                    Сохранить изменения
                                                </button>
                                                {' '}
                                                <button
                                                    type="button"
                                                    className="tab-button"
                                                    onClick={cancelEdit}
                                                >
                                                    Отмена
                                                </button>
                                            </div>
                                        </form>
                                    )}
                                </>
                            )}
                        </>
                    )}
                </section>
            </main>

            <footer className="app-footer" role="contentinfo">
                <div className="app-footer-inner">
                    <div>© {new Date().getFullYear()} «Силант». Все права защищены.</div>
                    <div>
                        <button type="button" className="search-button" onClick={logout}>
                            Выйти
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default ReferenceAdminPage
