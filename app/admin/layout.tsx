"use client"

import type { ReactNode } from "react"
import { AdminHeader } from "@/components/layout/AdminHeader"
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-muted">
      <AdminHeader />
      <main className="w-full max-w-screen-2xl mx-auto px-2 sm:px-6 py-6">
        {children}
      </main>
    </div>
  )
}
