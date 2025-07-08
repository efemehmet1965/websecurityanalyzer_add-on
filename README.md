# Web Security Analyzer

Web sitelerinin güvenlik risklerini ve kullanılan teknolojileri analiz eden Chrome uzantısı.

## Özellikler

### 🔒 Güvenlik Analizi
- **HTTPS/SSL Kontrolü**: Web sitesinin güvenli bağlantı kullanıp kullanmadığını kontrol eder
- **Mixed Content Tespiti**: HTTPS sayfalarında HTTP kaynak kullanımını tespit eder
- **Güvenlik Header'ları**: CSP, X-Frame-Options gibi güvenlik header'larını analiz eder
- **Form Güvenliği**: Formların HTTPS üzerinden gönderilip gönderilmediğini ve CSRF koruması olup olmadığını kontrol eder
- **Güvenlik Açıkları**: Yaygın güvenlik açıklarını tespit eder

### 🔧 Teknoloji Tespiti
- **JavaScript Framework'leri**: React, Vue.js, AngularJS, jQuery gibi framework'leri tespit eder
- **CSS Framework'leri**: Bootstrap, Tailwind CSS gibi CSS framework'lerini tanır
- **CMS/Generator**: WordPress, Jekyll gibi içerik yönetim sistemlerini tespit eder
- **Analytics**: Google Analytics, Facebook Pixel gibi analitik araçları tanır

### 📊 Detaylı Raporlama
- **Güvenlik Skoru**: 0-100 arası güvenlik skoru hesaplar
- **Görsel Arayüz**: Modern ve kullanıcı dostu arayüz
- **Rapor İndirme**: Analiz sonuçlarını JSON formatında indirebilme
- **Gerçek Zamanlı Analiz**: Sayfa değişikliklerinde otomatik analiz

## Kurulum

### Chrome Web Store'dan Kurulum (Önerilen)
*Henüz Chrome Web Store'da yayınlanmamıştır*

### Manuel Kurulum (Geliştirici Modu)

1. **Uzantı dosyalarını indirin**
   ```bash
   git clone https://github.com/your-username/web-security-analyzer.git
   cd web-security-analyzer
   ```

2. **Chrome'da Geliştirici Modunu Etkinleştirin**
   - Chrome'u açın
   - Adres çubuğuna `chrome://extensions/` yazın
   - Sağ üst köşedeki "Geliştirici modu" anahtarını açın

3. **Uzantıyı Yükleyin**
   - "Paketlenmemiş uzantı yükle" butonuna tıklayın
   - İndirdiğiniz `web-security-analyzer` klasörünü seçin
   - Uzantı otomatik olarak yüklenecektir

4. **Uzantıyı Kullanın**
   - Herhangi bir web sitesine gidin
   - Chrome araç çubuğundaki uzantı ikonuna tıklayın
   - Analiz sonuçlarını görüntüleyin

## Kullanım

### Temel Kullanım
1. Analiz etmek istediğiniz web sitesine gidin
2. Chrome araç çubuğundaki Web Security Analyzer ikonuna tıklayın
3. Uzantı otomatik olarak sayfayı analiz edecektir
4. Sonuçları üç farklı sekmede görüntüleyebilirsiniz:
   - **Genel Bakış**: Hızlı güvenlik durumu ve özet bilgiler
   - **Teknolojiler**: Tespit edilen teknolojiler ve versiyonları
   - **Güvenlik**: Detaylı güvenlik analizi ve öneriler

### Gelişmiş Özellikler
- **Yeniden Analiz**: Sağ üst köşedeki yenile butonuyla sayfayı tekrar analiz edebilirsiniz
- **Rapor İndirme**: "Rapor İndir" butonuyla analiz sonuçlarını JSON formatında indirebilirsiniz
- **Güvenlik Skoru**: 0-100 arası hesaplanan güvenlik skorunu takip edebilirsiniz

## Güvenlik Skoru Hesaplama

Güvenlik skoru aşağıdaki kriterlere göre hesaplanır:

- **HTTPS Kullanımı** (30 puan): Site HTTPS kullanıyor mu?
- **Mixed Content** (15 puan): HTTPS sayfada HTTP kaynak var mı?
- **Güvenlik Açıkları**: 
  - Yüksek risk: -20 puan
  - Orta risk: -10 puan
  - Düşük risk: -5 puan
- **Form Güvenliği**:
  - HTTP üzerinden şifre formu: -25 puan
  - CSRF koruması eksik: -5 puan

## Teknik Detaylar

### Manifest V3 Uyumluluğu
Bu uzantı Chrome'un en yeni Manifest V3 standardına uygun olarak geliştirilmiştir:
- Service Worker tabanlı background script
- Declarative content scripts
- Modern Chrome API'leri kullanımı

### Dosya Yapısı
```
web-security-analyzer/
├── manifest.json              # Uzantı manifest dosyası
├── src/
│   ├── background/
│   │   └── background.js       # Background service worker
│   ├── content/
│   │   └── content.js          # Content script (sayfa analizi)
│   ├── popup/
│   │   ├── popup.html          # Popup arayüzü
│   │   ├── popup.css           # Popup stilleri
│   │   └── popup.js            # Popup JavaScript
│   └── assets/
│       └── icons/              # Uzantı ikonları
├── docs/                       # Dokümantasyon
└── README.md                   # Bu dosya
```

### Analiz Edilen Güvenlik Kriterleri

#### SSL/TLS Güvenliği
- HTTPS protokol kullanımı
- Mixed content kontrolü
- Güvenli bağlantı durumu

#### Güvenlik Header'ları
- Content-Security-Policy (CSP)
- X-Frame-Options
- X-Content-Type-Options
- Strict-Transport-Security (HSTS)
- Referrer-Policy

#### Form Güvenliği
- HTTPS üzerinden form gönderimi
- CSRF token varlığı
- Şifre alanları güvenliği
- Dosya yükleme güvenliği

#### Yaygın Güvenlik Açıkları
- HTTP üzerinden şifre formu
- Mixed content
- Aşırı inline script kullanımı
- Güvensiz dış kaynak yüklemeleri

## Geliştirme

### Gereksinimler
- Chrome 88+ (Manifest V3 desteği için)
- Temel HTML, CSS, JavaScript bilgisi

### Geliştirme Ortamı Kurulumu
1. Projeyi klonlayın
2. Chrome'da geliştirici modunu etkinleştirin
3. Uzantıyı paketlenmemiş olarak yükleyin
4. Değişiklik yaptıktan sonra uzantıyı yeniden yükleyin

### Katkıda Bulunma
1. Bu repository'yi fork edin
2. Yeni bir branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için `LICENSE` dosyasına bakın.

## Destek

Herhangi bir sorun yaşarsanız veya öneriniz varsa:
- GitHub Issues bölümünde issue açabilirsiniz
- E-posta ile iletişime geçebilirsiniz

## Sürüm Geçmişi

### v1.0.0 (İlk Sürüm)
- Temel güvenlik analizi özellikleri
- Teknoloji tespit sistemi
- Modern popup arayüzü
- Manifest V3 uyumluluğu
- Güvenlik skoru hesaplama
- Rapor indirme özelliği

## Gelecek Özellikler

- [ ] Daha detaylı SSL/TLS analizi
- [ ] Vulnerability database entegrasyonu
- [ ] Otomatik güvenlik önerileri
- [ ] Çoklu dil desteği
- [ ] Karanlık tema
- [ ] Gelişmiş raporlama seçenekleri
- [ ] API entegrasyonları


-**https://github.com/efemehmet1965**

---

**Not**: Bu uzantı eğitim ve bilgilendirme amaçlıdır. Profesyonel güvenlik denetimi için uzman güvenlik araçları kullanılması önerilir.

