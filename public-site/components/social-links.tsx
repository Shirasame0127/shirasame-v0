"use client"

import Link from "next/link"
import { cn } from "@/lib/utils"
import { Instagram, Twitter, Youtube, Globe, Github } from "lucide-react"

type Props = { links: Record<string, string>; className?: string }

const normalize = (k: string) => k.trim().toLowerCase()

export function SocialLinks({ links, className }: Props) {
  const entries = Object.entries(links || {}).filter(([_, url]) => !!url)
  if (entries.length === 0) return null

  const iconFor = (key: string) => {
    const k = normalize(key)
    if (k.includes("x") || k.includes("twitter")) return <Twitter className="w-4 h-4" />
    if (k.includes("insta")) return <Instagram className="w-4 h-4" />
    if (k.includes("youtube") || k.includes("yt")) return <Youtube className="w-4 h-4" />
    if (k.includes("github")) return <Github className="w-4 h-4" />
    return <Globe className="w-4 h-4" />
  }

  return (
    <div className={cn("flex flex-wrap items-center justify-center gap-2", className)}>
      {entries.map(([key, url]) => (
        <Link key={key} href={url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 px-2 py-1 rounded-md border bg-background hover:bg-muted text-xs">
          {iconFor(key)}
          <span className="truncate max-w-[10rem]">{key}</span>
        </Link>
      ))}
    </div>
  )
}
