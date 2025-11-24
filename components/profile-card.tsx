"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { SocialLinks } from "@/components/social-links"
import { db } from "@/lib/db/storage"
import { getPublicImageUrl } from "@/lib/image-url"
import type { User } from "@/lib/db/schema"

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null)

  useEffect(() => {
    let mounted = true

    // Prefer direct `profile_image` URL when present, otherwise fall back to key mapping
    const raw = user.profileImage || (user.profileImageKey ? db.images.getUpload(user.profileImageKey) : user.avatarUrl || user.profileImage)
    const url = getPublicImageUrl(raw as string) || null
    if (mounted) setProfileImageUrl(url)

    return () => {
      mounted = false
    }
  }, [user])

  return (
    <Card className="overflow-hidden border-2 shadow-xl w-[90vw] md:w-[85vw] max-w-md mx-auto">
      <CardContent className="p-[5%] text-center">
        <div className="mb-[4%] inline-block">
          <Image
            src={profileImageUrl || "/placeholder.svg"}
            alt={user.displayName}
            width={100}
            height={100}
            className="rounded-full border-4 border-background shadow-lg w-[22vw] h-[22vw] md:w-[18vw] md:h-[18vw] max-w-[100px] max-h-[100px]"
          />
        </div>

        <h2 className="text-[5.5vw] md:text-xl lg:text-2xl font-bold mb-[2%]">{user.displayName}</h2>

        <p className="text-[3.5vw] md:text-sm lg:text-sm text-muted-foreground mb-[4%] leading-relaxed">
          {user.bio}
        </p>

        {user.socialLinks && (
          <div className="mt-[4%]">
            <SocialLinks links={user.socialLinks} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
