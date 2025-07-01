import { createClient } from '@/lib/supabase'

export interface User {
  id: string
  email: string
  full_name: string
  role: "admin" | "member"
  is_active: boolean
}

export async function signIn(email: string, password: string) {
  try {
    const supabase = createClient()

    console.log('🔐 Giriş denemesi:', email)

    // Supabase Auth ile giriş
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      console.error('❌ Auth hatası:', authError.message)
      
      // Yaygın hata mesajlarını Türkçe'ye çevir
      if (authError.message.includes('Invalid login credentials')) {
        throw new Error('E-posta veya şifre yanlış')
      }
      if (authError.message.includes('Email not confirmed')) {
        throw new Error('E-posta adresinizi doğrulamanız gerekiyor')
      }
      if (authError.message.includes('Too many requests')) {
        throw new Error('Çok fazla deneme. Lütfen biraz bekleyin.')
      }
      
      throw new Error(authError.message)
    }

    if (!authData.user) {
      throw new Error('Kullanıcı bilgileri alınamadı')
    }

    console.log('✅ Auth başarılı, profil kontrol ediliyor...')

    // Kullanıcı profilini al
    const { data: profile, error: profileError } = await supabase
      .from('members')
      .select('*')
      .eq('id', authData.user.id)
      .single()

    if (profileError) {
      console.error('❌ Profil hatası:', profileError.message)
      
      // Eğer profil yoksa oluştur
      if (profileError.code === 'PGRST116') {
        console.log('📝 Profil oluşturuluyor...')
        
        const { error: insertError } = await supabase
          .from('members')
          .insert([
            {
              id: authData.user.id,
              full_name: authData.user.user_metadata?.full_name || 'Kullanıcı',
              email: authData.user.email!,
              role: 'member',
              is_active: true,
            },
          ])

        if (insertError) {
          console.error('❌ Profil oluşturma hatası:', insertError.message)
          throw new Error('Kullanıcı profili oluşturulamadı')
        }

        // Yeni oluşturulan profili al
        const { data: newProfile } = await supabase
          .from('members')
          .select('*')
          .eq('id', authData.user.id)
          .single()

        return { 
          data: { 
            user: authData.user, 
            profile: newProfile 
          } 
        }

