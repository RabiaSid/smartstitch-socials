'use client'

import { useMemo, useRef, useState } from 'react'
import { Film, ImageIcon, Search, Trash2, Upload, X } from 'lucide-react'
import { toast } from 'sonner'
import type { MediaAsset } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Empty, EmptyDescription, EmptyMedia, EmptyTitle } from '@/components/ui/empty'
import { cn } from '@/lib/utils'

export function MediaLibrary({
  initialAssets,
  folders,
}: {
  initialAssets: MediaAsset[]
  folders: string[]
}) {
  const [assets, setAssets] = useState(initialAssets)
  const [activeFolder, setActiveFolder] = useState('All')
  const [query, setQuery] = useState('')
  const [preview, setPreview] = useState<MediaAsset | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      const matchesFolder = activeFolder === 'All' || a.folder === activeFolder
      const matchesQuery = a.name.toLowerCase().includes(query.toLowerCase())
      return matchesFolder && matchesQuery
    })
  }, [assets, activeFolder, query])

  function handleUpload(files: FileList | null) {
    if (!files || files.length === 0) return
    const newAssets: MediaAsset[] = Array.from(files).map((f, i) => ({
      id: `m-new-${Date.now()}-${i}`,
      name: f.name,
      type: f.type.startsWith('video') ? 'video' : 'image',
      url: URL.createObjectURL(f),
      size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
      folder: activeFolder === 'All' ? 'Uncategorized' : activeFolder,
      uploadedAt: new Date().toISOString(),
    }))
    setAssets((prev) => [...newAssets, ...prev])
    toast.success(`Uploaded ${newAssets.length} file${newAssets.length === 1 ? '' : 's'}`)
  }

  function removeAsset(id: string) {
    setAssets((prev) => prev.filter((a) => a.id !== id))
    setPreview(null)
    toast.success('Media deleted')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative flex-1 sm:max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input placeholder="Search media..." value={query} onChange={(e) => setQuery(e.target.value)} className="pl-9" />
        </div>
        <Button onClick={() => fileInputRef.current?.click()}>
          <Upload className="size-4" />
          Upload media
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      <div className="flex flex-wrap gap-2">
        {folders.map((folder) => (
          <button
            key={folder}
            onClick={() => setActiveFolder(folder)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-sm font-medium transition-colors',
              activeFolder === folder
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border bg-transparent hover:bg-secondary',
            )}
          >
            {folder}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <Card className="p-10">
          <Empty>
            <EmptyMedia>
              <ImageIcon className="size-5" />
            </EmptyMedia>
            <EmptyTitle>No media found</EmptyTitle>
            <EmptyDescription>Try a different folder or search term, or upload something new.</EmptyDescription>
          </Empty>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
          {filtered.map((asset) => (
            <button
              key={asset.id}
              onClick={() => setPreview(asset)}
              className="group relative aspect-square overflow-hidden rounded-xl border bg-secondary text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={asset.url || '/placeholder.svg'}
                alt={asset.name}
                className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              {asset.type === 'video' && (
                <span className="absolute right-2 top-2 flex size-6 items-center justify-center rounded-full bg-black/60 text-white">
                  <Film className="size-3.5" />
                </span>
              )}
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                <p className="truncate text-xs font-medium text-white">{asset.name}</p>
                <p className="text-[10px] text-white/70">{asset.size}</p>
              </div>
            </button>
          ))}
        </div>
      )}

      <Dialog open={!!preview} onOpenChange={(open) => !open && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          {preview && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif">{preview.name}</DialogTitle>
              </DialogHeader>
              <div className="overflow-hidden rounded-lg bg-secondary">
                {preview.type === 'image' ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={preview.url || '/placeholder.svg'} alt={preview.name} className="max-h-[60vh] w-full object-contain" />
                ) : (
                  <video src={preview.url} controls className="max-h-[60vh] w-full" />
                )}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{preview.folder}</Badge>
                  <span className="text-xs text-muted-foreground">{preview.size}</span>
                </div>
                <Button variant="outline" size="sm" className="text-destructive" onClick={() => removeAsset(preview.id)}>
                  <Trash2 className="size-4" />
                  Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
