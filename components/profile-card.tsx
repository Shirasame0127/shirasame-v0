// ========================================
// プロフィールカード (ProfileCard)
// ========================================
// ユーザーのアバター、名前、自己紹介、SNSリンクを表示するカードコンポーネントです。
//
// 【カスタマイズできる主な項目】
// - カードの横幅: w-[90vw] md:w-[85vw]（数値を変更）
// - アバター画像サイズ: w-[22vw] h-[22vw] md:w-[18vw] md:h-[18vw]（数値を変更）
// - テキストサイズ: text-[5.5vw]（数値を変更）
// - パディング: p-[5%]（数値を変更）
// - カードの影: shadow-xl（shadow-lg、shadow-mdなど）

import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { SocialLinks } from "@/components/social-links"
import type { User } from "@/lib/mock-data/users"

interface ProfileCardProps {
  user: User
}

export function ProfileCard({ user }: ProfileCardProps) {
  return (
    // カード全体のサイズと位置
    // w-[90vw]: スマホ時の横幅（ビューポート幅の90%）
    // md:w-[85vw]: PC時の横幅（ビューポート幅の85%）
    // max-w-md: 最大幅を制限
    <Card className="overflow-hidden border-2 shadow-xl w-[90vw] md:w-[85vw] max-w-md mx-auto">
      {/* カード内の余白: p-[5%]で相対的なパディング */}
      <CardContent className="p-[5%] text-center">
        {/* アバター画像 */}
        <div className="mb-[4%] inline-block">
          <Image
            src={user.avatarUrl || "/placeholder.svg"}
            alt={user.displayName}
            width={100}
            height={100}
            // 画像サイズをビューポート相対で調整
            // w-[22vw]: スマホ時のサイズ
            // md:w-[18vw]: PC時のサイズ
            // max-w-[100px]: 最大サイズを制限
            className="rounded-full border-4 border-background shadow-lg w-[22vw] h-[22vw] md:w-[18vw] md:h-[18vw] max-w-[100px] max-h-[100px]"
          />
        </div>

        {/* 表示名 */}
        {/* text-[5.5vw]: スマホ時のフォントサイズ（ビューポート幅の5.5%） */}
        {/* md:text-[4vw]: PC時のフォントサイズ */}
        {/* lg:text-2xl: 大画面では固定サイズ */}
        <h2 className="text-[5.5vw] md:text-[4vw] lg:text-2xl font-bold mb-[2%]">{user.displayName}</h2>

        {/* 自己紹介文 */}
        {/* text-[3.5vw]: スマホ時のフォントサイズ */}
        <p className="text-[3.5vw] md:text-[2.5vw] lg:text-sm text-muted-foreground mb-[4%] leading-relaxed">
          {user.bio}
        </p>

        {/* SNSリンクボタン */}
        {user.socialLinks && (
          <div className="mt-[4%]">
            <SocialLinks links={user.socialLinks} />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
