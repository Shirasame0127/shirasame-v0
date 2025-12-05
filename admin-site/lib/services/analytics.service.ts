export class AnalyticsService {
  static trackEvent(name: string, props?: any) {
    try {
      // best-effort: fire-and-forget to server endpoint
      fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, props }),
      }).catch(() => {})
    } catch (e) {}
  }
}
