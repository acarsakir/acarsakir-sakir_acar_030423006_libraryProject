"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { signIn, signUp } from "@/lib/auth-supabase-fixed"
import { testSupabaseConnection } from "@/lib/supabase-test"
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react"

export default function AuthFormDebug() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "info">("info")
  const [connectionStatus, setConnectionStatus] = useState<"testing" | "success" | "error">("testing")

  useEffect(() => {
    checkConnection()
  }, [])

  const checkConnection = async () => {
    try {
      const isConnected = await testSupabaseConnection()
      setConnectionStatus(isConnected ? "success" : "error")
    } catch (error) {
      setConnectionStatus("error")
    }
  }

  const showMessage = (msg: string, type: "success" | "error" | "info" = "info") => {
    setMessage(msg)
    setMessageType(type)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (isLogin) {
        console.log("🔐 Giriş yapılıyor...", email)
        const result = await signIn(email, password)

        if (result.data) {
          showMessage("Giriş başarılı! Yönlendiriliyorsunuz...", "success")
          setTimeout(() => {
            window.location.href = "/dashboard"
          }, 1000)
        }
      } else {
        console.log("📝 Kayıt yapılıyor...", email)
        const result = await signUp(email, password, fullName)

        if (result.data) {
          showMessage("Kayıt başarılı! E-posta adresinizi kontrol edin.", "success")
          setIsLogin(true)
        }
      }
    } catch (error: any) {
      console.error("🚨 Form hatası:", error)
      showMessage(error.message || "Bir hata oluştu", "error")
    } finally {
      setLoading(false)
    }
  }

  const fillTestData = (userType: "admin" | "member") => {
    if (userType === "admin") {
      setEmail("admin@kutuphane.com")
      setPassword("admin123")
    } else {
      setEmail("mehmet@gmail.com")
      setPassword("mehmet456")
    }
    setIsLogin(true)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            Kütüphane Sistemi
            {connectionStatus === "testing" && <Loader2 className="h-4 w-4 animate-spin" />}
            {connectionStatus === "success" && <CheckCircle className="h-4 w-4 text-green-600" />}
            {connectionStatus === "error" && <AlertCircle className="h-4 w-4 text-red-600" />}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? "Hesabınıza giriş yapın" : "Yeni hesap oluşturun"}
          </CardDescription>

          {/* Connection Status */}
          <div className="flex justify-center">
            <Badge
              variant={
                connectionStatus === "success" ? "default" : connectionStatus === "error" ? "destructive" : "secondary"
              }
            >
              {connectionStatus === "testing" && "Bağlantı test ediliyor..."}
              {connectionStatus === "error" && "Supabase bağlantı hatası"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Ad Soyad</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Ad Soyad"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required={!isLogin}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Şifre</Label>
              <Input
                id="password"
                type="password"
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {message && (
              <Alert variant={messageType === "error" ? "destructive" : "default"}>
                <AlertDescription
                  className={
                    messageType === "success"
                      ? "text-green-700"
                      : messageType === "error"
                        ? "text-red-700"
                        : "text-blue-700"
                  }
                >
                  {message}
                </AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading || connectionStatus === "error"}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  İşleniyor...
                </>
              ) : isLogin ? (
                "Giriş Yap"
              ) : (
                "Kayıt Ol"
              )}
            </Button>
          </form>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-600 hover:text-blue-500"
            >
              {isLogin ? "Hesabınız yok mu? Kayıt olun" : "Zaten hesabınız var mı? Giriş yapın"}
            </button>
          </div>

          {/* Test Buttons */}
          {isLogin && (
            <div className="mt-6 space-y-2">
              <p className="text-sm font-medium text-gray-700 text-center">Hızlı Test:</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestData("admin")}
                  className="flex-1"
                >
                  Admin Girişi
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fillTestData("member")}
                  className="flex-1"
                >
                  Üye Girişi
                </Button>
              </div>
            </div>
          )}

          {/* Debug Info */}
          {connectionStatus === "error" && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <p className="text-sm font-medium text-red-800 mb-2">Bağlantı Sorunu:</p>
              <div className="text-xs text-red-700 space-y-1">
                <div>1. .env.local dosyasını kontrol edin</div>
                <div>2. Supabase URL ve ANON KEY'i doğrulayın</div>
                <div>3. Supabase projesinin aktif olduğundan emin olun</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

