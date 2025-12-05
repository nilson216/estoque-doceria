import { Eye, Search } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { useLocation } from 'react-router-dom'

import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter,DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext,PaginationPrevious } from '@/components/ui/pagination'
import { protectedApi } from '@/lib/axios'

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
        meta: { className: 'hidden sm:table-cell' },
    },
    {
        accessorKey: 'stockQuantity',
        header: 'Quantidade em Estoque',
    },
    {
        accessorKey: 'observacao',
        header: 'Observação',
        cell: ({ getValue }) => {
            const val = getValue() || ''
            const short = val && val.length > 80 ? `${val.slice(0,80)}…` : (val || '-')
            return <span title={val}>{short}</span>
        }
    },
    {
        accessorKey: 'expiryDate',
        header: 'Data de Validade',
        meta: { className: 'hidden md:table-cell' },
        cell: ({ getValue }) => {
            const val = getValue()
            if (!val) return '-'
            if (typeof val === 'string') {
                const iso = val.includes('T') ? val.split('T')[0] : val
                return iso
            }
            try {
                return val.toISOString().slice(0, 10)
            } catch {
                return '-'
            }
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
    const [selectedObservacao, setSelectedObservacao] = useState(null)
    const [dialogOpen, setDialogOpen] = useState(false)
    const [nameFilter, setNameFilter] = useState('')
    const [nameQuery, setNameQuery] = useState('')
    const location = useLocation()

    // sync name from URL on load / when location.search changes
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const n = params.get('name') || ''
        setNameFilter(n)
        setNameQuery(n)
    }, [location.search])

    // debounce input -> query
    useEffect(() => {
        const t = setTimeout(() => {
            setNameQuery(nameFilter)
            setPage(1)
        }, 400)
        return () => clearTimeout(t)
    }, [nameFilter])

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
                            <Button variant="ghost" size="sm" title="Ver observação" onClick={() => { if (ing.observacao) { setSelectedObservacao(ing.observacao); setDialogOpen(true) } }}>
                                <Eye className="h-4 w-4" />
                            </Button>
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

    // client-side filtered view (instant feedback while server-side query updates)
    const filteredData = useMemo(() => {
        if (!nameFilter) return data
        const q = nameFilter.toString().toLowerCase()
        return data.filter(d => (d.name || '').toString().toLowerCase().includes(q))
    }, [data, nameFilter])

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
                    const nameParam = nameQuery || params.get('name')

                    // Build query string only with present values
                    const qs = new URLSearchParams()
                    qs.set('page', String(page))
                    qs.set('limit', String(limit))
                    if (createdFrom) qs.set('createdFrom', createdFrom)
                    if (createdTo) qs.set('createdTo', createdTo)
                    if (expiryFrom) qs.set('expiryFrom', expiryFrom)
                    if (expiryTo) qs.set('expiryTo', expiryTo)
                    if (nameParam) qs.set('name', nameParam)

                    const res = await protectedApi.get(`/ingredients?${qs.toString()}`)
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
    }, [page, limit, refreshSignal, location.search, nameQuery])

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

        // listen for stock-zero events so we can update a row to reflect zero stock
        const onStockZero = (e) => {
            try {
                const id = e?.detail?.id
                if (!id) return
                setData((prev) => prev.map(d => d.id === id ? { ...d, stockQuantity: 0 } : d))
            } catch {
                // ignore
            }
        }
        window.addEventListener('ingredient:stockZero', onStockZero)

        return () => {
            window.removeEventListener('ingredient:removed', onIngredientRemoved)
            window.removeEventListener('ingredient:stockZero', onStockZero)
        }
    }, [])

    return (
        <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-4">
                <div>
                    <h3 className="text-xl font-semibold text-gray-800">Ingredientes</h3>
                    <div className="mt-1 text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{total}</span></div>
                </div>
                <div className="flex flex-wrap items-center gap-3">
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
                                    <div className="relative inline-block max-w-xs w-full sm:w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500" />
                                    <Input id="name-filter" placeholder="Nome do ingrediente" value={nameFilter} onChange={(e) => setNameFilter(e.target.value)} className="pl-10 sm:pl-14 w-full bg-transparent text-base text-gray-700 placeholder-gray-500 focus:outline-none" aria-label="Nome do ingrediente" />
                                </div>
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
                        <div className="p-4 overflow-x-auto">
                            <DataTable columns={columns} data={filteredData} />
                        </div>
                    )}
                </div>

            {/* Observação modal */}
            <Dialog open={dialogOpen} onOpenChange={(v) => { setDialogOpen(v); if (!v) setSelectedObservacao(null) }}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Observação</DialogTitle>
                        <DialogDescription>Texto completo da observação do ingrediente.</DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <div className="whitespace-pre-wrap text-sm text-gray-800">{selectedObservacao || '-'}</div>
                    </div>
                    <DialogFooter>
                        <Button onClick={() => setDialogOpen(false)}>Fechar</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

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