// Background Service Worker - Sağlam İletişim ve Hata Yönetimi
class BackgroundManager {
  constructor() {
    this.analysisCache = new Map();
    this.contentScriptReady = new Map(); // Tab ID -> ready status
    this.init();
  }

  init() {
    console.log('Background service worker initialized');
    
    // Runtime mesajlarını dinle
    chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
      this.handleMessage(request, sender, sendResponse);
      return true; // Asenkron yanıt için
    });

    // Tab güncellemelerini dinle
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'complete' && tab.url) {
        this.handleTabUpdate(tabId, tab);
      }
    });

    // Tab kapatıldığında cache'i temizle
    chrome.tabs.onRemoved.addListener((tabId) => {
      this.contentScriptReady.delete(tabId);
    });

    // Uzantı ikonuna tıklanma
    chrome.action.onClicked.addListener((tab) => {
      console.log('Extension icon clicked for tab:', tab.id);
    });
  }

  async handleMessage(request, sender, sendResponse) {
    console.log('Background received message:', request.action);

    try {
      switch (request.action) {
        case 'getTabInfo':
          const tabInfo = await this.getActiveTabInfo();
          sendResponse(tabInfo);
          break;

        case 'getAnalysisData':
          const cachedData = this.getAnalysisFromCache(request.domain);
          sendResponse(cachedData);
          break;

        case 'analyzeCurrentTab':
          const analysisResult = await this.analyzeCurrentTabSafely();
          sendResponse(analysisResult);
          break;

        case 'analysisComplete':
          this.storeAnalysisData(request.data);
          sendResponse({ success: true });
          break;

        case 'contentScriptReady':
          if (sender.tab) {
            this.contentScriptReady.set(sender.tab.id, true);
            console.log('Content script ready for tab:', sender.tab.id);
          }
          sendResponse({ success: true });
          break;

        default:
          console.warn('Unknown action:', request.action);
          sendResponse({ error: 'Unknown action' });
      }
    } catch (error) {
      console.error('Message handling failed:', error);
      sendResponse({ error: error.message });
    }
  }

  async getActiveTabInfo() {
    try {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs.length === 0) {
        throw new Error('Aktif tab bulunamadı');
      }

      const tab = tabs[0];
      const url = new URL(tab.url);
      
      return {
        id: tab.id,
        url: tab.url,
        domain: url.hostname,
        title: tab.title,
        isSecure: url.protocol === 'https:',
        protocol: url.protocol
      };
    } catch (error) {
      console.error('Failed to get active tab info:', error);
      throw new Error('Tab bilgisi alınamadı');
    }
  }

  async analyzeCurrentTabSafely() {
    try {
      const tabInfo = await this.getActiveTabInfo();
      
      // Özel sayfaları kontrol et
      if (this.isSpecialPage(tabInfo.url)) {
        throw new Error('Bu sayfa analiz edilemiyor (Chrome özel sayfası)');
      }

      console.log('Starting safe analysis for:', tabInfo.domain);

      // Önce cache'i kontrol et
      const cachedData = this.getAnalysisFromCache(tabInfo.domain);
      if (cachedData && this.isRecentAnalysis(cachedData)) {
        console.log('Using recent cached analysis');
        return cachedData;
      }

      // Content script ile güvenli iletişim dene
      let analysisData = null;
      
      try {
        analysisData = await this.tryContentScriptAnalysis(tabInfo);
        console.log('Content script analysis successful');
      } catch (contentError) {
        console.warn('Content script analysis failed:', contentError.message);
        // Fallback: Basit analiz yap
        analysisData = await this.performBasicAnalysis(tabInfo);
        console.log('Using fallback basic analysis');
      }
      
      if (analysisData && analysisData.success) {
        // Cache'e kaydet
        this.storeAnalysisData(analysisData);
        return analysisData;
      } else {
        throw new Error('Analiz başarısız oldu');
      }

    } catch (error) {
      console.error('Safe analysis failed:', error);
      // Son çare: En basit analiz
      try {
        const tabInfo = await this.getActiveTabInfo();
        return await this.performMinimalAnalysis(tabInfo);
      } catch (finalError) {
        throw new Error('Analiz tamamen başarısız: ' + finalError.message);
      }
    }
  }

  async tryContentScriptAnalysis(tabInfo) {
    const maxRetries = 2; // Retry sayısını azalt
    const retryDelay = 500; // Delay'i azalt

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`Content script analysis attempt ${attempt}/${maxRetries}`);
        
        // Kısa timeout ile content script kontrolü
        const isReady = await this.checkContentScriptReady(tabInfo.id);
        
        if (!isReady && attempt === 1) {
          // Sadece ilk denemede enjekte et
          await this.injectContentScripts(tabInfo.id);
          await this.sleep(retryDelay);
        }

        // Kısa timeout ile analiz isteği
        const response = await this.sendMessageToTabSafely(tabInfo.id, { 
          action: 'performAnalysis' 
        }, 3000); // 3 saniye timeout
        
        if (response && response.success) {
          return response.data;
        } else {
          throw new Error(response?.error || 'Content script response invalid');
        }

      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error.message);
        
        if (attempt < maxRetries) {
          console.log(`Retrying in ${retryDelay}ms...`);
          await this.sleep(retryDelay);
        } else {
          throw error;
        }
      }
    }
  }

  async checkContentScriptReady(tabId) {
    try {
      const response = await this.sendMessageToTabSafely(tabId, { action: 'ping' }, 1000); // 1 saniye timeout
      return response && response.status === 'ready';
    } catch (error) {
      console.log('Content script not ready:', error.message);
      return false;
    }
  }

  async injectContentScripts(tabId) {
    try {
      console.log('Injecting content scripts for tab:', tabId);
      
      // Security analyzer'ı enjekte et
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['src/content/security-analyzer.js']
      });

      // Technology detector'ı enjekte et
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['src/content/technology-detector.js']
      });

      // Ana content script'i enjekte et
      await chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: ['src/content/content.js']
      });

      console.log('Content scripts injected successfully');
      
      // Kısa bekleme ki script'ler yüklensin
      await this.sleep(800); // 800ms'ye azalt
      
    } catch (error) {
      console.error('Failed to inject content scripts:', error);
      throw new Error('Content script enjeksiyonu başarısız');
    }
  }

  async sendMessageToTabSafely(tabId, message, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Message timeout'));
      }, timeout);

      try {
        chrome.tabs.sendMessage(tabId, message, (response) => {
          clearTimeout(timeoutId);
          
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  async performBasicAnalysis(tabInfo) {
    console.log('Performing basic analysis for:', tabInfo.domain);

    const analysis = {
      url: tabInfo.url,
      domain: tabInfo.domain,
      title: tabInfo.title,
      timestamp: Date.now(),
      isSecure: tabInfo.isSecure,
      technologies: this.detectBasicTechnologies(tabInfo),
      subdomains: this.detectBasicSubdomains(tabInfo.domain),
      externalDomains: this.detectBasicExternalDomains(tabInfo.domain),
      vulnerabilities: this.detectBasicVulnerabilities(tabInfo),
      securityHeaders: {},
      forms: [],
      certificates: {
        protocol: tabInfo.protocol,
        secureContext: tabInfo.isSecure
      },
      success: true,
      analysisType: 'basic'
    };

    return analysis;
  }

  async performMinimalAnalysis(tabInfo) {
    console.log('Performing minimal analysis for:', tabInfo.domain);

    return {
      url: tabInfo.url,
      domain: tabInfo.domain,
      title: tabInfo.title,
      timestamp: Date.now(),
      isSecure: tabInfo.isSecure,
      technologies: [
        {
          name: 'Web Browser',
          category: 'Browser',
          confidence: 'High',
          evidence: 'Browser detected'
        }
      ],
      subdomains: [],
      externalDomains: [],
      vulnerabilities: tabInfo.isSecure ? [] : [
        {
          type: 'Insecure Connection',
          severity: 'High',
          description: 'Site HTTP protokolü kullanıyor',
          recommendation: 'HTTPS kullanın'
        }
      ],
      securityHeaders: {},
      forms: [],
      certificates: {
        protocol: tabInfo.protocol,
        secureContext: tabInfo.isSecure
      },
      success: true,
      analysisType: 'minimal'
    };
  }

  detectBasicTechnologies(tabInfo) {
    const technologies = [];
    const domain = tabInfo.domain.toLowerCase();
    const url = tabInfo.url.toLowerCase();

    // Domain tabanlı tespit
    const domainMappings = {
      'github.com': { name: 'GitHub', category: 'Development Platform' },
      'github.io': { name: 'GitHub Pages', category: 'Hosting' },
      'wordpress.com': { name: 'WordPress.com', category: 'CMS' },
      'shopify.com': { name: 'Shopify', category: 'E-commerce' },
      'myshopify.com': { name: 'Shopify Store', category: 'E-commerce' },
      'google.com': { name: 'Google Services', category: 'Web Service' },
      'googleapis.com': { name: 'Google APIs', category: 'API Service' },
      'cloudflare.com': { name: 'Cloudflare', category: 'CDN' },
      'amazonaws.com': { name: 'AWS', category: 'Cloud Service' },
      'netlify.app': { name: 'Netlify', category: 'Hosting' },
      'vercel.app': { name: 'Vercel', category: 'Hosting' },
      'herokuapp.com': { name: 'Heroku', category: 'Hosting' }
    };

    // URL path tabanlı tespit
    const pathMappings = {
      'wp-content': { name: 'WordPress', category: 'CMS' },
      'wp-admin': { name: 'WordPress', category: 'CMS' },
      'wp-includes': { name: 'WordPress', category: 'CMS' },
      'drupal': { name: 'Drupal', category: 'CMS' },
      'joomla': { name: 'Joomla', category: 'CMS' }
    };

    // Domain kontrolü
    for (const [domainKey, tech] of Object.entries(domainMappings)) {
      if (domain.includes(domainKey)) {
        technologies.push({
          name: tech.name,
          category: tech.category,
          confidence: 'High',
          evidence: `${domainKey} domain detected`
        });
      }
    }

    // Path kontrolü
    for (const [pathKey, tech] of Object.entries(pathMappings)) {
      if (url.includes(pathKey)) {
        technologies.push({
          name: tech.name,
          category: tech.category,
          confidence: 'Medium',
          evidence: `${pathKey} path detected`
        });
      }
    }

    // Protokol tabanlı
    if (tabInfo.isSecure) {
      technologies.push({
        name: 'HTTPS',
        category: 'Security',
        confidence: 'High',
        evidence: 'HTTPS protocol detected'
      });
    }

    return technologies;
  }

  detectBasicSubdomains(domain) {
    const parts = domain.split('.');
    const subdomains = [];

    if (parts.length > 2) {
      // Mevcut domain bir subdomain
      subdomains.push(domain);
      
      // Yaygın subdomain'leri tahmin et
      const mainDomain = parts.slice(-2).join('.');
      const commonSubdomains = ['www', 'api', 'cdn', 'static', 'assets', 'blog'];
      
      commonSubdomains.forEach(sub => {
        const subdomain = `${sub}.${mainDomain}`;
        if (subdomain !== domain) {
          subdomains.push(subdomain);
        }
      });
    }

    return subdomains.slice(0, 5);
  }

  detectBasicExternalDomains(domain) {
    const parts = domain.split('.');
    const mainDomain = parts.slice(-2).join('.');
    
    // Yaygın external domain'ler
    const commonExternals = [
      'googleapis.com',
      'googletagmanager.com',
      'google-analytics.com',
      'facebook.net',
      'cloudflare.com',
      'jsdelivr.net',
      'unpkg.com',
      'cdnjs.cloudflare.com'
    ];

    return commonExternals.filter(ext => !ext.includes(mainDomain));
  }

  detectBasicVulnerabilities(tabInfo) {
    const vulnerabilities = [];

    // HTTP kontrolü
    if (!tabInfo.isSecure) {
      vulnerabilities.push({
        type: 'Insecure Connection',
        severity: 'High',
        description: 'Site HTTP protokolü kullanıyor, HTTPS kullanılmalı',
        recommendation: 'SSL sertifikası yükleyin ve HTTPS\'e geçin'
      });
    }

    // Subdomain kontrolü
    const parts = tabInfo.domain.split('.');
    if (parts.length > 2) {
      vulnerabilities.push({
        type: 'Subdomain Usage',
        severity: 'Low',
        description: 'Subdomain kullanımı tespit edildi',
        recommendation: 'Subdomain güvenlik politikalarını gözden geçirin'
      });
    }

    return vulnerabilities;
  }

  storeAnalysisData(data) {
    if (!data || !data.domain) return;

    const cacheKey = data.domain;
    const cacheData = {
      ...data,
      cachedAt: Date.now()
    };

    this.analysisCache.set(cacheKey, cacheData);
    
    // Chrome storage'a da kaydet
    chrome.storage.local.set({
      [`analysis_${cacheKey}`]: cacheData
    }).catch(error => {
      console.warn('Failed to store analysis in chrome.storage:', error);
    });

    console.log('Analysis data stored for:', cacheKey);
  }

  getAnalysisFromCache(domain) {
    if (!domain) return null;
    return this.analysisCache.get(domain) || null;
  }

  isRecentAnalysis(data) {
    if (!data || !data.cachedAt) return false;
    const maxAge = 5 * 60 * 1000; // 5 dakika
    return (Date.now() - data.cachedAt) < maxAge;
  }

  isSpecialPage(url) {
    const specialPrefixes = [
      'chrome://',
      'chrome-extension://',
      'moz-extension://',
      'edge://',
      'about:',
      'file://'
    ];

    return specialPrefixes.some(prefix => url.startsWith(prefix));
  }

  handleTabUpdate(tabId, tab) {
    // Tab güncellendiğinde content script ready durumunu sıfırla
    this.contentScriptReady.delete(tabId);
    
    // Cache'i temizle
    if (tab.url) {
      try {
        const url = new URL(tab.url);
        const domain = url.hostname;
        this.analysisCache.delete(domain);
        console.log('Tab updated, cache cleared for:', domain);
      } catch (error) {
        console.warn('Failed to process tab update:', error);
      }
    }
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Background manager'ı başlat
const backgroundManager = new BackgroundManager();

