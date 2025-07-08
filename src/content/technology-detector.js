// Gelişmiş Teknoloji Tespit Modülü
class TechnologyDetector {
  constructor() {
    this.technologies = [];
    this.detectionRules = this.initializeDetectionRules();
    this.subdomains = new Set();
    this.externalDomains = new Set();
  }

  // Ana teknoloji tespit fonksiyonu
  async detect() {
    const technologies = await this.detectTechnologies();
    const subdomains = this.detectSubdomains();
    const externalDomains = this.detectExternalDomains();
    
    return { 
      technologies,
      subdomains: Array.from(subdomains),
      externalDomains: Array.from(externalDomains),
      totalTechnologies: technologies.length,
      totalSubdomains: subdomains.size,
      totalExternalDomains: externalDomains.size
    };
  }

  // Ana teknoloji tespit fonksiyonu
  async detectTechnologies() {
    const technologies = [];

    try {
      // JavaScript Framework'leri
      technologies.push(...this.detectJavaScriptFrameworks());
      
      // CSS Framework'leri
      technologies.push(...this.detectCSSFrameworks());
      
      // CMS ve Generator'lar
      technologies.push(...this.detectCMSAndGenerators());
      
      // Analytics ve Tracking
      technologies.push(...this.detectAnalyticsAndTracking());
      
      // Web Server ve CDN
      technologies.push(...this.detectWebServerAndCDN());
      
      // E-commerce Platform'ları
      technologies.push(...this.detectEcommercePlatforms());
      
      // Font ve Icon Library'leri
      technologies.push(...this.detectFontAndIconLibraries());
      
      // Development Tools
      technologies.push(...this.detectDevelopmentTools());

      // Advertising Networks
      technologies.push(...this.detectAdvertisingNetworks());

      // Security Tools
      technologies.push(...this.detectSecurityTools());

      // Database ve Backend
      technologies.push(...this.detectDatabaseAndBackend());

      // UI Libraries
      technologies.push(...this.detectUILibraries());

      // Payment Systems
      technologies.push(...this.detectPaymentSystems());

      // Social Media Integration
      technologies.push(...this.detectSocialMediaIntegration());

    } catch (error) {
      console.error('Technology detection failed:', error);
    }

    return this.removeDuplicates(technologies);
  }

  // JavaScript Framework'leri tespit et
  detectJavaScriptFrameworks() {
    const frameworks = [];

    // React
    if (window.React || document.querySelector('[data-reactroot]') || 
        document.querySelector('script[src*="react"]') ||
        document.querySelector('div[id="root"]') ||
        document.querySelector('div[id="app"]')) {
      frameworks.push({
        name: 'React',
        version: window.React?.version || this.getVersionFromScript('react'),
        category: 'JavaScript Framework',
        confidence: window.React ? 'High' : 'Medium',
        evidence: window.React ? 'window.React object found' : 'React indicators found'
      });
    }

    // Vue.js
    if (window.Vue || document.querySelector('[data-v-]') || 
        document.querySelector('script[src*="vue"]') ||
        document.querySelector('div[id="app"][data-v-]')) {
      frameworks.push({
        name: 'Vue.js',
        version: window.Vue?.version || this.getVersionFromScript('vue'),
        category: 'JavaScript Framework',
        confidence: window.Vue ? 'High' : 'Medium',
        evidence: window.Vue ? 'window.Vue object found' : 'Vue indicators found'
      });
    }

    // AngularJS
    if (window.angular || document.querySelector('[ng-app]') || 
        document.querySelector('[ng-controller]') ||
        document.querySelector('script[src*="angular"]')) {
      frameworks.push({
        name: 'AngularJS',
        version: window.angular?.version?.full || this.getVersionFromScript('angular'),
        category: 'JavaScript Framework',
        confidence: window.angular ? 'High' : 'Medium',
        evidence: window.angular ? 'window.angular object found' : 'AngularJS directives found'
      });
    }

    // Angular (2+)
    if (window.ng || document.querySelector('[ng-version]') ||
        document.querySelector('app-root') ||
        document.querySelector('script[src*="@angular"]')) {
      const versionEl = document.querySelector('[ng-version]');
      frameworks.push({
        name: 'Angular',
        version: versionEl ? versionEl.getAttribute('ng-version') : this.getVersionFromScript('@angular'),
        category: 'JavaScript Framework',
        confidence: window.ng ? 'High' : 'Medium',
        evidence: 'Angular components or version attribute found'
      });
    }

    // jQuery
    if (window.jQuery || window.$) {
      frameworks.push({
        name: 'jQuery',
        version: window.jQuery?.fn?.jquery || window.$?.fn?.jquery || this.getVersionFromScript('jquery'),
        category: 'JavaScript Library',
        confidence: 'High',
        evidence: 'window.jQuery or window.$ found'
      });
    }

    // Svelte
    if (document.querySelector('[data-svelte]') || window.__SVELTE__ ||
        document.querySelector('script[src*="svelte"]')) {
      frameworks.push({
        name: 'Svelte',
        version: this.getVersionFromScript('svelte'),
        category: 'JavaScript Framework',
        confidence: 'Medium',
        evidence: 'Svelte data attributes or scripts found'
      });
    }

    // Next.js
    if (window.__NEXT_DATA__ || document.querySelector('#__next') ||
        document.querySelector('script[src*="_next"]')) {
      frameworks.push({
        name: 'Next.js',
        version: this.getVersionFromScript('next'),
        category: 'React Framework',
        confidence: 'High',
        evidence: '__NEXT_DATA__ or Next.js scripts found'
      });
    }

    // Nuxt.js
    if (window.__NUXT__ || document.querySelector('#__nuxt') ||
        document.querySelector('script[src*="nuxt"]')) {
      frameworks.push({
        name: 'Nuxt.js',
        version: this.getVersionFromScript('nuxt'),
        category: 'Vue.js Framework',
        confidence: 'High',
        evidence: '__NUXT__ or Nuxt.js scripts found'
      });
    }

    // Ember.js
    if (window.Ember || document.querySelector('script[src*="ember"]') ||
        document.querySelector('[data-ember-action]')) {
      frameworks.push({
        name: 'Ember.js',
        version: window.Ember?.VERSION || this.getVersionFromScript('ember'),
        category: 'JavaScript Framework',
        confidence: window.Ember ? 'High' : 'Medium',
        evidence: 'Ember.js detected'
      });
    }

    // Backbone.js
    if (window.Backbone || document.querySelector('script[src*="backbone"]')) {
      frameworks.push({
        name: 'Backbone.js',
        version: window.Backbone?.VERSION || this.getVersionFromScript('backbone'),
        category: 'JavaScript Framework',
        confidence: window.Backbone ? 'High' : 'Medium',
        evidence: 'Backbone.js detected'
      });
    }

    return frameworks;
  }

  // CSS Framework'leri tespit et
  detectCSSFrameworks() {
    const frameworks = [];

    // Bootstrap
    if (this.checkStylesheet('bootstrap') || 
        document.querySelector('.container, .row, .col') ||
        document.querySelector('[class*="col-"]') ||
        document.querySelector('.btn, .navbar, .modal')) {
      frameworks.push({
        name: 'Bootstrap',
        version: this.getBootstrapVersion(),
        category: 'CSS Framework',
        confidence: 'High',
        evidence: 'Bootstrap classes or stylesheet found'
      });
    }

    // Tailwind CSS
    if (this.checkStylesheet('tailwind') || 
        document.querySelector('[class*="bg-"], [class*="text-"], [class*="p-"], [class*="m-"]') ||
        this.hasTailwindClasses()) {
      frameworks.push({
        name: 'Tailwind CSS',
        version: this.getVersionFromStylesheet('tailwind'),
        category: 'CSS Framework',
        confidence: 'Medium',
        evidence: 'Tailwind utility classes found'
      });
    }

    // Foundation
    if (this.checkStylesheet('foundation') || 
        document.querySelector('.foundation, .grid-x, .cell')) {
      frameworks.push({
        name: 'Foundation',
        version: this.getVersionFromStylesheet('foundation'),
        category: 'CSS Framework',
        confidence: 'High',
        evidence: 'Foundation classes or stylesheet found'
      });
    }

    // Bulma
    if (this.checkStylesheet('bulma') || 
        document.querySelector('.bulma, .hero, .navbar, .column')) {
      frameworks.push({
        name: 'Bulma',
        version: this.getVersionFromStylesheet('bulma'),
        category: 'CSS Framework',
        confidence: 'Medium',
        evidence: 'Bulma classes found'
      });
    }

    // Materialize
    if (this.checkStylesheet('materialize') || 
        document.querySelector('.materialize, .waves-effect, .btn-floating')) {
      frameworks.push({
        name: 'Materialize',
        version: this.getVersionFromStylesheet('materialize'),
        category: 'CSS Framework',
        confidence: 'Medium',
        evidence: 'Materialize classes found'
      });
    }

    return frameworks;
  }

  // CMS ve Generator'ları tespit et
  detectCMSAndGenerators() {
    const cms = [];

    // WordPress
    if (document.querySelector('link[href*="wp-content"]') || 
        document.querySelector('script[src*="wp-content"]') ||
        window.wp ||
        document.querySelector('meta[name="generator"][content*="WordPress"]')) {
      cms.push({
        name: 'WordPress',
        version: this.getWordPressVersion(),
        category: 'CMS',
        confidence: 'High',
        evidence: 'wp-content paths or WordPress indicators found'
      });
    }

    // Drupal
    if (document.querySelector('script[src*="drupal"]') || 
        window.Drupal ||
        document.querySelector('body[class*="drupal"]') ||
        document.querySelector('meta[name="generator"][content*="Drupal"]')) {
      cms.push({
        name: 'Drupal',
        version: this.getDrupalVersion(),
        category: 'CMS',
        confidence: 'High',
        evidence: 'Drupal scripts or classes found'
      });
    }

    // Joomla
    if (document.querySelector('script[src*="joomla"]') || 
        window.Joomla ||
        document.querySelector('meta[name="generator"][content*="Joomla"]')) {
      cms.push({
        name: 'Joomla',
        version: this.getJoomlaVersion(),
        category: 'CMS',
        confidence: 'High',
        evidence: 'Joomla scripts or meta generator found'
      });
    }

    // Shopify
    if (window.Shopify || 
        document.querySelector('script[src*="shopify"]') ||
        document.querySelector('meta[name="shopify-checkout-api-token"]')) {
      cms.push({
        name: 'Shopify',
        version: 'Unknown',
        category: 'E-commerce Platform',
        confidence: 'High',
        evidence: 'Shopify indicators found'
      });
    }

    // Meta generator tag'den tespit
    const generator = document.querySelector('meta[name="generator"]');
    if (generator) {
      const content = generator.getAttribute('content');
      const generatorName = content.split(' ')[0];
      if (!cms.some(c => c.name === generatorName)) {
        cms.push({
          name: generatorName,
          version: this.extractVersionFromGenerator(content),
          category: 'Generator',
          confidence: 'High',
          evidence: 'Meta generator tag'
        });
      }
    }

    return cms;
  }

  // Analytics ve Tracking araçlarını tespit et
  detectAnalyticsAndTracking() {
    const analytics = [];

    // Google Analytics
    if (window.gtag || window.ga || window.dataLayer ||
        document.querySelector('script[src*="googletagmanager"]') ||
        document.querySelector('script[src*="google-analytics"]')) {
      analytics.push({
        name: 'Google Analytics',
        version: window.gtag ? 'GA4' : 'Universal Analytics',
        category: 'Analytics',
        confidence: 'High',
        evidence: 'Google Analytics scripts found'
      });
    }

    // Facebook Pixel
    if (window.fbq || document.querySelector('script[src*="facebook.net"]') ||
        document.querySelector('script[src*="connect.facebook.net"]')) {
      analytics.push({
        name: 'Facebook Pixel',
        version: 'Unknown',
        category: 'Analytics',
        confidence: 'High',
        evidence: 'Facebook Pixel scripts found'
      });
    }

    // Google Tag Manager
    if (window.dataLayer || document.querySelector('script[src*="googletagmanager"]') ||
        document.querySelector('noscript[src*="googletagmanager"]')) {
      analytics.push({
        name: 'Google Tag Manager',
        version: 'Unknown',
        category: 'Tag Manager',
        confidence: 'High',
        evidence: 'GTM scripts found'
      });
    }

    // Hotjar
    if (window.hj || document.querySelector('script[src*="hotjar"]')) {
      analytics.push({
        name: 'Hotjar',
        version: 'Unknown',
        category: 'Analytics',
        confidence: 'High',
        evidence: 'Hotjar scripts found'
      });
    }

    // Adobe Analytics
    if (window.s || window._satellite || 
        document.querySelector('script[src*="omniture"]') ||
        document.querySelector('script[src*="adobe"]')) {
      analytics.push({
        name: 'Adobe Analytics',
        version: 'Unknown',
        category: 'Analytics',
        confidence: 'High',
        evidence: 'Adobe Analytics scripts found'
      });
    }

    return analytics;
  }

  // Web Server ve CDN tespit et
  detectWebServerAndCDN() {
    const infrastructure = [];

    // Cloudflare
    if (document.querySelector('script[src*="cloudflare"]') || 
        document.querySelector('link[href*="cloudflare"]') ||
        document.querySelector('script[src*="cf-"]')) {
      infrastructure.push({
        name: 'Cloudflare',
        version: 'Unknown',
        category: 'CDN',
        confidence: 'High',
        evidence: 'Cloudflare resources found'
      });
    }

    // AWS CloudFront
    if (document.querySelector('script[src*="cloudfront"]') || 
        document.querySelector('link[href*="cloudfront"]')) {
      infrastructure.push({
        name: 'AWS CloudFront',
        version: 'Unknown',
        category: 'CDN',
        confidence: 'High',
        evidence: 'CloudFront resources found'
      });
    }

    // jsDelivr
    if (document.querySelector('script[src*="jsdelivr"]') || 
        document.querySelector('link[href*="jsdelivr"]')) {
      infrastructure.push({
        name: 'jsDelivr',
        version: 'Unknown',
        category: 'CDN',
        confidence: 'High',
        evidence: 'jsDelivr resources found'
      });
    }

    // unpkg
    if (document.querySelector('script[src*="unpkg"]') || 
        document.querySelector('link[href*="unpkg"]')) {
      infrastructure.push({
        name: 'unpkg',
        version: 'Unknown',
        category: 'CDN',
        confidence: 'High',
        evidence: 'unpkg resources found'
      });
    }

    return infrastructure;
  }

  // E-commerce platform'larını tespit et
  detectEcommercePlatforms() {
    const ecommerce = [];

    // WooCommerce
    if (window.wc || document.querySelector('script[src*="woocommerce"]') ||
        document.querySelector('body[class*="woocommerce"]')) {
      ecommerce.push({
        name: 'WooCommerce',
        version: 'Unknown',
        category: 'E-commerce',
        confidence: 'High',
        evidence: 'WooCommerce scripts or classes found'
      });
    }

    // Magento
    if (window.Magento || document.querySelector('script[src*="magento"]') ||
        document.querySelector('body[class*="magento"]')) {
      ecommerce.push({
        name: 'Magento',
        version: 'Unknown',
        category: 'E-commerce',
        confidence: 'High',
        evidence: 'Magento indicators found'
      });
    }

    return ecommerce;
  }

  // Font ve Icon library'lerini tespit et
  detectFontAndIconLibraries() {
    const libraries = [];

    // Font Awesome
    if (this.checkStylesheet('font-awesome') || 
        document.querySelector('.fa, .fas, .far, .fab, .fal') ||
        document.querySelector('i[class*="fa-"]')) {
      libraries.push({
        name: 'Font Awesome',
        version: this.getFontAwesomeVersion(),
        category: 'Icon Library',
        confidence: 'High',
        evidence: 'Font Awesome classes or stylesheet found'
      });
    }

    // Google Fonts
    if (this.checkStylesheet('fonts.googleapis.com') ||
        document.querySelector('link[href*="fonts.googleapis.com"]')) {
      libraries.push({
        name: 'Google Fonts',
        version: 'Unknown',
        category: 'Web Fonts',
        confidence: 'High',
        evidence: 'Google Fonts stylesheet found'
      });
    }

    // Material Icons
    if (this.checkStylesheet('material-icons') ||
        document.querySelector('.material-icons') ||
        document.querySelector('link[href*="material-icons"]')) {
      libraries.push({
        name: 'Material Icons',
        version: 'Unknown',
        category: 'Icon Library',
        confidence: 'High',
        evidence: 'Material Icons found'
      });
    }

    return libraries;
  }

  // Development tools tespit et
  detectDevelopmentTools() {
    const tools = [];

    // Webpack
    if (window.webpackJsonp || document.querySelector('script[src*="webpack"]') ||
        document.querySelector('script[src*="chunk"]')) {
      tools.push({
        name: 'Webpack',
        version: 'Unknown',
        category: 'Build Tool',
        confidence: 'High',
        evidence: 'Webpack artifacts found'
      });
    }

    // Vite
    if (document.querySelector('script[src*="vite"]') || window.__vite__ ||
        document.querySelector('script[type="module"][src*="@vite"]')) {
      tools.push({
        name: 'Vite',
        version: 'Unknown',
        category: 'Build Tool',
        confidence: 'High',
        evidence: 'Vite artifacts found'
      });
    }

    // Parcel
    if (document.querySelector('script[src*="parcel"]')) {
      tools.push({
        name: 'Parcel',
        version: 'Unknown',
        category: 'Build Tool',
        confidence: 'Medium',
        evidence: 'Parcel artifacts found'
      });
    }

    return tools;
  }

  // Advertising networks tespit et
  detectAdvertisingNetworks() {
    const ads = [];

    // Google AdSense
    if (document.querySelector('script[src*="googlesyndication"]') || 
        document.querySelector('.adsbygoogle') ||
        document.querySelector('ins[class="adsbygoogle"]')) {
      ads.push({
        name: 'Google AdSense',
        version: 'Unknown',
        category: 'Advertising',
        confidence: 'High',
        evidence: 'AdSense scripts or elements found'
      });
    }

    // Google Ad Manager
    if (document.querySelector('script[src*="doubleclick"]') ||
        document.querySelector('script[src*="googletagservices"]')) {
      ads.push({
        name: 'Google Ad Manager',
        version: 'Unknown',
        category: 'Advertising',
        confidence: 'High',
        evidence: 'Google Ad Manager scripts found'
      });
    }

    return ads;
  }

  // Security tools tespit et
  detectSecurityTools() {
    const security = [];

    // reCAPTCHA
    if (window.grecaptcha || document.querySelector('script[src*="recaptcha"]') ||
        document.querySelector('.g-recaptcha')) {
      security.push({
        name: 'reCAPTCHA',
        version: 'Unknown',
        category: 'Security',
        confidence: 'High',
        evidence: 'reCAPTCHA scripts or elements found'
      });
    }

    // hCaptcha
    if (window.hcaptcha || document.querySelector('script[src*="hcaptcha"]') ||
        document.querySelector('.h-captcha')) {
      security.push({
        name: 'hCaptcha',
        version: 'Unknown',
        category: 'Security',
        confidence: 'High',
        evidence: 'hCaptcha found'
      });
    }

    return security;
  }

  // Database ve Backend tespit et
  detectDatabaseAndBackend() {
    const backend = [];

    // Firebase
    if (window.firebase || document.querySelector('script[src*="firebase"]') ||
        document.querySelector('script[src*="firebaseapp"]')) {
      backend.push({
        name: 'Firebase',
        version: window.firebase?.SDK_VERSION || 'Unknown',
        category: 'Backend Service',
        confidence: 'High',
        evidence: 'Firebase scripts found'
      });
    }

    // Supabase
    if (window.supabase || document.querySelector('script[src*="supabase"]')) {
      backend.push({
        name: 'Supabase',
        version: 'Unknown',
        category: 'Backend Service',
        confidence: 'High',
        evidence: 'Supabase scripts found'
      });
    }

    return backend;
  }

  // UI Libraries tespit et
  detectUILibraries() {
    const ui = [];

    // Material-UI
    if (document.querySelector('[class*="MuiButton"], [class*="MuiTextField"]') ||
        document.querySelector('script[src*="material-ui"]')) {
      ui.push({
        name: 'Material-UI',
        version: 'Unknown',
        category: 'UI Library',
        confidence: 'Medium',
        evidence: 'Material-UI components found'
      });
    }

    // Ant Design
    if (document.querySelector('[class*="ant-"]') ||
        document.querySelector('script[src*="antd"]')) {
      ui.push({
        name: 'Ant Design',
        version: 'Unknown',
        category: 'UI Library',
        confidence: 'Medium',
        evidence: 'Ant Design components found'
      });
    }

    return ui;
  }

  // Payment Systems tespit et
  detectPaymentSystems() {
    const payment = [];

    // Stripe
    if (window.Stripe || document.querySelector('script[src*="stripe"]')) {
      payment.push({
        name: 'Stripe',
        version: 'Unknown',
        category: 'Payment System',
        confidence: 'High',
        evidence: 'Stripe scripts found'
      });
    }

    // PayPal
    if (window.paypal || document.querySelector('script[src*="paypal"]')) {
      payment.push({
        name: 'PayPal',
        version: 'Unknown',
        category: 'Payment System',
        confidence: 'High',
        evidence: 'PayPal scripts found'
      });
    }

    return payment;
  }

  // Social Media Integration tespit et
  detectSocialMediaIntegration() {
    const social = [];

    // Facebook SDK
    if (window.FB || document.querySelector('script[src*="connect.facebook.net"]')) {
      social.push({
        name: 'Facebook SDK',
        version: 'Unknown',
        category: 'Social Media',
        confidence: 'High',
        evidence: 'Facebook SDK found'
      });
    }

    // Twitter
    if (window.twttr || document.querySelector('script[src*="twitter"]')) {
      social.push({
        name: 'Twitter Widgets',
        version: 'Unknown',
        category: 'Social Media',
        confidence: 'High',
        evidence: 'Twitter scripts found'
      });
    }

    return social;
  }

  // Subdomain tespiti
  detectSubdomains() {
    const subdomains = new Set();
    const currentDomain = window.location.hostname;
    
    // Mevcut sayfanın subdomain'ini kontrol et
    const parts = currentDomain.split('.');
    if (parts.length > 2) {
      subdomains.add(currentDomain);
    }

    // Tüm linkleri kontrol et
    document.querySelectorAll('a[href]').forEach(link => {
      try {
        const url = new URL(link.href);
        const linkDomain = url.hostname;
        const linkParts = linkDomain.split('.');
        
        if (linkParts.length > 2) {
          // Ana domain'i çıkar
          const mainDomain = linkParts.slice(-2).join('.');
          const currentMainDomain = parts.slice(-2).join('.');
          
          // Aynı ana domain'e ait subdomain ise ekle
          if (mainDomain === currentMainDomain && linkDomain !== currentDomain) {
            subdomains.add(linkDomain);
          }
        }
      } catch (e) {
        // Geçersiz URL'leri atla
      }
    });

    // Script ve CSS kaynaklarını kontrol et
    document.querySelectorAll('script[src], link[href]').forEach(element => {
      try {
        const src = element.src || element.href;
        if (src) {
          const url = new URL(src);
          const domain = url.hostname;
          const domainParts = domain.split('.');
          
          if (domainParts.length > 2) {
            const mainDomain = domainParts.slice(-2).join('.');
            const currentMainDomain = parts.slice(-2).join('.');
            
            if (mainDomain === currentMainDomain && domain !== currentDomain) {
              subdomains.add(domain);
            }
          }
        }
      } catch (e) {
        // Geçersiz URL'leri atla
      }
    });

    return subdomains;
  }

  // Dış domain tespiti
  detectExternalDomains() {
    const externalDomains = new Set();
    const currentDomain = window.location.hostname;
    const parts = currentDomain.split('.');
    const currentMainDomain = parts.slice(-2).join('.');

    // Tüm kaynakları kontrol et
    document.querySelectorAll('script[src], link[href], img[src], iframe[src]').forEach(element => {
      try {
        const src = element.src || element.href;
        if (src && src.startsWith('http')) {
          const url = new URL(src);
          const domain = url.hostname;
          const domainParts = domain.split('.');
          const mainDomain = domainParts.slice(-2).join('.');
          
          // Farklı ana domain ise dış domain olarak ekle
          if (mainDomain !== currentMainDomain) {
            externalDomains.add(domain);
          }
        }
      } catch (e) {
        // Geçersiz URL'leri atla
      }
    });

    return externalDomains;
  }

  // Yardımcı metodlar
  checkStylesheet(keyword) {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    return Array.from(stylesheets).some(link => 
      link.href.toLowerCase().includes(keyword.toLowerCase())
    );
  }

  getVersionFromScript(keyword) {
    const scripts = document.querySelectorAll('script[src]');
    for (const script of scripts) {
      if (script.src.toLowerCase().includes(keyword.toLowerCase())) {
        const match = script.src.match(/(\d+\.\d+\.\d+)/);
        if (match) return match[1];
      }
    }
    return 'Unknown';
  }

  getVersionFromStylesheet(keyword) {
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
    for (const link of stylesheets) {
      if (link.href.toLowerCase().includes(keyword.toLowerCase())) {
        const match = link.href.match(/(\d+\.\d+\.\d+)/);
        if (match) return match[1];
      }
    }
    return 'Unknown';
  }

  getBootstrapVersion() {
    const bootstrapLink = document.querySelector('link[href*="bootstrap"]');
    if (bootstrapLink) {
      const match = bootstrapLink.href.match(/bootstrap[\/\-](\d+\.\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    return 'Unknown';
  }

  getFontAwesomeVersion() {
    const faLink = document.querySelector('link[href*="font-awesome"]');
    if (faLink) {
      const match = faLink.href.match(/(\d+\.\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    return 'Unknown';
  }

  getWordPressVersion() {
    const generator = document.querySelector('meta[name="generator"][content*="WordPress"]');
    if (generator) {
      const match = generator.content.match(/WordPress (\d+\.\d+(?:\.\d+)?)/);
      return match ? match[1] : 'Unknown';
    }
    return 'Unknown';
  }

  getDrupalVersion() {
    const generator = document.querySelector('meta[name="generator"][content*="Drupal"]');
    if (generator) {
      const match = generator.content.match(/Drupal (\d+)/);
      return match ? match[1] : 'Unknown';
    }
    return 'Unknown';
  }

  getJoomlaVersion() {
    const generator = document.querySelector('meta[name="generator"][content*="Joomla"]');
    if (generator) {
      const match = generator.content.match(/Joomla! (\d+\.\d+)/);
      return match ? match[1] : 'Unknown';
    }
    return 'Unknown';
  }

  hasTailwindClasses() {
    const tailwindPatterns = [
      /\bbg-\w+(-\d+)?\b/,
      /\btext-\w+(-\d+)?\b/,
      /\bp-\d+\b/,
      /\bm-\d+\b/,
      /\bflex\b/,
      /\bgrid\b/,
      /\bhidden\b/,
      /\bblock\b/
    ];

    const allClasses = Array.from(document.querySelectorAll('*'))
      .map(el => el.className)
      .join(' ');

    return tailwindPatterns.some(pattern => pattern.test(allClasses));
  }

  extractVersionFromGenerator(content) {
    const match = content.match(/(\d+\.\d+(?:\.\d+)?)/);
    return match ? match[1] : 'Unknown';
  }

  removeDuplicates(technologies) {
    const seen = new Set();
    return technologies.filter(tech => {
      const key = `${tech.name}-${tech.category}`;
      if (seen.has(key)) {
        return false;
      }
      seen.add(key);
      return true;
    });
  }

  initializeDetectionRules() {
    // Gelecekte daha karmaşık tespit kuralları için
    return {};
  }
}

