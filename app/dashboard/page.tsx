"use client"

import { useState } from "react"
import DashboardLayout from "@/components/dashboard-layout"
import MemberOverview from "@/components/member-overview"
import BooksCatalog from "@/components/books-catalog"
import AdminBorrowings from "@/components/admin-borrowings"
import AdminMembers from "@/components/admin-members"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("overview")

  const renderContent = () => {
    switch (activeTab) {
      case "overview":
        return <MemberOverview />
      case "books":
        return <BooksCatalog />
      case "borrowings":
        return <AdminBorrowings />
      case "members":
        return <AdminMembers />
      case "settings":
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Ayarlar</h2>
            <p className="text-gray-600">Ayarlar sayfası yakında eklenecek.</p>
          </div>
        )
      default:
        return <MemberOverview />
    }
  }

  return (
    <DashboardLayout activeTab={activeTab} onTabChange={setActiveTab}>
      {renderContent()}
    </DashboardLayout>
  )
}
