import Link from "next/link"
import { format } from "date-fns"
import { CalendarClock } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlatformIcon } from "@/components/platform-icon"
import { StatusBadge } from "@/components/status-badge"
import type { Post } from "@/lib/types"

export function UpcomingPosts({ posts }: { posts: Post[] }) {
  const upcoming = posts
    .filter((p) => p.status === "scheduled" && p.scheduledAt)
    .sort((a, b) => new Date(a.scheduledAt!).getTime() - new Date(b.scheduledAt!).getTime())
    .slice(0, 4)

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div className="flex flex-col gap-1.5">
          <CardTitle className="font-serif text-xl">Up next</CardTitle>
          <CardDescription>Your scheduled queue</CardDescription>
        </div>
        <Button variant="outline" size="sm" render={<Link href="/calendar" />}>
          View calendar
        </Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {upcoming.length === 0 && (
          <div className="flex flex-col items-start gap-3 rounded-lg border border-dashed p-5">
            <p className="text-sm text-muted-foreground">Nothing scheduled yet. Plan your next post.</p>
            <Button size="sm" render={<Link href="/create" />}>
              Create post
            </Button>
          </div>
        )}
        {upcoming.map((post) => (
          <div
            key={post.id}
            className="flex items-start gap-4 rounded-lg border border-border/60 bg-muted/30 p-4 transition-colors hover:bg-muted/60"
          >
            <div className="flex size-10 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
              <CalendarClock className="size-5" />
            </div>
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <p className="line-clamp-2 text-sm leading-relaxed text-foreground">{post.content}</p>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-1.5">
                  {post.platforms.map((p) => (
                    <PlatformIcon key={p} platform={p} className="size-4" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">
                  {format(new Date(post.scheduledAt!), "MMM d, h:mm a")}
                </span>
                <StatusBadge status={post.status} className="ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
