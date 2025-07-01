"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { signIn, signUp } from "@/lib/auth-mysql-fixed"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import { Database } from "lucide-react"

export default function AuthFormMySQL() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      await signIn(email, password)
      toast({
        title: "Başarılı",
        description: "MySQL veritabanından başarıyla giriş yapıldı!",
        className: "bg-green-50 border-green-200 text-green-800",
      })
      router.push("/dashboard")
    } catch (error: any) {
      toast({
        title: "Giriş Hatası",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const fullName = formData.get("fullName") as string
    const phone = formData.get("phone") as string
    const address = formData.get("address") as string

    try {
      await signUp(email, password, fullName, phone, address)
      toast({
        title: "Kayıt Başarılı! 🎉",
        description: "Hesabınız MySQL veritabanına başarıyla kaydedildi. Şimdi giriş yapabilirsiniz.",
        className: "bg-green-50 border-green-200 text-green-800",
      })

      // Reset form
      e.currentTarget.reset()

      // Switch to sign in tab after successful registration
      const signInTab = document.querySelector('[value="signin"]') as HTMLElement
      if (signInTab) {
        signInTab.click()
      }
    } catch (error: any) {
      toast({
        title: "Kayıt Hatası",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl text-center flex items-center justify-center gap-2">
            <Database className="h-6 w-6" />
            Kütüphane Sistemi
          </CardTitle>
          <CardDescription className="text-center">
            MySQL veritabanı ile hesabınıza giriş yapın veya yeni üyelik oluşturun
          </CardDescription>
          <div className="flex justify-center">
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              <Database className="h-3 w-3 mr-1" />
              MySQL Database
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Giriş Yap</TabsTrigger>
              <TabsTrigger value="signup">Üye Ol</TabsTrigger>
            </TabsList>

            <TabsContent value="signin">
              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" name="email" type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Giriş yapılıyor..." : "Giriş Yap"}
                </Button>
              </form>

              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-sm font-medium text-blue-800 mb-2">Test Hesapları:</p>
                <div className="text-xs text-blue-700 space-y-1">
                  <div>
                    <strong>Admin:</strong> admin@kutuphane.com / admin123
                  </div>
                  <div>
                    <strong>Üye:</strong> mehmet@gmail.com / mehmet456
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="signup">
              <form onSubmit={handleSignUp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Ad Soyad</Label>
                  <Input id="fullName" name="fullName" type="text" placeholder="John Doe" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-posta</Label>
                  <Input id="email" name="email" type="email" placeholder="your@email.com" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon (İsteğe bağlı)</Label>
                  <Input id="phone" name="phone" type="tel" placeholder="+90 555 123 4567" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Adres (İsteğe bağlı)</Label>
                  <Textarea id="address" name="address" placeholder="Adresinizi girin" rows={2} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Şifre</Label>
                  <Input id="password" name="password" type="password" required />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Hesap oluşturuluyor..." : "Hesap Oluştur"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
