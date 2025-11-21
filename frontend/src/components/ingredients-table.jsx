import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext,PaginationPrevious } from '@/components/ui/pagination'
import { publicApi } from '@/lib/axios'

import DeleteIngredientButton from './delete-ingredient-button'
import EditIngredientButton from './edit-ingredient-button'
import { DataTable } from './ui/data-table'

const columnsDef = [
    {
        accessorKey: 'name',
        header: 'Nome',
    },
    {
        accessorKey: 'unit',
        header: 'Unidade',
    },
    {
        accessorKey: 'stockQuantity',
        header: 'Quantidade em Estoque',
    },
    {
        accessorKey: 'expiryDate',
        header: 'Data de Validade',
        cell: ({ getValue }) => {
            const val = getValue()
            return val ? new Date(val).toLocaleDateString() : '-'
        },
    },
    {
        accessorKey: 'Actions',
        header: 'Ações',
        cell: () => {
            return <button className="text-blue-600 hover:underline">Editar</button>
        },
    }
]

const IngredientsTable = ({ refreshSignal } = {}) => {
    const [data, setData] = useState([])
    const [total, setTotal] = useState(0)
    const [page, setPage] = useState(1)
    const [limit] = useState(10)
    const [loading, setLoading] = useState(false)
    const location = useLocation()

    const columns = useMemo(() => {
        // rebuild columns so we can close over setData
        return [
            ...columnsDef.slice(0, -1),
            {
                accessorKey: 'Actions',
                header: 'Ações',
                cell: ({ row }) => {
                    const ing = row.original
                    return (
                        <div className="flex items-center gap-2">
                            <EditIngredientButton ingredient={ing} onUpdated={(updated) => {
                                setData((prev) => prev.map(d => d.id === updated.id ? updated : d))
                            }} />
                            <DeleteIngredientButton
                                ingredientId={ing.id}
                                onDeleted={(id) => {
                                    setData((prev) => prev.filter(d => d.id !== id))
                                    setTotal((t) => Math.max(0, t - 1))
                                }}
                                onUpdated={(updated) => {
                                    setData((prev) => prev.map(d => d.id === updated.id ? updated : d))
                                }}
                            />
                        </div>
                    )
                }
            }
        ]
    }, [])

    useEffect(() => {
        let mounted = true

        const load = async () => {
            setLoading(true)
            try {
                    // include date filters from URL if present
                    const params = new URLSearchParams(location.search)
                    params.set('page', String(page))
                    params.set('limit', String(limit))
                    const createdFrom = params.get('createdFrom')
                    const createdTo = params.get('createdTo')
                    const expiryFrom = params.get('expiryFrom')
                    const expiryTo = params.get('expiryTo')

                    // Build query string only with present values
                    const qs = new URLSearchParams()
                    qs.set('page', String(page))
                    qs.set('limit', String(limit))
                    if (createdFrom) qs.set('createdFrom', createdFrom)
                    if (createdTo) qs.set('createdTo', createdTo)
                    if (expiryFrom) qs.set('expiryFrom', expiryFrom)
                    if (expiryTo) qs.set('expiryTo', expiryTo)

                    const res = await publicApi.get(`/ingredients?${qs.toString()}`)
                const body = res.data
                if (!mounted) return
                setData(body.items || [])
                setTotal(body.total || 0)
                setPage(body.page || page)
            } catch (err) {
                console.error('Error loading ingredients', err)
            } finally {
                if (mounted) setLoading(false)
            }
        }

        load()

                return () => {
                        mounted = false
                }
    }, [page, limit, refreshSignal, location.search])

    // listen for global ingredient removal events (dispatched after an operation that results in stock 0)
    useEffect(() => {
        const onIngredientRemoved = (e) => {
            try {
                const id = e?.detail?.id
                if (!id) return
                setData((prev) => prev.filter(d => d.id !== id))
                setTotal((t) => Math.max(0, t - 1))
            } catch {
                // ignore
            }
        }

        window.addEventListener('ingredient:removed', onIngredientRemoved)
        return () => window.removeEventListener('ingredient:removed', onIngredientRemoved)
    }, [])

    return (
        <div>
            <div className="flex items-center justify-between mb-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Ingredientes</h3>
                    <div className="mt-1 text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{total}</span></div>
                </div>
                <div className="flex items-center gap-3">
                    {/* Filter badges from URL */}
                    {(() => {
                        const params = new URLSearchParams(location.search)
                        const createdFrom = params.get('createdFrom')
                        const createdTo = params.get('createdTo')
                        const expiryFrom = params.get('expiryFrom')
                        const expiryTo = params.get('expiryTo')
                        const badges = []
                        if (createdFrom || createdTo) {
                            badges.push({ label: `Registro: ${createdFrom || '-'} → ${createdTo || '-'}` })
                        }
                        if (expiryFrom || expiryTo) {
                            badges.push({ label: `Validade: ${expiryFrom || '-'} → ${expiryTo || '-'}` })
                        }

                        return (
                            <div className="flex items-center gap-2">
                                {badges.map((b, i) => (
                                    <span key={i} className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border">{b.label}</span>
                                ))}
                            </div>
                        )
                    })()}
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-md overflow-hidden border">
                {loading ? (
                    <div className="p-6 text-center text-gray-600">Carregando...</div>
                ) : (
                    <div className="p-4">
                        <DataTable columns={columns} data={data} />
                    </div>
                )}
            </div>

                            {/* Pagination controls (shadcn) */}
                            <div className="mt-4">
                                <Pagination>
                                    <PaginationContent>
                                        <PaginationItem>
                                            <PaginationPrevious onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} />
                                        </PaginationItem>

                                        {(() => {
                                            const totalPages = Math.max(1, Math.ceil(total / limit))
                                            const maxButtons = 7
                                            let start = Math.max(1, page - 3)
                                            let end = Math.min(totalPages, page + 3)
                                            if (end - start + 1 < maxButtons) {
                                                start = Math.max(1, Math.min(start, totalPages - (maxButtons - 1)))
                                                end = Math.min(totalPages, start + (maxButtons - 1))
                                            }
                                            const items = []
                                            if (start > 1) {
                                                items.push(<PaginationItem key={`p-1`}><PaginationLink onClick={() => setPage(1)} isActive={1 === page}>1</PaginationLink></PaginationItem>)
                                                if (start > 2) items.push(<PaginationItem key={`e-start`}><PaginationEllipsis /></PaginationItem>)
                                            }

                                            for (let p = start; p <= end; p++) {
                                                items.push(
                                                    <PaginationItem key={`p-${p}`}>
                                                        <PaginationLink onClick={() => setPage(p)} isActive={p === page}>{p}</PaginationLink>
                                                    </PaginationItem>
                                                )
                                            }

                                            if (end < totalPages) {
                                                if (end < totalPages - 1) items.push(<PaginationItem key={`e-end`}><PaginationEllipsis /></PaginationItem>)
                                                items.push(<PaginationItem key={`p-last`}><PaginationLink onClick={() => setPage(totalPages)} isActive={totalPages === page}>{totalPages}</PaginationLink></PaginationItem>)
                                            }

                                            return items
                                        })()}

                                        <PaginationItem>
                                            <PaginationNext onClick={() => setPage(p => Math.min(Math.max(1, Math.ceil(total / limit)), p + 1))} disabled={page * limit >= total} />
                                        </PaginationItem>
                                    </PaginationContent>
                                </Pagination>
                            </div>
        </div>
    )
}

export default IngredientsTable