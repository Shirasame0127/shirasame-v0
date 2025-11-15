export interface SocialLink {
  platform: "x" | "tiktok" | "youtube" | "instagram"
  url: string
  username: string
}

export interface User {
  id: string
  name: string
  displayName: string
  email: string
  avatarUrl: string
  headerImageUrl?: string
  backgroundColor?: string
  backgroundImageUrl?: string
  role: "owner" | "editor" | "viewer"
  bio?: string
  socialLinks?: SocialLink[]
  createdAt: string
  updatedAt: string
}

export const mockUser: User = {
  id: "user-shirasame",
  name: "shirasame",
  displayName: "しらさめ",
  email: "shirasame@example.com",
  avatarUrl: "/minimalist-avatar-profile.jpg",
  headerImageUrl: "/minimalist-desk-setup-with-keyboard-and-monitor.jpg",
  backgroundColor: "#ffffff",
  role: "owner",
  bio: "ガジェットとデスク周りが好きなクリエイター。日々の作業環境を最適化することに情熱を注いでいます。",
  socialLinks: [
    {
      platform: "x",
      url: "https://x.com/shirasame",
      username: "@shirasame",
    },
    {
      platform: "youtube",
      url: "https://youtube.com/@shirasame",
      username: "@shirasame",
    },
  ],
  createdAt: "2024-01-01T00:00:00Z",
  updatedAt: "2025-01-10T00:00:00Z",
}
