# GitHub Actions Environment Variables Setup

Bu dosya GitHub Actions workflow'larında kullanılan environment variable'ları açıklar.

## Gerekli GitHub Secrets

GitHub repository'nizde **Settings → Secrets and variables → Actions** bölümünden aşağıdaki secrets'ları ekleyin:

### Supabase (Opsiyonel - varsayılan değerler kullanılabilir)
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key

### Application URLs (Opsiyonel)
- `NEXT_PUBLIC_AMIRON_URL` - Amiron uygulamasının URL'i (varsayılan: https://amiron.netlify.app)

## Otomatik Olarak Ayarlanan Değişkenler

Aşağıdaki değişkenler workflow tarafından otomatik olarak ayarlanır:

- `NEXT_EXPORT` - Static export için `true` olarak ayarlanır
- `NEXT_PUBLIC_BASE_PATH` - Repository adına göre otomatik ayarlanır (`/NecroVerse` veya boş)
- `NEXT_PUBLIC_APP_URL` - GitHub Pages URL'i (`https://username.github.io/NecroVerse`)
- `NEXT_PUBLIC_NECROPLAY_URL` - Necroplay URL'i (`https://username.github.io/NecroVerse`)

## Varsayılan Değerler

Eğer secrets tanımlanmazsa, kod içinde varsayılan değerler kullanılır:

- `NEXT_PUBLIC_SUPABASE_URL`: `https://xbbucipuftdncjzcluuk.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: (kod içinde tanımlı)
- `NEXT_PUBLIC_AMIRON_URL`: `https://amiron.netlify.app`

## Secrets Ekleme Adımları

1. GitHub repository'nize gidin
2. **Settings** → **Secrets and variables** → **Actions** bölümüne gidin
3. **New repository secret** butonuna tıklayın
4. Secret adını ve değerini girin
5. **Add secret** butonuna tıklayın

## Not

- `NEXT_PUBLIC_*` prefix'li değişkenler client-side'da kullanılabilir (public)
- Secrets kullanmak güvenlik için önerilir, özellikle production ortamında
- Varsayılan değerler development için yeterlidir

