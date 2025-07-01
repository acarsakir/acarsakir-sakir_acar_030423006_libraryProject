"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Calendar, Settings, LogOut, Menu, X } from "lucide-react"
import { getCurrentUser, signOut, type User } from "@/lib/auth"

interface DashboardLayoutProps {
  children: React.ReactNode
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function DashboardLayout({ children, activeTab = "overview", onTabChange }: DashboardLayoutProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    loadUser()
  }, [])

  const loadUser = async () => {
    try {
      const currentUser = await getCurrentUser()
      if (!currentUser) {
        window.location.href = "/"
        return
      }
      setUser(currentUser)
    } catch (error) {
      console.error("Error loading user:", error)
      window.location.href = "/"
    } finally {
      setLoading(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    window.location.href = "/"
  }

  const menuItems = [
    { id: "overview", label: "Genel Bakış", icon: BookOpen },
    { id: "books", label: "Kitap Kataloğu", icon: BookOpen },
    ...(user?.role === "admin"
      ? [
	  { id: "borrowings", label: "Ödünç İşlemleri", icon: Calendar },
          { id: "members", label: "Üye Yönetimi", icon: Users },
        ]
      : []),
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Yükleniyor...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="sm" onClick={() => setSidebarOpen(!sidebarOpen)}>
          {sidebarOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="p-6 border-b">
            <h1 className="text-xl font-bold text-gray-900">Kütüphane Sistemi</h1>
            <div className="mt-2">
              <p className="text-sm text-gray-600">{user.full_name}</p>
              <Badge variant={user.role === "admin" ? "default" : "secondary"} className="mt-1">
                {user.role === "admin" ? "Yönetici" : "Üye"}
              </Badge>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon
                return (
                  <li key={item.id}>
                    <button
                      onClick={() => {
                        onTabChange?.(item.id)
                        setSidebarOpen(false)
                      }}
                      className={`w-full flex items-center px-3 py-2 text-left rounded-lg transition-colors ${
                        activeTab === item.id ? "bg-blue-100 text-blue-700" : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      <Icon className="h-5 w-5 mr-3" />
                      {item.label}
                    </button>
                  </li>
                )
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-4 border-t">
            <Button variant="outline" className="w-full bg-transparent" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Çıkış Yap
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="lg:ml-64">
        <div className="p-4 lg:p-8">{children}</div>
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}
    </div>
  )
}
