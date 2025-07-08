// Popup JavaScript - Hızlı ve Güvenilir Analiz
class PopupManager {
  constructor() {
    this.analysisData = null;
    this.isLoading = false;
    this.currentAnalysisTimeout = null;
    this.analysisStartTime = null;
    this.progressInterval = null;
    this.init();
  }

  init() {
    console.log('PopupManager initializing...');
    this.setupEventListeners();
    this.loadAnalysisData();
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Tab butonları
    const tabButtons = document.querySelectorAll('.tab-button');
    tabButtons.forEach(button => {
      if (button) {
        button.addEventListener('click', (e) => {
          const tabName = e.target.dataset.tab;
          console.log('Tab button clicked:', tabName);
          this.switchTab(tabName);
        });
      }
    });

    // Yenile butonu
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        console.log('Refresh button clicked');
        this.performNewAnalysis();
      });
    } else {
      console.warn('Refresh button not found');
    }

    // Export butonu
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        console.log('Export button clicked');
        this.exportReport();
      });
    }

    // Retry butonu
    const retryBtn = document.getElementById('retryBtn');
    if (retryBtn) {
      retryBtn.addEventListener('click', () => {
        console.log('Retry button clicked');
        this.performNewAnalysis();
      });
    }

    // Cancel butonu (yeni)
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        console.log('Cancel button clicked');
        this.cancelAnalysis();
      });
    }
  }

  async loadAnalysisData() {
    try {
      console.log('Loading analysis data...');
      
      // Önce cache'den kontrol et
      const tabInfo = await this.getTabInfo();
      if (tabInfo && tabInfo.domain) {
        const cachedData = await this.getCachedAnalysis(tabInfo.domain);
        if (cachedData) {
          console.log('Using cached analysis data');
          this.analysisData = cachedData;
          this.displayAnalysisResults();
          this.showMainContent();
          return;
        }
      }

      // Cache yoksa yeni analiz başlat
      console.log('No cached data, starting new analysis...');
      this.performNewAnalysis();

    } catch (error) {
      console.error('Failed to load analysis data:', error);
      this.showError('Analiz verileri yüklenemedi. Lütfen tekrar deneyin.');
    }
  }

  async getTabInfo() {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({action: 'getTabInfo'}, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to get tab info:', chrome.runtime.lastError);
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  }

  async getCachedAnalysis(domain) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage({action: 'getAnalysisData', domain: domain}, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Failed to get cached analysis:', chrome.runtime.lastError);
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  }

  async performNewAnalysis() {
    if (this.isLoading) {
      console.log('Analysis already in progress, canceling current...');
      this.cancelAnalysis();
      await this.sleep(500); // Kısa bekleme
    }
    
    try {
      this.isLoading = true;
      this.analysisStartTime = Date.now();
      this.showLoading();
      this.startProgressIndicator();

      console.log('Starting new analysis...');
      
      // Kısa timeout (5 saniye)
      this.currentAnalysisTimeout = setTimeout(() => {
        console.warn('Analysis timeout reached');
        this.handleAnalysisTimeout();
      }, 5000);

      const response = await new Promise((resolve, reject) => {
        chrome.runtime.sendMessage({action: 'analyzeCurrentTab'}, (response) => {
          if (chrome.runtime.lastError) {
            console.error('Chrome runtime error:', chrome.runtime.lastError);
            reject(new Error('Uzantı iletişim hatası'));
          } else if (response && response.success && !response.error) {
            console.log('Analysis completed successfully');
            resolve(response);
          } else {
            const errorMsg = response?.error || 'Analiz başarısız';
            console.error('Analysis failed:', errorMsg);
            reject(new Error(errorMsg));
          }
        });
      });

      // Timeout'u temizle
      if (this.currentAnalysisTimeout) {
        clearTimeout(this.currentAnalysisTimeout);
        this.currentAnalysisTimeout = null;
      }

      this.analysisData = response;
      this.displayAnalysisResults();
      this.showMainContent();

    } catch (error) {
      console.error('Analysis failed:', error);
      
      // Hata türüne göre mesaj
      let userMessage = 'Analiz başarısız oldu.';
      
      if (error.message.includes('timeout') || error.message.includes('zaman aşımı')) {
        userMessage = 'Analiz çok uzun sürdü. Basit analiz yapılıyor...';
        // Basit analiz dene
        this.performQuickAnalysis();
        return;
      } else if (error.message.includes('Chrome özel sayfası')) {
        userMessage = 'Bu sayfa analiz edilemiyor. Normal bir web sitesine gidin.';
      } else if (error.message.includes('iletişim')) {
        userMessage = 'Uzantı bileşenleri yüklenemedi. Sayfayı yenileyin.';
      }
      
      this.showError(userMessage);
    } finally {
      this.isLoading = false;
      this.stopProgressIndicator();
      if (this.currentAnalysisTimeout) {
        clearTimeout(this.currentAnalysisTimeout);
        this.currentAnalysisTimeout = null;
      }
    }
  }

  async performQuickAnalysis() {
    try {
      console.log('Performing quick analysis...');
      
      const tabInfo = await this.getTabInfo();
      if (!tabInfo) {
        throw new Error('Tab bilgisi alınamadı');
      }

      // Basit analiz verisi oluştur
      const quickAnalysis = {
        url: tabInfo.url,
        domain: tabInfo.domain,
        title: tabInfo.title,
        timestamp: Date.now(),
        isSecure: tabInfo.isSecure,
        technologies: this.detectBasicTechnologies(tabInfo),
        subdomains: [],
        externalDomains: [],
        vulnerabilities: this.detectBasicVulnerabilities(tabInfo),
        securityHeaders: {},
        forms: [],
        certificates: {
          protocol: tabInfo.protocol,
          secureContext: tabInfo.isSecure
        },
        success: true,
        analysisType: 'quick'
      };

      this.analysisData = quickAnalysis;
      this.displayAnalysisResults();
      this.showMainContent();

    } catch (error) {
      console.error('Quick analysis failed:', error);
      this.showError('Hızlı analiz de başarısız oldu. Lütfen sayfayı yenileyin.');
    }
  }

  detectBasicTechnologies(tabInfo) {
    const technologies = [];
    const domain = tabInfo.domain.toLowerCase();
    const url = tabInfo.url.toLowerCase();

    // Temel domain tespiti
    const domainMappings = {
      'github.com': { name: 'GitHub', category: 'Development' },
      'google.com': { name: 'Google Services', category: 'Web Service' },
      'wordpress.com': { name: 'WordPress', category: 'CMS' },
      'shopify.com': { name: 'Shopify', category: 'E-commerce' }
    };

    for (const [domainKey, tech] of Object.entries(domainMappings)) {
      if (domain.includes(domainKey)) {
        technologies.push({
          name: tech.name,
          category: tech.category,
          confidence: 'High',
          evidence: `${domainKey} domain`
        });
      }
    }

    // HTTPS kontrolü
    if (tabInfo.isSecure) {
      technologies.push({
        name: 'HTTPS',
        category: 'Security',
        confidence: 'High',
        evidence: 'Secure protocol'
      });
    }

    return technologies;
  }

  detectBasicVulnerabilities(tabInfo) {
    const vulnerabilities = [];

    if (!tabInfo.isSecure) {
      vulnerabilities.push({
        type: 'Insecure Connection',
        severity: 'High',
        description: 'Site HTTP protokolü kullanıyor',
        recommendation: 'HTTPS kullanın'
      });
    }

    return vulnerabilities;
  }

  handleAnalysisTimeout() {
    console.warn('Analysis timed out, switching to quick analysis');
    
    if (this.currentAnalysisTimeout) {
      clearTimeout(this.currentAnalysisTimeout);
      this.currentAnalysisTimeout = null;
    }

    // Hızlı analize geç
    this.performQuickAnalysis();
  }

  cancelAnalysis() {
    console.log('Canceling current analysis...');
    
    if (this.currentAnalysisTimeout) {
      clearTimeout(this.currentAnalysisTimeout);
      this.currentAnalysisTimeout = null;
    }
    
    this.isLoading = false;
    this.stopProgressIndicator();
    
    // Loading durumunu kapat
    this.hideLoading();
  }

  startProgressIndicator() {
    let progress = 0;
    const progressBar = document.querySelector('.progress-bar');
    const progressText = document.querySelector('.progress-text');
    
    if (progressBar && progressText) {
      this.progressInterval = setInterval(() => {
        progress += 2;
        if (progress > 90) progress = 90; // %90'da dur
        
        progressBar.style.width = progress + '%';
        progressText.textContent = `Analiz ediliyor... ${progress}%`;
        
        // 5 saniye sonra uyarı
        if (Date.now() - this.analysisStartTime > 4000) {
          progressText.textContent = 'Analiz uzun sürüyor, hızlı analize geçiliyor...';
        }
      }, 100);
    }
  }

  stopProgressIndicator() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressInterval = null;
    }
  }

  showLoading() {
    const loadingDiv = document.getElementById('loading');
    const mainContent = document.getElementById('mainContent');
    const errorDiv = document.getElementById('error');
    
    if (loadingDiv) loadingDiv.style.display = 'block';
    if (mainContent) mainContent.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'none';
  }

  hideLoading() {
    const loadingDiv = document.getElementById('loading');
    if (loadingDiv) loadingDiv.style.display = 'none';
  }

  showMainContent() {
    const loadingDiv = document.getElementById('loading');
    const mainContent = document.getElementById('mainContent');
    const errorDiv = document.getElementById('error');
    
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (mainContent) mainContent.style.display = 'block';
    if (errorDiv) errorDiv.style.display = 'none';
    
    this.stopProgressIndicator();
  }

  showError(message) {
    const loadingDiv = document.getElementById('loading');
    const mainContent = document.getElementById('mainContent');
    const errorDiv = document.getElementById('error');
    const errorMessage = document.getElementById('errorMessage');
    
    if (loadingDiv) loadingDiv.style.display = 'none';
    if (mainContent) mainContent.style.display = 'none';
    if (errorDiv) errorDiv.style.display = 'block';
    if (errorMessage) errorMessage.textContent = message;
    
    this.stopProgressIndicator();
  }

  switchTab(tabName) {
    // Tab butonlarını güncelle
    document.querySelectorAll('.tab-button').forEach(btn => {
      btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');

    // Tab panellerini güncelle
    document.querySelectorAll('.tab-panel').forEach(panel => {
      panel.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
  }

  displayAnalysisResults() {
    if (!this.analysisData) return;

    console.log('Displaying analysis results:', this.analysisData);
    
    this.updateSiteInfo();
    this.updateOverviewTab();
    this.updateTechnologiesTab();
    this.updateSecurityTab();
  }

  updateSiteInfo() {
    const data = this.analysisData;
    
    const siteIcon = document.getElementById('siteIcon');
    const siteName = document.getElementById('siteName');
    const siteUrl = document.getElementById('siteUrl');
    const securityScore = document.getElementById('securityScore');

    if (siteIcon) {
      siteIcon.textContent = data.isSecure ? '🔒' : '⚠️';
    }

    if (siteName) {
      siteName.textContent = data.title || data.domain;
    }

    if (siteUrl) {
      siteUrl.textContent = data.domain;
    }

    if (securityScore) {
      const score = this.calculateSecurityScore(data);
      securityScore.textContent = score;
    }
  }

  calculateSecurityScore(data) {
    let score = 50; // Başlangıç skoru

    // HTTPS kontrolü
    if (data.isSecure) {
      score += 30;
    } else {
      score -= 20;
    }

    // Güvenlik açıkları
    const vulnCount = (data.vulnerabilities || []).length;
    score -= vulnCount * 10;

    // Teknoloji sayısı (pozitif etki)
    const techCount = (data.technologies || []).length;
    score += Math.min(techCount * 2, 20);

    return Math.max(0, Math.min(100, score));
  }

  updateOverviewTab() {
    const data = this.analysisData;
    
    // HTTPS durumu
    const httpsStatus = document.getElementById('httpsStatus');
    if (httpsStatus) {
      httpsStatus.textContent = data.isSecure ? 'Güvenli (HTTPS)' : 'Güvensiz (HTTP)';
      httpsStatus.className = data.isSecure ? 'status-secure' : 'status-insecure';
    }

    // Güvenlik uyarıları
    const securityWarnings = document.getElementById('securityWarnings');
    if (securityWarnings) {
      const vulnCount = (data.vulnerabilities || []).length;
      securityWarnings.textContent = `${vulnCount} uyarı`;
    }

    // Teknoloji sayısı
    const techCount = document.getElementById('techCount');
    if (techCount) {
      const count = (data.technologies || []).length;
      techCount.textContent = `${count} teknoloji`;
    }

    // Dış kaynaklar
    const externalCount = document.getElementById('externalCount');
    if (externalCount) {
      const subdomainCount = (data.subdomains || []).length;
      const externalDomainCount = (data.externalDomains || []).length;
      const totalExternal = subdomainCount + externalDomainCount;
      externalCount.textContent = `${totalExternal} kaynak`;
    }

    // Sitemap ve Robots.txt durumu (yeni)
    const sitemapStatus = document.getElementById('sitemapStatus');
    if (sitemapStatus) {
      sitemapStatus.textContent = data.sitemapExists ? 'Sitemap mevcut' : 'Sitemap bulunamadı';
      sitemapStatus.className = data.sitemapExists ? 'status-secure' : 'status-insecure';
    }

    const robotsStatus = document.getElementById('robotsStatus');
    if (robotsStatus) {
      robotsStatus.textContent = data.robotsExists ? 'Robots.txt mevcut' : 'Robots.txt bulunamadı';
      robotsStatus.className = data.robotsExists ? 'status-secure' : 'status-insecure';
    }
  }

  updateTechnologiesTab() {
    const container = document.getElementById('technologiesList');
    const badge = document.getElementById('techBadge');
    
    if (!container) return;

    const technologies = this.analysisData.technologies || [];
    
    if (badge) {
      badge.textContent = technologies.length;
    }

    if (technologies.length === 0) {
      container.innerHTML = '<div class="no-data">Teknoloji tespit edilmedi</div>';
      return;
    }

    // Teknolojileri kategorilere ayır
    const categories = {};
    technologies.forEach(tech => {
      const category = tech.category || 'Other';
      if (!categories[category]) {
        categories[category] = [];
      }
      categories[category].push(tech);
    });

    let html = '';
    Object.entries(categories).forEach(([category, techs]) => {
      html += `<div class="tech-category">
        <h4>${category}</h4>
        <div class="tech-items">`;
      
      techs.forEach(tech => {
        const version = tech.version && tech.version !== 'Unknown' ? ` v${tech.version}` : '';
        html += `<div class="tech-item">
          <span class="tech-name">${tech.name}${version}</span>
          <span class="tech-confidence ${tech.confidence.toLowerCase()}">${tech.confidence}</span>
        </div>`;
      });
      
      html += '</div></div>';
    });

    container.innerHTML = html;

    // Subdomain ve External Domain listelerini güncelle
    this.updateResourceLists();
  }

  updateResourceLists() {
    const data = this.analysisData;
    
    // Subdomain listesi
    const subdomainsContainer = document.getElementById('subdomainsList');
    if (subdomainsContainer) {
      const subdomains = data.subdomains || [];
      
      if (subdomains.length === 0) {
        subdomainsContainer.innerHTML = '<div class="no-data">Alt domain tespit edilmedi</div>';
      } else {
        let html = '<div class="resource-items">';
        subdomains.slice(0, 10).forEach(subdomain => {
          html += `<div class="resource-item">
            <span class="resource-name">${subdomain}</span>
            <span class="resource-type">Subdomain</span>
          </div>`;
        });
        if (subdomains.length > 10) {
          html += `<div class="resource-item more-items">+${subdomains.length - 10} daha...</div>`;
        }
        html += '</div>';
        subdomainsContainer.innerHTML = html;
      }
    }

    // External Domain listesi
    const externalContainer = document.getElementById('externalDomainsList');
    if (externalContainer) {
      const externalDomains = data.externalDomains || [];
      
      if (externalDomains.length === 0) {
        externalContainer.innerHTML = '<div class="no-data">Dış kaynak tespit edilmedi</div>';
      } else {
        let html = '<div class="resource-items">';
        externalDomains.slice(0, 10).forEach(domain => {
          html += `<div class="resource-item">
            <span class="resource-name">${domain}</span>
            <span class="resource-type">Dış Kaynak</span>
          </div>`;
        });
        if (externalDomains.length > 10) {
          html += `<div class="resource-item more-items">+${externalDomains.length - 10} daha...</div>`;
        }
        html += '</div>';
        externalContainer.innerHTML = html;
      }
    }
  }

  updateSecurityTab() {
    const data = this.analysisData;
    const container = document.querySelector('.security-sections');
    
    if (!container) return;

    const vulnerabilities = data.vulnerabilities || [];
    
    let html = '<div class="security-section">';
    html += '<h3>Güvenlik Durumu</h3>';
    
    if (vulnerabilities.length === 0) {
      html += '<div class="security-item secure">✅ Bilinen güvenlik sorunu tespit edilmedi</div>';
    } else {
      vulnerabilities.forEach(vuln => {
        const severityClass = vuln.severity.toLowerCase();
        const severityIcon = vuln.severity === 'High' ? '🔴' : vuln.severity === 'Medium' ? '🟡' : '🟢';
        
        html += `<div class="security-item ${severityClass}">
          <div class="vuln-header">
            ${severityIcon} <strong>${vuln.type}</strong>
            <span class="severity">${vuln.severity}</span>
          </div>
          <div class="vuln-description">${vuln.description}</div>
          <div class="vuln-recommendation">💡 ${vuln.recommendation}</div>
        </div>`;
      });
    }
    
    html += '</div>';
    container.innerHTML = html;
  }

  exportReport() {
    if (!this.analysisData) {
      alert('Analiz verisi bulunamadı');
      return;
    }

    const report = {
      ...this.analysisData,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Web Security Analyzer'
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: 'application/json'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `security-analysis-${this.analysisData.domain}-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Popup yüklendiğinde başlat
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing popup...');
  new PopupManager();
});

