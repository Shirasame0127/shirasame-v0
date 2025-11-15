import Image from "next/image"
import { SocialLinks } from "@/components/social-links"
import type { User } from "@/lib/mock-data/users"

interface ProfileHeaderProps {
  user: User
}

export function ProfileHeader({ user }: ProfileHeaderProps) {
  return (
    <div className="relative overflow-hidden">
      {user.headerImageUrl && (
        <div className="absolute inset-0">
          <Image
            src={user.headerImageUrl || "/placeholder.svg"}
            alt="ヘッダー画像"
            fill
            className="object-cover opacity-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background" />
        </div>
      )}

      {!user.headerImageUrl && <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-background" />}

      <div className="relative py-8 md:py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-4 md:mb-6 inline-block">
            <Image
              src={user.avatarUrl || "/placeholder.svg"}
              alt={user.displayName}
              width={80}
              height={80}
              className="rounded-full border-4 border-background shadow-xl md:w-[120px] md:h-[120px]"
            />
          </div>
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold mb-3 md:mb-4 text-balance">{user.displayName}</h1>
          <p className="text-sm md:text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-6">{user.bio}</p>

          {user.socialLinks && <SocialLinks links={user.socialLinks} />}
        </div>
      </div>
    </div>
  )
}
