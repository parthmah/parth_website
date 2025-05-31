// Performance monitoring script

class PerformanceMonitor {
  constructor() {
    this.metrics = {};
    this.init();
  }

  init() {
    // Wait for window load
    window.addEventListener('load', () => {
      this.measurePerformance();
      this.observePerformance();
    });
  }

  measurePerformance() {
    // Core Web Vitals
    this.metrics.LCP = this.getLargestContentfulPaint();
    this.metrics.FID = this.getFirstInputDelay();
    this.metrics.CLS = this.getCumulativeLayoutShift();

    // Additional metrics
    this.metrics.FCP = this.getFirstContentfulPaint();
    this.metrics.TTFB = this.getTimeToFirstByte();
    this.metrics.DOMContentLoaded = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
    this.metrics.WindowLoad = performance.timing.loadEventEnd - performance.timing.navigationStart;

    // Log metrics
    this.logMetrics();
  }

  getLargestContentfulPaint() {
    return new Promise(resolve => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        resolve(lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
    });
  }

  getFirstInputDelay() {
    return new Promise(resolve => {
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach(entry => {
          if (entry.interactionId) {
            resolve(entry.duration);
          }
        });
      }).observe({ entryTypes: ['first-input'] });
    });
  }

  getCumulativeLayoutShift() {
    return new Promise(resolve => {
      let cls = 0;
      new PerformanceObserver((entryList) => {
        for (const entry of entryList.getEntries()) {
          if (!entry.hadRecentInput) {
            cls += entry.value;
          }
        }
        resolve(cls);
      }).observe({ entryTypes: ['layout-shift'] });
    });
  }

  getFirstContentfulPaint() {
    const fcp = performance.getEntriesByType('paint')
      .find(entry => entry.name === 'first-contentful-paint');
    return fcp ? fcp.startTime : null;
  }

  getTimeToFirstByte() {
    return performance.timing.responseStart - performance.timing.navigationStart;
  }

  observePerformance() {
    // Observe resource timing
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.initiatorType === 'img') {
          this.logImageLoadTime(entry);
        }
      }
    });

    observer.observe({ entryTypes: ['resource'] });
  }

  logImageLoadTime(entry) {
    const loadTime = entry.duration;
    if (loadTime > 1000) { // Log slow images (>1s)
      console.warn(`Slow image load: ${entry.name} (${loadTime.toFixed(2)}ms)`);
    }
  }

  logMetrics() {
    // Log to console
    console.table(this.metrics);

    // Send to analytics if available
    if (window.gtag) {
      Object.entries(this.metrics).forEach(([metric, value]) => {
        gtag('event', 'performance_metric', {
          metric_name: metric,
          metric_value: value,
          metric_unit: 'ms'
        });
      });
    }
  }
}

// Initialize performance monitoring
new PerformanceMonitor(); 