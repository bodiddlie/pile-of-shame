import Sentry from '@sentry/node';

export function logError(err: Error) {
  Sentry.captureException(err);
}
