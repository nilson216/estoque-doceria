import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import { DataTable } from '@/components/ui/data-table'
import { Dialog, DialogContent, DialogDescription, DialogFooter,DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination'
import { protectedApi,publicApi } from '@/lib/axios'

const baseColumns = [
  { accessorKey: 'type', header: 'Tipo', cell: ({ getValue }) => {
      const v = getValue()
      const color = v === 'ENTRADA' ? 'text-green-600' : 'text-red-600'
      return <span className={`${color} font-semibold`}>{v === 'ENTRADA' ? 'Entrada' : 'Saída'}</span>
  }},
  { accessorKey: 'quantity', header: 'Quantidade' },
  { accessorKey: 'observacao', header: 'Observação', cell: ({ getValue }) => getValue() || '-' },
  { accessorKey: 'createdAt', header: 'Data', cell: ({ getValue }) => new Date(getValue()).toLocaleString() },
]

const MovementsTable = ({ ingredientId, refreshSignal } = {}) => {
  const [data, setData] = useState([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  

  useEffect(() => {
    let mounted = true

    const load = async () => {
      try {
        const qs = new URLSearchParams()
        qs.set('page', String(page))
        qs.set('limit', String(limit))
        const url = ingredientId ? `/ingredients/${ingredientId}/movements?${qs.toString()}` : `/movements?${qs.toString()}`
        const client = ingredientId ? publicApi : protectedApi
        const res = await client.get(url)
        const body = res.data
        if (!mounted) return
        setData(body.items || [])
        setTotal(body.total || 0)
      } catch (err) {
        console.error('Failed load movements', err)
      }
    }

    // initial load
    load()

    // listen for global events indicating a movement was created elsewhere in the app
    const onMovementCreated = (e) => {
      // if the list is scoped to a specific ingredient, only reload when the movement's ingredient matches
      try {
        const mv = e?.detail?.movement
        if (!mv) return
        if (ingredientId && mv.ingredientId !== ingredientId) return
      } catch {
        // ignore parsing errors and reload conservatively
      }
      load()
    }
    window.addEventListener('movement:created', onMovementCreated)

    return () => { mounted = false; window.removeEventListener('movement:created', onMovementCreated) }
  }, [ingredientId, page, limit, refreshSignal])

  const [confirmOpen, setConfirmOpen] = useState(false)
  const [confirmMovement, setConfirmMovement] = useState(null)

  const columns = useMemo(() => {
    return [
      ...baseColumns,
      {
        accessorKey: 'Actions',
        header: 'Ações',
        cell: ({ row }) => {
          const mv = row.original
          return (
            <div className="flex items-center gap-2">
              <Dialog open={confirmOpen && confirmMovement?.id === mv.id} onOpenChange={(open) => {
                setConfirmOpen(open)
                if (!open) setConfirmMovement(null)
              }}>
                <DialogTrigger asChild>
                  <button className="text-red-600 hover:underline text-sm" onClick={() => { setConfirmMovement(mv); setConfirmOpen(true) }}>Remover</button>
                </DialogTrigger>

                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Remover movimentação</DialogTitle>
                    <DialogDescription>Tem certeza que deseja remover esta movimentação?</DialogDescription>
                  </DialogHeader>
                  <div className="mt-2 text-sm">
                    <div>Tipo: <strong>{mv.type === 'ENTRADA' ? 'Entrada' : 'Saída'}</strong></div>
                    <div>Quantidade: <strong>{mv.quantity}</strong></div>
                    <div>Data: <strong>{new Date(mv.createdAt).toLocaleString()}</strong></div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
                    <Button className="ml-2" onClick={async () => {
                      try {
                        await protectedApi.delete(`/movements/${mv.id}`)
                        setData((prev) => prev.filter(d => d.id !== mv.id))
                        setTotal((t) => Math.max(0, t - 1))
                        setConfirmOpen(false)
                        toast.success('Movimentação removida')
                      } catch (err) {
                        console.error('Failed to delete movement', err)
                        toast.error('Erro ao remover movimentação')
                      }
                    }}>Confirmar</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )
        }
      }
    ]
  }, [confirmOpen, confirmMovement])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800">Movimentações</h3>
          <div className="mt-1 text-sm text-gray-500">Total: <span className="font-medium text-gray-700">{total}</span></div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border">
        <div className="p-4">
          <DataTable columns={columns} data={data} />
        </div>
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

export default MovementsTable
