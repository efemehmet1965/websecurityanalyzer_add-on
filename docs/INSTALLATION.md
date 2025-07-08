# Web Security Analyzer - Kurulum Talimatları

Bu dokümanda Web Security Analyzer Chrome uzantısının nasıl kurulacağı detaylı olarak anlatılmaktadır.

## Sistem Gereksinimleri

- **Chrome Tarayıcı**: Sürüm 88 veya üzeri (Manifest V3 desteği için)
- **İşletim Sistemi**: Windows, macOS, Linux (Chrome'un desteklediği tüm platformlar)
- **İnternet Bağlantısı**: Uzantının bazı özellikleri için gerekli

## Kurulum Yöntemleri

### Yöntem 1: Manuel Kurulum (Geliştirici Modu) - Önerilen

Bu yöntem, uzantıyı Chrome Web Store'da yayınlanmadan önce test etmek için kullanılır.

#### Adım 1: Uzantı Dosyalarını İndirin

**Git ile:**
```bash
git clone https://github.com/your-username/web-security-analyzer.git
cd web-security-analyzer
```

**ZIP olarak:**
1. GitHub sayfasından "Code" > "Download ZIP" seçeneğini tıklayın
2. İndirilen ZIP dosyasını bilgisayarınızda uygun bir konuma çıkarın

#### Adım 2: Chrome Geliştirici Modunu Etkinleştirin

1. **Chrome'u açın**
2. **Uzantılar sayfasına gidin:**
   - Adres çubuğuna `chrome://extensions/` yazın ve Enter'a basın
   - VEYA Chrome menüsünden "Diğer araçlar" > "Uzantılar" seçin
3. **Geliştirici modunu etkinleştirin:**
   - Sayfanın sağ üst köşesindeki "Geliştirici modu" anahtarını açın

#### Adım 3: Uzantıyı Yükleyin

1. **"Paketlenmemiş uzantı yükle" butonuna tıklayın**
2. **Klasör seçin:**
   - İndirdiğiniz/çıkardığınız `web-security-analyzer` klasörünü seçin
   - Klasörün içinde `manifest.json` dosyasının olduğundan emin olun
3. **"Klasör seç" butonuna tıklayın**

#### Adım 4: Kurulumu Doğrulayın

1. Uzantı listesinde "Web Security Analyzer" görünmelidir
2. Chrome araç çubuğunda uzantı ikonu görünmelidir
3. İkon görünmüyorsa, araç çubuğundaki puzzle ikonu (🧩) tıklayıp uzantıyı sabitleyin

### Yöntem 2: Chrome Web Store'dan Kurulum

*Bu özellik henüz mevcut değildir. Uzantı Chrome Web Store'da yayınlandığında bu bölüm güncellenecektir.*

## Kurulum Sonrası Ayarlar

### İzinleri Kontrol Edin

Uzantının düzgün çalışması için aşağıdaki izinlere sahip olduğundan emin olun:

- **Aktif sekme**: Mevcut sekmedeki web sitesini analiz etmek için
- **Depolama**: Analiz sonuçlarını kaydetmek için
- **Scripting**: Web sayfalarında analiz yapmak için
- **Tüm web sitelerine erişim**: Herhangi bir web sitesini analiz edebilmek için

### İlk Kullanım

1. **Herhangi bir web sitesine gidin** (örn: https://example.com)
2. **Uzantı ikonuna tıklayın**
3. **İlk analiz otomatik olarak başlayacaktır**
4. **Sonuçları farklı sekmelerde görüntüleyebilirsiniz**

## Sorun Giderme

### Yaygın Sorunlar ve Çözümleri

#### Uzantı İkonu Görünmüyor
**Çözüm:**
1. Chrome araç çubuğundaki puzzle ikonuna (🧩) tıklayın
2. "Web Security Analyzer" yanındaki pin ikonuna tıklayın
3. İkon araç çubuğunda sabitlenecektir

#### "Bu sayfa analiz edilemiyor" Hatası
**Nedenler ve Çözümler:**
- **Chrome özel sayfaları** (`chrome://`, `chrome-extension://`): Bu sayfalar güvenlik nedeniyle analiz edilemez
- **Yerel dosyalar** (`file://`): Yerel HTML dosyaları için özel izin gerekir
- **HTTPS sertifika hataları**: Sertifika hatası olan sitelerde analiz çalışmayabilir

**Çözüm:** Normal web sitelerinde (http:// veya https://) uzantıyı test edin

#### Analiz Sonuçları Yüklenmiyor
**Çözümler:**
1. **Sayfayı yenileyin** ve tekrar deneyin
2. **Uzantıyı yeniden yükleyin:**
   - `chrome://extensions/` sayfasına gidin
   - Web Security Analyzer yanındaki yenile ikonuna tıklayın
3. **Chrome'u yeniden başlatın**

#### Popup Açılmıyor
**Çözümler:**
1. **Uzantının etkin olduğundan emin olun**
2. **Chrome'u güncelleyin** (Sürüm 88+)
3. **Uzantıyı kaldırıp yeniden yükleyin**

### Hata Raporlama

Sorun devam ederse:

1. **Chrome DevTools'u açın** (F12)
2. **Console sekmesine gidin**
3. **Hata mesajlarını kopyalayın**
4. **GitHub Issues'da yeni bir issue açın:**
   - Hata mesajını ekleyin
   - Hangi web sitesinde oluştuğunu belirtin
   - Chrome sürümünüzü belirtin
   - İşletim sisteminizi belirtin

## Güncelleme

### Manuel Kurulum için Güncelleme

1. **Yeni sürümü indirin**
2. **Eski dosyaları silin**
3. **Yeni dosyaları aynı konuma çıkarın**
4. **Chrome'da uzantıyı yenileyin:**
   - `chrome://extensions/` sayfasına gidin
   - Web Security Analyzer yanındaki yenile ikonuna tıklayın

### Otomatik Güncelleme

Chrome Web Store'dan kurulum yapıldığında güncellemeler otomatik olarak gelecektir.

## Kaldırma

### Uzantıyı Kaldırma

1. **`chrome://extensions/` sayfasına gidin**
2. **Web Security Analyzer'ı bulun**
3. **"Kaldır" butonuna tıklayın**
4. **Onaylayın**

### Verileri Temizleme

Uzantı kaldırıldığında tüm veriler otomatik olarak silinir. Manuel temizlik için:

1. **Chrome Ayarları** > **Gizlilik ve güvenlik** > **Site verileri**
2. **"Tüm verileri gör"** seçeneğine tıklayın
3. **"chrome-extension://"** ile başlayan girişleri silin

## Güvenlik Notları

### Veri Gizliliği

- Uzantı analiz verilerini yalnızca yerel olarak saklar
- Hiçbir veri dış sunuculara gönderilmez
- Analiz sonuçları tarayıcınızda kalır

### İzinler

Uzantı aşağıdaki izinleri kullanır:
- **activeTab**: Sadece aktif sekmeye erişim
- **storage**: Yerel veri saklama
- **scripting**: Sayfa analizi için script enjeksiyonu

### Güvenli Kullanım

- Uzantıyı sadece güvenilir kaynaklardan indirin
- Şüpheli web sitelerinde dikkatli olun
- Analiz sonuçlarını başkalarıyla paylaşırken hassas bilgileri kontrol edin

## Teknik Destek

### İletişim

- **GitHub Issues**: https://github.com/your-username/web-security-analyzer/issues
- **E-posta**: support@websecurityanalyzer.com
- **Dokümantasyon**: https://github.com/your-username/web-security-analyzer/wiki

### Sistem Bilgileri

Destek talep ederken aşağıdaki bilgileri paylaşın:

- Chrome sürümü (`chrome://version/`)
- İşletim sistemi
- Uzantı sürümü
- Hata mesajı (varsa)
- Sorunun oluştuğu web sitesi

---

**Son Güncelleme**: 2024-01-XX  
**Sürüm**: 1.0.0

