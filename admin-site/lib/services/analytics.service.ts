export class AnalyticsService {
  import apiFetch from '@/lib/api-client'

  export class AnalyticsService {
  static trackEvent(name: string, props?: any) {
    try {
      // best-effort: fire-and-forget to server endpoint
      apiFetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, props }),
      }).catch(() => {})
    } catch (e) {}
  }
}

import apiFetch from '@/lib/api-client'
}
