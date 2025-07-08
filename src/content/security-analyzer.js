// Güvenlik Analizi Modülü
class SecurityAnalyzer {
  constructor() {
    this.vulnerabilities = [];
    this.securityHeaders = {};
    this.sslInfo = {};
  }

  // Ana güvenlik analizi (alias metod)
  async analyze() {
    return await this.performSecurityAnalysis();
  }

  // Ana güvenlik analizi
  async performSecurityAnalysis() {
    const results = {
      vulnerabilities: [],
      securityHeaders: {},
      sslInfo: {},
      formSecurity: [],
      cookieSecurity: [],
      contentSecurity: {}
    };

    try {
      results.vulnerabilities = await this.checkVulnerabilities();
      results.securityHeaders = await this.analyzeSecurityHeaders();
      results.sslInfo = await this.analyzeSSL();
      results.formSecurity = await this.analyzeFormSecurity();
      results.cookieSecurity = await this.analyzeCookieSecurity();
      results.contentSecurity = await this.analyzeContentSecurity();
    } catch (error) {
      console.error('Security analysis failed:', error);
    }

    return results;
  }

  // Güvenlik açıklarını kontrol et
  async checkVulnerabilities() {
    const vulnerabilities = [];

    // HTTP üzerinden şifre formu
    if (this.checkInsecurePasswordForm()) {
      vulnerabilities.push({
        type: 'Insecure Password Form',
        severity: 'High',
        description: 'Şifre formu güvensiz HTTP bağlantısı üzerinden gönderiliyor',
        recommendation: 'HTTPS kullanın'
      });
    }

    // Mixed Content
    const mixedContent = this.checkMixedContent();
    if (mixedContent.length > 0) {
      vulnerabilities.push({
        type: 'Mixed Content',
        severity: 'Medium',
        description: `${mixedContent.length} HTTP kaynak HTTPS sayfada yükleniyor`,
        recommendation: 'Tüm kaynakları HTTPS üzerinden yükleyin',
        details: mixedContent
      });
    }

    // Inline Script Injection Risk
    const inlineScripts = this.checkInlineScripts();
    if (inlineScripts.count > 10) {
      vulnerabilities.push({
        type: 'Excessive Inline Scripts',
        severity: 'Low',
        description: `${inlineScripts.count} inline script tespit edildi`,
        recommendation: 'Inline script\'leri harici dosyalara taşıyın ve CSP kullanın'
      });
    }

    // Clickjacking Risk
    if (this.checkClickjackingRisk()) {
      vulnerabilities.push({
        type: 'Clickjacking Risk',
        severity: 'Medium',
        description: 'X-Frame-Options header\'ı bulunamadı',
        recommendation: 'X-Frame-Options: DENY veya SAMEORIGIN header\'ı ekleyin'
      });
    }

    // Autocomplete on sensitive fields
    const sensitiveAutocomplete = this.checkSensitiveAutocomplete();
    if (sensitiveAutocomplete.length > 0) {
      vulnerabilities.push({
        type: 'Sensitive Field Autocomplete',
        severity: 'Low',
        description: 'Hassas alanlarda autocomplete etkin',
        recommendation: 'Şifre ve kredi kartı alanlarında autocomplete="off" kullanın',
        details: sensitiveAutocomplete
      });
    }

    // Open Redirect Risk
    const openRedirects = this.checkOpenRedirects();
    if (openRedirects.length > 0) {
      vulnerabilities.push({
        type: 'Potential Open Redirect',
        severity: 'Medium',
        description: 'Potansiyel açık yönlendirme tespit edildi',
        recommendation: 'URL parametrelerini doğrulayın',
        details: openRedirects
      });
    }

    return vulnerabilities;
  }

  // Güvenlik header'larını analiz et
  async analyzeSecurityHeaders() {
    const headers = {};

    // Meta tag'lerden CSP kontrol et
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    headers['Content-Security-Policy'] = cspMeta ? 
      { value: cspMeta.getAttribute('content'), source: 'meta' } : 
      { value: 'Not found', source: 'none' };

    // Referrer Policy
    const referrerMeta = document.querySelector('meta[name="referrer"]');
    headers['Referrer-Policy'] = referrerMeta ? 
      { value: referrerMeta.getAttribute('content'), source: 'meta' } : 
      { value: 'Not set', source: 'none' };

    // X-Frame-Options (meta tag olarak nadiren kullanılır)
    const frameMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    headers['X-Frame-Options'] = frameMeta ? 
      { value: frameMeta.getAttribute('content'), source: 'meta' } : 
      { value: 'Not detectable', source: 'none' };

    // Diğer header'lar content script'ten tespit edilemez
    headers['Strict-Transport-Security'] = { value: 'Not detectable from content script', source: 'none' };
    headers['X-Content-Type-Options'] = { value: 'Not detectable from content script', source: 'none' };
    headers['X-XSS-Protection'] = { value: 'Not detectable from content script', source: 'none' };

    return headers;
  }

  // SSL/TLS analizi
  async analyzeSSL() {
    const sslInfo = {
      isHTTPS: window.location.protocol === 'https:',
      protocol: window.location.protocol,
      mixedContent: this.checkMixedContent(),
      secureContext: window.isSecureContext,
      hsts: false // Content script'ten tespit edilemez
    };

    return sslInfo;
  }

  // Form güvenliği analizi
  async analyzeFormSecurity() {
    const forms = document.querySelectorAll('form');
    const formAnalysis = [];

    forms.forEach((form, index) => {
      const analysis = {
        index: index,
        action: form.action || window.location.href,
        method: (form.method || 'GET').toUpperCase(),
        isHTTPS: this.isHTTPSForm(form),
        hasPasswordField: form.querySelector('input[type="password"]') !== null,
        hasFileUpload: form.querySelector('input[type="file"]') !== null,
        hasCSRFToken: this.hasCSRFProtection(form),
        hasAutocompleteOff: this.hasAutocompleteOff(form),
        sensitiveFields: this.getSensitiveFields(form),
        enctype: form.enctype || 'application/x-www-form-urlencoded'
      };

      formAnalysis.push(analysis);
    });

    return formAnalysis;
  }

  // Cookie güvenliği analizi
  async analyzeCookieSecurity() {
    const cookies = document.cookie.split(';');
    const cookieAnalysis = {
      total: cookies.length,
      secure: 0,
      httpOnly: 0, // JavaScript'ten tespit edilemez
      sameSite: 0, // JavaScript'ten tespit edilemez
      issues: []
    };

    if (window.location.protocol === 'https:' && document.cookie) {
      cookieAnalysis.issues.push({
        type: 'Cookie Security',
        description: 'HTTPS sitede cookie güvenlik bayrakları kontrol edilemiyor',
        recommendation: 'Cookie\'lerde Secure, HttpOnly ve SameSite bayraklarını kullanın'
      });
    }

    return cookieAnalysis;
  }

  // İçerik güvenliği analizi
  async analyzeContentSecurity() {
    const contentSecurity = {
      inlineScripts: this.checkInlineScripts(),
      externalScripts: this.getExternalScripts(),
      iframes: this.analyzeIframes(),
      objectEmbeds: this.analyzeObjectEmbeds()
    };

    return contentSecurity;
  }

  // Yardımcı metodlar
  checkInsecurePasswordForm() {
    return window.location.protocol === 'http:' && 
           document.querySelector('input[type="password"]') !== null;
  }

  checkMixedContent() {
    if (window.location.protocol !== 'https:') return [];

    const httpResources = [];

    // HTTP script'ler
    document.querySelectorAll('script[src]').forEach(script => {
      if (script.src.startsWith('http://')) {
        httpResources.push({ type: 'script', url: script.src });
      }
    });

    // HTTP CSS'ler
    document.querySelectorAll('link[href]').forEach(link => {
      if (link.href.startsWith('http://')) {
        httpResources.push({ type: 'stylesheet', url: link.href });
      }
    });

    // HTTP resimler
    document.querySelectorAll('img[src]').forEach(img => {
      if (img.src.startsWith('http://')) {
        httpResources.push({ type: 'image', url: img.src });
      }
    });

    return httpResources;
  }

  checkInlineScripts() {
    const inlineScripts = document.querySelectorAll('script:not([src])');
    return {
      count: inlineScripts.length,
      hasEventHandlers: this.checkInlineEventHandlers()
    };
  }

  checkInlineEventHandlers() {
    const elements = document.querySelectorAll('*');
    let count = 0;
    
    elements.forEach(el => {
      const attributes = el.attributes;
      for (let attr of attributes) {
        if (attr.name.startsWith('on')) {
          count++;
        }
      }
    });

    return count > 0;
  }

  checkClickjackingRisk() {
    // X-Frame-Options meta tag kontrolü
    const frameMeta = document.querySelector('meta[http-equiv="X-Frame-Options"]');
    const cspMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
    
    if (frameMeta) return false;
    if (cspMeta && cspMeta.content.includes('frame-ancestors')) return false;
    
    return true; // Potansiyel risk
  }

  checkSensitiveAutocomplete() {
    const sensitiveFields = [];
    const sensitiveSelectors = [
      'input[type="password"]',
      'input[name*="password"]',
      'input[name*="credit"]',
      'input[name*="card"]',
      'input[name*="cvv"]',
      'input[name*="ssn"]'
    ];

    sensitiveSelectors.forEach(selector => {
      document.querySelectorAll(selector).forEach(field => {
        if (field.autocomplete !== 'off' && field.autocomplete !== 'new-password') {
          sensitiveFields.push({
            type: field.type,
            name: field.name,
            autocomplete: field.autocomplete
          });
        }
      });
    });

    return sensitiveFields;
  }

  checkOpenRedirects() {
    const redirectParams = [];
    const urlParams = new URLSearchParams(window.location.search);
    
    const suspiciousParams = ['redirect', 'url', 'return', 'goto', 'next', 'continue'];
    
    suspiciousParams.forEach(param => {
      if (urlParams.has(param)) {
        const value = urlParams.get(param);
        if (value.startsWith('http://') || value.startsWith('https://')) {
          redirectParams.push({ param, value });
        }
      }
    });

    return redirectParams;
  }

  isHTTPSForm(form) {
    if (form.action) {
      return form.action.startsWith('https://');
    }
    return window.location.protocol === 'https:';
  }

  hasCSRFProtection(form) {
    const csrfSelectors = [
      'input[name*="csrf"]',
      'input[name*="token"]',
      'input[name="_token"]',
      'input[name="authenticity_token"]',
      'input[name="_csrf_token"]'
    ];

    return csrfSelectors.some(selector => form.querySelector(selector) !== null);
  }

  hasAutocompleteOff(form) {
    return form.autocomplete === 'off';
  }

  getSensitiveFields(form) {
    const sensitiveFields = [];
    const sensitiveTypes = ['password', 'email'];
    
    form.querySelectorAll('input').forEach(input => {
      if (sensitiveTypes.includes(input.type) || 
          input.name.toLowerCase().includes('password') ||
          input.name.toLowerCase().includes('credit')) {
        sensitiveFields.push({
          type: input.type,
          name: input.name,
          autocomplete: input.autocomplete
        });
      }
    });

    return sensitiveFields;
  }

  getExternalScripts() {
    const externalScripts = [];
    document.querySelectorAll('script[src]').forEach(script => {
      if (!script.src.startsWith(window.location.origin)) {
        externalScripts.push({
          src: script.src,
          domain: new URL(script.src).hostname,
          async: script.async,
          defer: script.defer
        });
      }
    });
    return externalScripts;
  }

  analyzeIframes() {
    const iframes = [];
    document.querySelectorAll('iframe').forEach(iframe => {
      iframes.push({
        src: iframe.src,
        sandbox: iframe.sandbox.toString(),
        allowFullscreen: iframe.allowFullscreen
      });
    });
    return iframes;
  }

  analyzeObjectEmbeds() {
    const objects = [];
    document.querySelectorAll('object, embed').forEach(obj => {
      objects.push({
        type: obj.tagName.toLowerCase(),
        src: obj.src || obj.data,
        contentType: obj.type
      });
    });
    return objects;
  }
}

