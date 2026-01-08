import * as Sentry from '@sentry/react';

export const initMonitoring = () => {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: import.meta.env.VITE_SENTRY_DSN, // .env or Cloudflare Secret
      integrations: [Sentry.browserTracingIntegration(), Sentry.replayIntegration()],
      tracesSampleRate: 1.0,
      replaysSessionSampleRate: 0.1,
      replaysOnErrorSampleRate: 1.0,
    });
  }
};

export const logEvent = (name: string, properties?: Record<string, any>) => {
  // Console in Dev, Sentry Breadcrumb/Event in Prod
  if (process.env.NODE_ENV === 'development') {
    console.log(`[EVENT] ${name}`, properties);
  } else {
    Sentry.addBreadcrumb({
      category: 'business-event',
      message: name,
      data: properties,
      level: 'info',
    });
  }
};

export const logError = (error: Error, context?: string) => {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR:${context}]`, error);
  } else {
    Sentry.captureException(error, {
      tags: { context },
    });
  }
};
