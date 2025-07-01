"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Server, CheckCircle, AlertCircle } from "lucide-react"

export default function CPanelSetupGuide() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Server className="h-6 w-6" />
            cPanel MySQL Kurulum Rehberi
            <Badge variant="outline" className="bg-orange-50 text-orange-700">
              Shared Hosting
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1 */}
          <div className="border-l-4 border-blue-500 pl-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                1
              </span>
              cPanel'de Veritabanı Oluşturma
            </h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-muted-foreground">cPanel → MySQL Databases bölümüne gidin</p>
              <ul className="text-sm space-y-1 ml-4">
                <li>
                  • Veritabanı adı: <code className="bg-gray-100 px-1 rounded">library_system</code>
                </li>
                <li>• Kullanıcı oluşturun ve şifre belirleyin</li>
                <li>• Kullanıcıyı veritabanına atayın (ALL PRIVILEGES)</li>
              </ul>
            </div>
          </div>

          {/* Step 2 */}
          <div className="border-l-4 border-green-500 pl-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="bg-green-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                2
              </span>
              SQL Scriptlerini Çalıştırma
            </h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-muted-foreground">phpMyAdmin veya cPanel SQL aracını kullanın</p>
              <div className="bg-gray-50 p-3 rounded text-sm">
                <p className="font-medium mb-2">Sırasıyla çalıştırın:</p>
                <ol className="space-y-1">
                  <li>
                    1. <code>scripts/01-cpanel-create-tables.sql</code>
                  </li>
                  <li>
                    2. <code>scripts/03-cpanel-seed-data.sql</code>
                  </li>
                </ol>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="border-l-4 border-purple-500 pl-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <span className="bg-purple-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm">
                3
              </span>
              Environment Variables
            </h3>
            <div className="mt-2 space-y-2">
              <p className="text-sm text-muted-foreground">.env.local dosyasını oluşturun</p>
              <div className="bg-gray-900 text-green-400 p-3 rounded text-sm font-mono">
                <div>MYSQL_HOST=localhost</div>
                <div>MYSQL_PORT=3306</div>
                <div>MYSQL_USER=cpanel_user_dbname</div>
                <div>MYSQL_PASSWORD=your_password</div>
                <div>MYSQL_DATABASE=cpanel_user_library_system</div>
              </div>
            </div>
          </div>

          {/* Alerts */}
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>cPanel Kısıtlamaları:</strong>
              <ul className="mt-2 space-y-1 text-sm">
                <li>• DROP DATABASE komutu çalışmaz</li>
                <li>• Connection limit düşüktür (5-10)</li>
                <li>• SSL genellikle kapalıdır</li>
                <li>• Multiple statements devre dışıdır</li>
              </ul>
            </AlertDescription>
          </Alert>

          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>Test Hesapları:</strong>
              <div className="mt-2 space-y-1 text-sm">
                <div>
                  <strong>Admin:</strong> admin@kutuphane.com / admin123
                </div>
                <div>
                  <strong>Üye:</strong> mehmet@gmail.com / mehmet456
                </div>
              </div>
            </AlertDescription>
          </Alert>

          {/* Troubleshooting */}
          <div className="border-l-4 border-red-500 pl-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-red-500" />
              Sorun Giderme
            </h3>
            <div className="mt-2 space-y-2 text-sm">
              <div>
                <strong>Connection Error:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Host adresini kontrol edin (localhost veya IP)</li>
                  <li>• Kullanıcı adı formatını kontrol edin (genellikle cpanel_user_dbname)</li>
                  <li>• Şifrenin doğru olduğundan emin olun</li>
                </ul>
              </div>
              <div>
                <strong>Permission Error:</strong>
                <ul className="ml-4 mt-1 space-y-1">
                  <li>• Kullanıcının veritabanına ALL PRIVILEGES yetkisi olmalı</li>
                  <li>• Remote MySQL bağlantısı açık olmalı</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
