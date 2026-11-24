'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  MoreHorizontal,
  Search,
  SquarePen,
  Trash2,
  Upload,
} from 'lucide-react'
import type { Post, PostStatus } from '@/lib/types'
import { StatusBadge } from '@/components/status-badge'
import { PlatformIcon } from '@/components/platform-icon'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { toast } from 'sonner'

const PAGE_SIZE = 6

const statusOptions: { label: string; value: PostStatus | 'all' }[] = [
  { label: 'All statuses', value: 'all' },
  { label: 'Draft', value: 'draft' },
  { label: 'Scheduled', value: 'scheduled' },
  { label: 'Published', value: 'published' },
  { label: 'Failed', value: 'failed' },
]

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function PostsTable({ initialPosts }: { initialPosts: Post[] }) {
  const [posts, setPosts] = useState(initialPosts)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<PostStatus | 'all'>('all')
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [page, setPage] = useState(1)

  const filtered = useMemo(() => {
    return posts.filter((p) => {
      const matchesQuery = p.content.toLowerCase().includes(query.toLowerCase())
      const matchesStatus = status === 'all' || p.status === status
      return matchesQuery && matchesStatus
    })
  }, [posts, query, status])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const allOnPageSelected = pageItems.length > 0 && pageItems.every((p) => selected.has(p.id))

  function toggleAll() {
    const next = new Set(selected)
    if (allOnPageSelected) {
      pageItems.forEach((p) => next.delete(p.id))
    } else {
      pageItems.forEach((p) => next.add(p.id))
    }
    setSelected(next)
  }

  function toggleOne(id: string) {
    const next = new Set(selected)
    next.has(id) ? next.delete(id) : next.add(id)
    setSelected(next)
  }

  function bulkDelete() {
    setPosts((prev) => prev.filter((p) => !selected.has(p.id)))
    toast.success(`Deleted ${selected.size} post${selected.size === 1 ? '' : 's'}`)
    setSelected(new Set())
  }

  function bulkPublish() {
    setPosts((prev) =>
      prev.map((p) =>
        selected.has(p.id)
          ? { ...p, status: 'published' as const, publishedAt: new Date().toISOString() }
          : p,
      ),
    )
    toast.success(`Published ${selected.size} post${selected.size === 1 ? '' : 's'}`)
    setSelected(new Set())
  }

  function deleteOne(id: string) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    toast.success('Post deleted')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 flex-col gap-3 sm:flex-row">
          <div className="relative flex-1 sm:max-w-xs">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search posts..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setPage(1)
              }}
              className="pl-9"
            />
          </div>
          <Select
            value={status}
            onValueChange={(v) => {
              setStatus(v as PostStatus | 'all')
              setPage(1)
            }}
          >
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filter status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selected.size > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{selected.size} selected</span>
            <Button size="sm" variant="outline" onClick={bulkPublish}>
              <Upload className="size-4" />
              Publish
            </Button>
            <Button size="sm" variant="outline" className="text-destructive" onClick={bulkDelete}>
              <Trash2 className="size-4" />
              Delete
            </Button>
          </div>
        ) : (
          <Button render={<Link href="/create" />}>
            <SquarePen className="size-4" />
            New post
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-10">
                <Checkbox checked={allOnPageSelected} onCheckedChange={toggleAll} aria-label="Select all" />
              </TableHead>
              <TableHead>Post</TableHead>
              <TableHead>Platforms</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead className="w-10" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-40 text-center">
                  <Empty>
                    <EmptyMedia>
                      <Search className="size-5" />
                    </EmptyMedia>
                    <EmptyTitle>No posts found</EmptyTitle>
                    <EmptyDescription>Try a different search or status filter.</EmptyDescription>
                  </Empty>
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((post) => (
                <TableRow key={post.id}>
                  <TableCell>
                    <Checkbox
                      checked={selected.has(post.id)}
                      onCheckedChange={() => toggleOne(post.id)}
                      aria-label={`Select post ${post.id}`}
                    />
                  </TableCell>
                  <TableCell className="max-w-sm">
                    <p className="line-clamp-2 text-sm">{post.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1.5">
                      {post.platforms.map((p) => (
                        <PlatformIcon key={p} platform={p} className="size-4" />
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge status={post.status} />
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {formatDate(post.publishedAt ?? post.scheduledAt)}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={<Button variant="ghost" size="icon" className="size-8" />}
                      >
                        <MoreHorizontal className="size-4" />
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem render={<Link href={`/create?id=${post.id}`} />}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => deleteOne(post.id)}
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages} · {filtered.length} posts
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
