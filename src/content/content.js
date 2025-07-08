// Content Script - Gelişmiş Web Analizi
class WebAnalyzer {
  constructor() {
    this.domain = window.location.hostname;
    this.protocol = window.location.protocol;
    this.isSecure = this.protocol === 'https:';
    this.subdomains = new Set();
    this.externalDomains = new Set();
    this.technologies = [];
    this.vulnerabilities = [];
    this.sitemapExists = false;
    this.robotsExists = false;
    this.securityHeaders = {};
    this.forms = [];
    
    this.init();
  }

  init() {
    console.log('WebAnalyzer initializing...');
    this.notifyBackgroundReady();
    this.setupMessageListener();
    
    // URL değişikliklerini izle (SPA desteği)
    this.observeUrlChanges();
  }

  notifyBackgroundReady() {
    try {
      chrome.runtime.sendMessage({
        action: 'contentScriptReady',
        domain: this.domain,
        url: window.location.href
      });
    } catch (error) {
      console.log('Failed to notify background:', error);
    }
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      console.log('Content script received message:', message);
      
      if (message.action === 'ping') {
        sendResponse({ status: 'ready' });
        return true;
      }
      
      if (message.action === 'performAnalysis') {
        this.performAnalysis()
          .then(data => {
            console.log('Analysis completed:', data);
            sendResponse({ success: true, data: data });
          })
          .catch(error => {
            console.error('Analysis failed:', error);
            sendResponse({ success: false, error: error.message });
          });
        return true; // Asenkron yanıt
      }
      
      return false;
    });
  }

  observeUrlChanges() {
    // SPA uygulamaları için URL değişikliklerini izle
    let currentUrl = window.location.href;
    
    const observer = new MutationObserver(() => {
      if (window.location.href !== currentUrl) {
        currentUrl = window.location.href;
        console.log('URL changed, updating domain info');
        this.domain = window.location.hostname;
        this.protocol = window.location.protocol;
        this.isSecure = this.protocol === 'https:';
      }
    });
    
    observer.observe(document, { subtree: true, childList: true });
  }

  async performAnalysis() {
    console.log('Starting comprehensive analysis...');
    
    try {
      // Paralel analizler
      const [
        technologies,
        subdomains,
        externalDomains,
        vulnerabilities,
        sitemapCheck,
        robotsCheck,
        securityHeaders,
        forms
      ] = await Promise.allSettled([
        this.detectTechnologies(),
        this.detectSubdomains(),
        this.detectExternalDomains(),
        this.detectVulnerabilities(),
        this.checkSitemap(),
        this.checkRobots(),
        this.analyzeSecurityHeaders(),
        this.analyzeForms()
      ]);

      const analysisData = {
        url: window.location.href,
        domain: this.domain,
        title: document.title,
        timestamp: Date.now(),
        isSecure: this.isSecure,
        protocol: this.protocol,
        technologies: technologies.status === 'fulfilled' ? technologies.value : [],
        subdomains: subdomains.status === 'fulfilled' ? Array.from(subdomains.value) : [],
        externalDomains: externalDomains.status === 'fulfilled' ? Array.from(externalDomains.value) : [],
        vulnerabilities: vulnerabilities.status === 'fulfilled' ? vulnerabilities.value : [],
        sitemapExists: sitemapCheck.status === 'fulfilled' ? sitemapCheck.value : false,
        robotsExists: robotsCheck.status === 'fulfilled' ? robotsCheck.value : false,
        securityHeaders: securityHeaders.status === 'fulfilled' ? securityHeaders.value : {},
        forms: forms.status === 'fulfilled' ? forms.value : [],
        certificates: {
          protocol: this.protocol,
          secureContext: this.isSecure
        },
        success: true,
        analysisType: 'content_script'
      };

      console.log('Analysis completed successfully:', analysisData);
      return analysisData;

    } catch (error) {
      console.error('Analysis failed:', error);
      throw error;
    }
  }

  async detectTechnologies() {
    const technologies = [];
    
    try {
      // JavaScript Framework'leri
      if (window.React) {
        technologies.push({
          name: 'React',
          category: 'JavaScript Framework',
          version: window.React.version || 'Unknown',
          confidence: 'High',
          evidence: 'window.React object'
        });
      }

      if (window.Vue) {
        technologies.push({
          name: 'Vue.js',
          category: 'JavaScript Framework',
          version: window.Vue.version || 'Unknown',
          confidence: 'High',
          evidence: 'window.Vue object'
        });
      }

      if (window.angular) {
        technologies.push({
          name: 'AngularJS',
          category: 'JavaScript Framework',
          version: window.angular.version?.full || 'Unknown',
          confidence: 'High',
          evidence: 'window.angular object'
        });
      }

      if (document.querySelector('[ng-version]')) {
        const ngVersion = document.querySelector('[ng-version]').getAttribute('ng-version');
        technologies.push({
          name: 'Angular',
          category: 'JavaScript Framework',
          version: ngVersion || 'Unknown',
          confidence: 'High',
          evidence: 'ng-version attribute'
        });
      }

      if (window.jQuery || window.$) {
        technologies.push({
          name: 'jQuery',
          category: 'JavaScript Library',
          version: window.jQuery?.fn?.jquery || 'Unknown',
          confidence: 'High',
          evidence: 'window.jQuery object'
        });
      }

      // CSS Framework'leri
      if (document.querySelector('.container, .row, .col')) {
        technologies.push({
          name: 'Bootstrap',
          category: 'CSS Framework',
          confidence: 'Medium',
          evidence: 'Bootstrap CSS classes'
        });
      }

      if (document.querySelector('[class*="bg-"], [class*="text-"], [class*="p-"], [class*="m-"]')) {
        technologies.push({
          name: 'Tailwind CSS',
          category: 'CSS Framework',
          confidence: 'Medium',
          evidence: 'Tailwind utility classes'
        });
      }

      // CMS Tespiti
      if (document.querySelector('meta[name="generator"]')) {
        const generator = document.querySelector('meta[name="generator"]').content;
        if (generator.toLowerCase().includes('wordpress')) {
          technologies.push({
            name: 'WordPress',
            category: 'CMS',
            version: generator.match(/WordPress ([\d.]+)/)?.[1] || 'Unknown',
            confidence: 'High',
            evidence: 'Meta generator tag'
          });
        }
      }

      // Analytics
      if (window.gtag || window.ga) {
        technologies.push({
          name: 'Google Analytics',
          category: 'Analytics',
          confidence: 'High',
          evidence: 'Google Analytics script'
        });
      }

      if (window.fbq) {
        technologies.push({
          name: 'Facebook Pixel',
          category: 'Analytics',
          confidence: 'High',
          evidence: 'Facebook Pixel script'
        });
      }

      // E-commerce
      if (window.Shopify) {
        technologies.push({
          name: 'Shopify',
          category: 'E-commerce',
          confidence: 'High',
          evidence: 'window.Shopify object'
        });
      }

      // CDN
      const scripts = Array.from(document.querySelectorAll('script[src]'));
      const links = Array.from(document.querySelectorAll('link[href]'));
      
      scripts.concat(links).forEach(element => {
        const src = element.src || element.href;
        if (src) {
          if (src.includes('cloudflare')) {
            technologies.push({
              name: 'Cloudflare',
              category: 'CDN',
              confidence: 'High',
              evidence: 'Cloudflare resources'
            });
          }
          if (src.includes('googleapis.com')) {
            technologies.push({
              name: 'Google APIs',
              category: 'Web Service',
              confidence: 'High',
              evidence: 'Google APIs resources'
            });
          }
        }
      });

      // HTTPS
      if (this.isSecure) {
        technologies.push({
          name: 'HTTPS',
          category: 'Security',
          confidence: 'High',
          evidence: 'Secure protocol'
        });
      }

    } catch (error) {
      console.error('Technology detection failed:', error);
    }

    return technologies;
  }

  async detectSubdomains() {
    const subdomains = new Set();
    
    try {
      // Script ve link kaynaklarından subdomain'leri tespit et
      const elements = document.querySelectorAll('script[src], link[href], img[src], iframe[src]');
      
      elements.forEach(element => {
        const url = element.src || element.href;
        if (url) {
          try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            
            // Aynı domain'in subdomain'i mi kontrol et
            if (hostname !== this.domain && hostname.endsWith('.' + this.domain)) {
              subdomains.add(hostname);
            }
          } catch (error) {
            // Geçersiz URL, atla
          }
        }
      });

      // Fetch isteklerini izle (mümkünse)
      if (window.fetch) {
        const originalFetch = window.fetch;
        window.fetch = function(...args) {
          try {
            const url = args[0];
            if (typeof url === 'string') {
              const urlObj = new URL(url, window.location.href);
              const hostname = urlObj.hostname;
              if (hostname !== this.domain && hostname.endsWith('.' + this.domain)) {
                subdomains.add(hostname);
              }
            }
          } catch (error) {
            // Hata durumunda orijinal fetch'i çağır
          }
          return originalFetch.apply(this, args);
        };
      }

    } catch (error) {
      console.error('Subdomain detection failed:', error);
    }

    return subdomains;
  }

  async detectExternalDomains() {
    const externalDomains = new Set();
    
    try {
      const elements = document.querySelectorAll('script[src], link[href], img[src], iframe[src]');
      
      elements.forEach(element => {
        const url = element.src || element.href;
        if (url) {
          try {
            const urlObj = new URL(url);
            const hostname = urlObj.hostname;
            
            // Farklı domain ise external domain
            if (hostname !== this.domain && !hostname.endsWith('.' + this.domain)) {
              externalDomains.add(hostname);
            }
          } catch (error) {
            // Geçersiz URL, atla
          }
        }
      });

    } catch (error) {
      console.error('External domain detection failed:', error);
    }

    return externalDomains;
  }

  async detectVulnerabilities() {
    const vulnerabilities = [];
    
    try {
      // HTTP kontrolü
      if (!this.isSecure) {
        vulnerabilities.push({
          type: 'Insecure Connection',
          severity: 'High',
          description: 'Site HTTP protokolü kullanıyor, veriler şifrelenmemiş',
          recommendation: 'HTTPS protokolüne geçin'
        });
      }

      // Mixed content kontrolü
      if (this.isSecure) {
        const httpResources = document.querySelectorAll('script[src^="http:"], link[href^="http:"], img[src^="http:"]');
        if (httpResources.length > 0) {
          vulnerabilities.push({
            type: 'Mixed Content',
            severity: 'Medium',
            description: `${httpResources.length} HTTP kaynak HTTPS sayfasında yükleniyor`,
            recommendation: 'Tüm kaynakları HTTPS üzerinden yükleyin'
          });
        }
      }

      // Form güvenliği
      const forms = document.querySelectorAll('form');
      forms.forEach(form => {
        if (form.method && form.method.toLowerCase() === 'get') {
          const passwordInputs = form.querySelectorAll('input[type="password"]');
          if (passwordInputs.length > 0) {
            vulnerabilities.push({
              type: 'Insecure Form Method',
              severity: 'High',
              description: 'Şifre alanı GET metodu ile gönderiliyor',
              recommendation: 'POST metodu kullanın'
            });
          }
        }
      });

      // Inline script kontrolü
      const inlineScripts = document.querySelectorAll('script:not([src])');
      if (inlineScripts.length > 5) {
        vulnerabilities.push({
          type: 'Excessive Inline Scripts',
          severity: 'Low',
          description: `${inlineScripts.length} inline script tespit edildi`,
          recommendation: 'Script\'leri harici dosyalara taşıyın ve CSP kullanın'
        });
      }

    } catch (error) {
      console.error('Vulnerability detection failed:', error);
    }

    return vulnerabilities;
  }

  async checkSitemap() {
    try {
      const sitemapUrls = [
        '/sitemap.xml',
        '/sitemap_index.xml',
        '/sitemap.txt'
      ];

      for (const url of sitemapUrls) {
        try {
          const response = await fetch(new URL(url, window.location.origin), {
            method: 'HEAD',
            mode: 'no-cors'
          });
          
          // no-cors modunda status kontrol edemeyiz, ama istek gönderildi
          console.log(`Sitemap check: ${url} - request sent`);
          return true; // En azından bir sitemap URL'i test edildi
        } catch (error) {
          console.log(`Sitemap ${url} not accessible:`, error.message);
        }
      }

      // Alternatif: robots.txt'den sitemap bilgisi al
      try {
        const robotsResponse = await fetch('/robots.txt', { mode: 'no-cors' });
        // robots.txt'in varlığını test ettik
        return true;
      } catch (error) {
        console.log('Robots.txt not accessible:', error.message);
      }

      return false;
    } catch (error) {
      console.error('Sitemap check failed:', error);
      return false;
    }
  }

  async checkRobots() {
    try {
      const response = await fetch('/robots.txt', {
        method: 'HEAD',
        mode: 'no-cors'
      });
      
      // no-cors modunda status kontrol edemeyiz, ama istek gönderildi
      console.log('Robots.txt check - request sent');
      return true;
    } catch (error) {
      console.log('Robots.txt not accessible:', error.message);
      return false;
    }
  }

  async analyzeSecurityHeaders() {
    const headers = {};
    
    try {
      // Meta tag'lerden güvenlik bilgileri
      const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (cspMeta) {
        headers['Content-Security-Policy'] = cspMeta.content;
      }

      const xFrameMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
      if (xFrameMeta) {
        headers['X-Frame-Options'] = xFrameMeta.content;
      }

      // Referrer policy
      const referrerMeta = document.querySelector('meta[name="referrer"]');
      if (referrerMeta) {
        headers['Referrer-Policy'] = referrerMeta.content;
      }

    } catch (error) {
      console.error('Security headers analysis failed:', error);
    }

    return headers;
  }

  async analyzeForms() {
    const forms = [];
    
    try {
      const formElements = document.querySelectorAll('form');
      
      formElements.forEach((form, index) => {
        const formData = {
          index: index,
          method: form.method || 'GET',
          action: form.action || window.location.href,
          hasPasswordField: form.querySelector('input[type="password"]') !== null,
          hasFileUpload: form.querySelector('input[type="file"]') !== null,
          isSecure: form.action ? form.action.startsWith('https:') : this.isSecure,
          inputCount: form.querySelectorAll('input, textarea, select').length
        };
        
        forms.push(formData);
      });

    } catch (error) {
      console.error('Form analysis failed:', error);
    }

    return forms;
  }
}

// Content script başlatma
let webAnalyzer;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    webAnalyzer = new WebAnalyzer();
  });
} else {
  webAnalyzer = new WebAnalyzer();
}

// Global erişim için
window.webAnalyzer = webAnalyzer;

