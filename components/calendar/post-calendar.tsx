'use client'

import { useMemo, useState } from 'react'
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  isToday,
  startOfMonth,
  startOfWeek,
  subMonths,
  subWeeks,
} from 'date-fns'
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react'
import { toast } from 'sonner'
import type { Post } from '@/lib/types'
import { PlatformIcon } from '@/components/platform-icon'
import { StatusBadge } from '@/components/status-badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { cn } from '@/lib/utils'

type ViewMode = 'month' | 'week' | 'day'

const statusDot: Record<Post['status'], string> = {
  draft: 'bg-muted-foreground',
  scheduled: 'bg-info',
  published: 'bg-success',
  failed: 'bg-destructive',
}

function postDate(post: Post) {
  return post.scheduledAt || post.publishedAt
}

export function PostCalendar({ posts }: { posts: Post[] }) {
  const [view, setView] = useState<ViewMode>('month')
  const [cursor, setCursor] = useState(() => new Date(posts.find((p) => postDate(p))?.scheduledAt || Date.now()))
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)

  const postsWithDates = useMemo(
    () => posts.filter((p) => postDate(p)) as (Post & { _date: Date })[],
    [posts],
  )

  function postsOnDay(day: Date) {
    return postsWithDates.filter((p) => isSameDay(new Date(postDate(p)!), day))
  }

  function goPrev() {
    if (view === 'month') setCursor((c) => subMonths(c, 1))
    else if (view === 'week') setCursor((c) => subWeeks(c, 1))
    else setCursor((c) => addDays(c, -1))
  }
  function goNext() {
    if (view === 'month') setCursor((c) => addMonths(c, 1))
    else if (view === 'week') setCursor((c) => addWeeks(c, 1))
    else setCursor((c) => addDays(c, 1))
  }

  const monthDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(cursor))
    const end = endOfWeek(endOfMonth(cursor))
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const weekDays = useMemo(() => {
    const start = startOfWeek(cursor)
    return eachDayOfInterval({ start, end: addDays(start, 6) })
  }, [cursor])

  const upcoming = useMemo(
    () =>
      postsWithDates
        .filter((p) => new Date(postDate(p)!) >= new Date() && p.status !== 'published')
        .sort((a, b) => new Date(postDate(a)!).getTime() - new Date(postDate(b)!).getTime())
        .slice(0, 5),
    [postsWithDates],
  )

  const headerLabel =
    view === 'day' ? format(cursor, 'EEEE, MMMM d, yyyy') : format(cursor, 'MMMM yyyy')

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-4">
      <Card className="xl:col-span-3">
        <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="size-8" onClick={goPrev}>
              <ChevronLeft className="size-4" />
            </Button>
            <CardTitle className="min-w-40 text-center font-serif text-xl sm:text-left">
              {headerLabel}
            </CardTitle>
            <Button variant="outline" size="icon" className="size-8" onClick={goNext}>
              <ChevronRight className="size-4" />
            </Button>
          </div>
          <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
            <TabsList>
              <TabsTrigger value="month">Month</TabsTrigger>
              <TabsTrigger value="week">Week</TabsTrigger>
              <TabsTrigger value="day">Day</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {view === 'month' && (
            <div className="grid grid-cols-7 gap-px overflow-hidden rounded-lg border bg-border">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} className="bg-secondary/60 py-2 text-center text-xs font-medium text-muted-foreground">
                  {d}
                </div>
              ))}
              {monthDays.map((day) => {
                const dayPosts = postsOnDay(day)
                return (
                  <div
                    key={day.toISOString()}
                    className={cn(
                      'min-h-24 bg-card p-1.5 transition-colors',
                      !isSameMonth(day, cursor) && 'bg-muted/30 text-muted-foreground',
                    )}
                  >
                    <span
                      className={cn(
                        'inline-flex size-6 items-center justify-center rounded-full text-xs',
                        isToday(day) && 'bg-gold font-semibold text-gold-foreground',
                      )}
                    >
                      {format(day, 'd')}
                    </span>
                    <div className="mt-1 flex flex-col gap-1">
                      {dayPosts.slice(0, 3).map((post) => (
                        <button
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className="flex items-center gap-1 truncate rounded-md bg-secondary px-1.5 py-0.5 text-left text-[10px] font-medium transition-colors hover:bg-secondary/70"
                        >
                          <span className={cn('size-1.5 shrink-0 rounded-full', statusDot[post.status])} />
                          <span className="truncate">{post.content}</span>
                        </button>
                      ))}
                      {dayPosts.length > 3 && (
                        <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 3} more</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {view === 'week' && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-7">
              {weekDays.map((day) => {
                const dayPosts = postsOnDay(day)
                return (
                  <div key={day.toISOString()} className="rounded-lg border p-2">
                    <p className={cn('mb-2 text-xs font-medium', isToday(day) && 'text-gold')}>
                      {format(day, 'EEE d')}
                    </p>
                    <div className="flex flex-col gap-1.5">
                      {dayPosts.length === 0 && <p className="text-[10px] text-muted-foreground">No posts</p>}
                      {dayPosts.map((post) => (
                        <button
                          key={post.id}
                          onClick={() => setSelectedPost(post)}
                          className="flex items-center gap-1 truncate rounded-md bg-secondary px-1.5 py-1 text-left text-[10px] font-medium hover:bg-secondary/70"
                        >
                          <span className={cn('size-1.5 shrink-0 rounded-full', statusDot[post.status])} />
                          <span className="truncate">{post.content}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {view === 'day' && (
            <div className="flex flex-col gap-2">
              {postsOnDay(cursor).length === 0 && (
                <p className="py-10 text-center text-sm text-muted-foreground">No posts scheduled for this day.</p>
              )}
              {postsOnDay(cursor).map((post) => (
                <button
                  key={post.id}
                  onClick={() => setSelectedPost(post)}
                  className="flex items-center gap-3 rounded-lg border p-3 text-left transition-colors hover:bg-secondary/50"
                >
                  <GripVertical
                    className="size-4 shrink-0 cursor-grab text-muted-foreground"
                    onMouseDown={(e) => {
                      e.stopPropagation()
                      toast('Drag & drop rescheduling coming soon')
                    }}
                  />
                  <span className={cn('size-2 shrink-0 rounded-full', statusDot[post.status])} />
                  <span className="flex-1 truncate text-sm">{post.content}</span>
                  <StatusBadge status={post.status} />
                </button>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-serif text-lg">Upcoming posts</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {upcoming.length === 0 && <p className="text-sm text-muted-foreground">Nothing upcoming.</p>}
          {upcoming.map((post) => (
            <button
              key={post.id}
              onClick={() => setSelectedPost(post)}
              className="flex flex-col gap-1.5 rounded-lg border p-3 text-left transition-colors hover:bg-secondary/50"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-muted-foreground">
                  {format(new Date(postDate(post)!), 'MMM d, h:mm a')}
                </span>
                <div className="flex gap-1">
                  {post.platforms.map((p) => (
                    <PlatformIcon key={p} platform={p} className="size-3.5" />
                  ))}
                </div>
              </div>
              <p className="line-clamp-2 text-sm">{post.content}</p>
            </button>
          ))}
        </CardContent>
      </Card>

      <Dialog open={!!selectedPost} onOpenChange={(open) => !open && setSelectedPost(null)}>
        <DialogContent>
          {selectedPost && (
            <>
              <DialogHeader>
                <DialogTitle className="font-serif">Post details</DialogTitle>
                <DialogDescription>
                  {postDate(selectedPost)
                    ? format(new Date(postDate(selectedPost)!), 'EEEE, MMMM d · h:mm a')
                    : 'No date set'}
                </DialogDescription>
              </DialogHeader>
              <div className="flex flex-col gap-3">
                <p className="text-sm text-pretty">{selectedPost.content}</p>
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    {selectedPost.platforms.map((p) => (
                      <PlatformIcon key={p} platform={p} />
                    ))}
                  </div>
                  <StatusBadge status={selectedPost.status} />
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
