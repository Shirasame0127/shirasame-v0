import { Sparkles } from "lucide-react" // Import Sparkles icon component from Lucide React
import Link from "next/link" // Import Link component from Next.js

export function PublicHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <span className="font-bold text-lg">My Gadgets</span>
        </Link>
        <nav className="flex items-center gap-6">
          <Link href="/#products" className="text-sm font-medium hover:text-primary transition-colors">
            商品
          </Link>
          <Link href="/#recipes" className="text-sm font-medium hover:text-primary transition-colors">
            デスクレシピ
          </Link>
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
          >
            管理画面
          </Link>
        </nav>
      </div>
    </header>
  )
}
