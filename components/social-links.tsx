import Link from "next/link"
import { Card } from "@/components/ui/card"
import type { SocialLink } from "@/lib/mock-data/users"
import { Mail, FileText } from "lucide-react"

interface SocialLinksProps {
  links: SocialLink[]
}

const platformConfig = {
  x: {
    name: "X (Twitter)",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    ),
    color: "hover:bg-black hover:text-white",
  },
  tiktok: {
    name: "TikTok",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
      </svg>
    ),
    color: "hover:bg-[#000000] hover:text-white",
  },
  youtube: {
    name: "YouTube",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
      </svg>
    ),
    color: "hover:bg-[#FF0000] hover:text-white",
  },
  instagram: {
    name: "Instagram",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-4.358-.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.266-.057-1.645-.069-4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.69.073 4.948.073 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98-.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    color: "hover:bg-gradient-to-r hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#FCAF45] hover:text-white",
  },
  email: {
    name: "Email",
    icon: <Mail className="w-5 h-5" />,
    color: "hover:bg-gray-600 hover:text-white",
  },
  form: {
    name: "Form",
    icon: <FileText className="w-5 h-5" />,
    color: "hover:bg-blue-600 hover:text-white",
  },
  twitch: {
    name: "Twitch",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714z" />
      </svg>
    ),
    color: "hover:bg-[#9146FF] hover:text-white",
  },
  discord: {
    name: "Discord",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515a.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0a12.64 12.64 0 0 0-.617-1.25a.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057a19.9 19.9 0 0 0 5.993 3.03a.078.078 0 0 0 .084-.028a14.09 14.09 0 0 0 1.226-1.994a.076.076 0 0 0-.041-.106a13.107 13.107 0 0 1-1.872-.892a.077.077 0 0 1-.008-.128a10.2 10.2 0 0 0 .372-.292a.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127a12.299 12.299 0 0 1-1.873.892a.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028a19.839 19.839 0 0 0 6.002-3.03a.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.956-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419c0-1.333.955-2.419 2.157-2.419c1.21 0 2.176 1.096 2.157 2.42c0 1.333-.946 2.418-2.157 2.418z" />
      </svg>
    ),
    color: "hover:bg-[#5865F2] hover:text-white",
  },
  note: {
    name: "note",
    icon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M8.177 3.01c0-1.657 1.34-3 2.998-3h1.65c1.657 0 2.998 1.343 2.998 3v.38c2.925.484 5.177 3.024 5.177 6.09v6.177c0 .758-.275 1.45-.73 1.987l1.463 1.463a1 1 0 0 1-1.414 1.414l-1.463-1.463a2.982 2.982 0 0 1-1.987.73H7.13a2.982 2.982 0 0 1-1.987-.73L3.68 20.521a1 1 0 1 1-1.414-1.414l1.463-1.463a2.982 2.982 0 0 1-.73-1.987V9.48c0-3.066 2.252-5.606 5.177-6.09V3.01z" />
      </svg>
    ),
    color: "hover:bg-[#00B050] hover:text-white",
  },
}

export function SocialLinks({ links }: SocialLinksProps) {
  if (!links || links.length === 0) return null

  return (
    <div className="grid grid-cols-2 gap-2 justify-center max-w-md mx-auto">
      {links.map((link, index) => {
        const config = platformConfig[link.platform]
        if (!config) return null

        const isLastAndOdd = links.length % 2 !== 0 && index === links.length - 1

        return (
          <Link
            key={link.platform}
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className={isLastAndOdd ? "col-span-2" : ""}
          >
            <Card className={`px-3 py-2 transition-all ${config.color} h-full`}>
              <div className="flex items-center gap-2 justify-center">
                {config.icon}
                <span className="font-medium text-xs truncate">{link.username || config.name}</span>
              </div>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
