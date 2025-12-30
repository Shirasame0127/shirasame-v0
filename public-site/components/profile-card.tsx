"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { SocialLinks } from "@/components/social-links"

type User = {
  displayName: string
  bio?: string
  profileImage?: string // transformed URL from API
  profile_image?: string // alternative snake_case from API
  avatarUrl?: string
  avatar_url?: string
  socialLinks?: Record<string, string>
}

interface ProfileCardProps { user: User }

export function ProfileCard({ user }: ProfileCardProps) {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)
  useEffect(() => {
    // Prefer transformed URL fields returned by public-worker
    const url = (user.profileImage || (user as any).profile_image || user.avatarUrl || (user as any).avatar_url) || null
    setProfileImageUrl(url)
  }, [user])

  return (
    <Card className="profile-card overflow-hidden border-2 shadow-xl w-[90vw] md:w-[85vw] max-w-md mx-auto">
      <CardContent className="p-[5%] text-center">
        <div className="mb-[4%] inline-block">
          <Image
            src={profileImageUrl || "/placeholder.svg"}
            alt={user.displayName || "Profile image"}
            width={120}
            height={120}
            className="rounded-full border-4 border-background shadow-lg w-[26vw] h-[26vw] md:w-[20vw] md:h-[20vw] max-w-[120px] max-h-[120px]"
          />
        </div>
        <h2 className="text-[5.5vw] md:text-xl lg:text-2xl font-bold mb-[2%]">{user.displayName}</h2>
        <p className="text-[3.5vw] md:text-sm lg:text-sm text-muted-foreground mb-[4%] leading-relaxed">{user.bio}</p>
        {user.socialLinks && (
          <div className="mt-[4%]"><SocialLinks links={user.socialLinks} /></div>
        )}
      </CardContent>
    </Card>
  )
}
