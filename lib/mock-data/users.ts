import type { User as SchemaUser } from "@/lib/db/schema"

export type SocialLink = SchemaUser["socialLinks"] extends (infer T)[] ? T : any

export type User = SchemaUser

export const mockUser: User = {
  id: "user-shirasame",
  username: "shirasame",
  displayName: "しらさめ",
  bio: "ガジェットとデスク周りが好きなクリエイター。日々の作業環境を最適化することに情熱を注いでいます。",
  profileImageKey: undefined,
  profileImage: "/minimalist-avatar-profile.jpg",
  headerImageKeys: ["/minimalist-desk-setup-with-keyboard-and-monitor.jpg"],
  headerImages: ["/minimalist-desk-setup-with-keyboard-and-monitor.jpg"],
  headerImageUrl: "/minimalist-desk-setup-with-keyboard-and-monitor.jpg",
  backgroundType: "color",
  backgroundColor: "#ffffff",
  socialLinks: [
    { platform: "x", url: "https://x.com/shirasame", username: "@shirasame" },
    { platform: "youtube", url: "https://youtube.com/@shirasame", username: "@shirasame" },
  ],
  amazonAccessKey: undefined,
  amazonSecretKey: undefined,
  amazonAssociateId: undefined,
  favoriteFonts: [],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2025-01-10T00:00:00Z",
}

export const mockAuthUser = {
  id: "user-shirasame",
  username: "shirasame",
  email: "shirasame.official@gmail.com",
  password: "shirasame",
  createdAt: "2024-01-01T00:00:00Z",
}
