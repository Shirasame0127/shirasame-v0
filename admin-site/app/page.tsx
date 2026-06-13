"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import LoadingAnimation from "@/components/loading-animation"

// Root entry — the admin console lives under /admin. Redirect there.
export default function RootRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/admin")
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <LoadingAnimation size={96} />
    </div>
  )
}
