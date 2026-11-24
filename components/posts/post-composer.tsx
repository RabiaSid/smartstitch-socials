'use client'

import { useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  AtSign,
  Clock,
  Globe,
  Hash,
  ImagePlus,
  Save,
  Send,
  Smile,
  Upload,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import type { Platform } from '@/lib/types'
import { timezones } from '@/lib/data'
import { PlatformIcon, platformMeta } from '@/components/platform-icon'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

import { PLATFORMS, platformConfig } from '@/lib/platforms'

const MAX_CHARS = 2200

export function PostComposer() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [content, setContent] = useState('')
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['instagram'])
  const [mediaPreviews, setMediaPreviews] = useState<{ name: string; url: string; type: string }[]>([])
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [timezone, setTimezone] = useState(timezones[0])
  const [isDragging, setIsDragging] = useState(false)

  const charCount = content.length
  const overLimit = charCount > MAX_CHARS

  function togglePlatform(p: Platform) {
    if (!platformConfig[p].enabled) {
      toast(platformConfig[p].disabledNote)
      return
    }
    setSelectedPlatforms((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    )
  }

  function handleFiles(files: FileList | null) {
    if (!files) return
    const next = Array.from(files).map((f) => ({
      name: f.name,
      url: URL.createObjectURL(f),
      type: f.type.startsWith('video') ? 'video' : 'image',
    }))
    setMediaPreviews((prev) => [...prev, ...next])
  }

  function removeMedia(index: number) {
    setMediaPreviews((prev) => prev.filter((_, i) => i !== index))
  }

  function validate() {
    if (!content.trim()) {
      toast.error('Write something before saving')
      return false
    }
    if (selectedPlatforms.length === 0) {
      toast.error('Select at least one platform')
      return false
    }
    return true
  }

  function saveDraft() {
    if (!content.trim()) {
      toast.error('Write something before saving')
      return
    }
    toast.success('Draft saved')
    router.push('/posts')
  }

  function publishNow() {
    if (!validate()) return
    toast.success('Post published')
    router.push('/posts')
  }

  function schedulePost() {
    if (!validate()) return
    if (!date || !time) {
      toast.error('Pick a schedule date and time')
      return
    }
    toast.success(`Post scheduled for ${date} at ${time} (${timezone})`)
    router.push('/calendar')
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="flex flex-col gap-6 lg:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Compose</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="relative">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="What would you like to share with your audience?"
                className="min-h-40 resize-none text-base"
              />
              <div className="mt-2 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                    onClick={() => toast('Emoji picker coming soon')}
                  >
                    <Smile className="size-3.5" /> Emoji
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                    onClick={() => setContent((c) => `${c} #`)}
                  >
                    <Hash className="size-3.5" /> Hashtag
                  </button>
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
                    onClick={() => toast('Mentions coming soon')}
                  >
                    <AtSign className="size-3.5" /> Mention
                  </button>
                </div>
                <span className={cn('font-medium', overLimit ? 'text-destructive' : 'text-muted-foreground')}>
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            </div>

            <Separator />

            <div>
              <Label className="mb-2 block text-sm font-medium">Platforms</Label>
              <div className="flex flex-wrap gap-2">
                {PLATFORMS.map((p) => {
                  const active = selectedPlatforms.includes(p)
                  const enabled = platformConfig[p].enabled
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => togglePlatform(p)}
                      aria-disabled={!enabled}
                      title={enabled ? undefined : platformConfig[p].disabledNote}
                      className={cn(
                        'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition-all',
                        !enabled
                          ? 'cursor-not-allowed border-dashed border-border bg-transparent text-muted-foreground opacity-60'
                          : active
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border bg-transparent text-foreground hover:bg-secondary',
                      )}
                    >
                      <PlatformIcon
                        platform={p}
                        className={cn('size-4', active && 'brightness-0 invert', !enabled && 'grayscale')}
                      />
                      {platformMeta[p].label}
                      {!enabled && (
                        <span className="rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          Soon
                        </span>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>

            <Separator />

            <div>
              <Label className="mb-2 block text-sm font-medium">Media</Label>
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsDragging(true)
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={(e) => {
                  e.preventDefault()
                  setIsDragging(false)
                  handleFiles(e.dataTransfer.files)
                }}
                className={cn(
                  'flex flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed p-8 text-center transition-colors',
                  isDragging ? 'border-gold bg-gold/5' : 'border-border',
                )}
              >
                <span className="flex size-10 items-center justify-center rounded-full bg-secondary">
                  <Upload className="size-5" />
                </span>
                <p className="text-sm font-medium">Drag & drop images or videos</p>
                <p className="text-xs text-muted-foreground">PNG, JPG, MP4 up to 100MB</p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <ImagePlus className="size-4" />
                  Select files
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleFiles(e.target.files)}
                />
              </div>

              {mediaPreviews.length > 0 && (
                <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {mediaPreviews.map((m, i) => (
                    <div key={m.url} className="group relative aspect-square overflow-hidden rounded-lg bg-secondary">
                      {m.type === 'image' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.url} alt={m.name} className="size-full object-cover" />
                      ) : (
                        <video src={m.url} className="size-full object-cover" muted />
                      )}
                      <button
                        type="button"
                        onClick={() => removeMedia(i)}
                        className="absolute right-1 top-1 flex size-5 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
                      >
                        <X className="size-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="font-serif text-xl">Schedule</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <Label htmlFor="date" className="mb-1.5 block text-sm">Date</Label>
              <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div>
              <Label htmlFor="time" className="mb-1.5 block text-sm">Time</Label>
              <Input id="time" type="time" value={time} onChange={(e) => setTime(e.target.value)} />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Timezone</Label>
              <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
                <SelectTrigger>
                  <Globe className="size-4" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timezones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <div className="flex flex-wrap justify-end gap-3">
          <Button variant="outline" onClick={saveDraft}>
            <Save className="size-4" />
            Save draft
          </Button>
          <Button variant="outline" onClick={publishNow}>
            <Send className="size-4" />
            Publish now
          </Button>
          <Button onClick={schedulePost}>
            <Clock className="size-4" />
            Schedule
          </Button>
        </div>
      </div>

      <div className="lg:col-span-1">
        <Card className="sticky top-6">
          <CardHeader>
            <CardTitle className="font-serif text-xl">Preview</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {selectedPlatforms.length === 0 ? (
              <p className="text-sm text-muted-foreground">Select a platform to preview your post.</p>
            ) : (
              selectedPlatforms.map((p) => (
                <div key={p} className="overflow-hidden rounded-xl border">
                  <div className="flex items-center gap-2 border-b bg-secondary/50 px-3 py-2">
                    <PlatformIcon platform={p} />
                    <span className="text-xs font-medium">{platformMeta[p].label} preview</span>
                  </div>
                  <div className="p-3">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="flex size-7 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                        SS
                      </span>
                      <div>
                        <p className="text-xs font-semibold">Smart Stitch</p>
                        <p className="text-[10px] text-muted-foreground">Just now</p>
                      </div>
                    </div>
                    <p className="whitespace-pre-wrap text-sm text-pretty">
                      {content || 'Your post content will appear here...'}
                    </p>
                    {mediaPreviews[0] && (
                      <div className="mt-2 aspect-video overflow-hidden rounded-lg bg-secondary">
                        {mediaPreviews[0].type === 'image' ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={mediaPreviews[0].url} alt="" className="size-full object-cover" />
                        ) : (
                          <video src={mediaPreviews[0].url} className="size-full object-cover" muted />
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
