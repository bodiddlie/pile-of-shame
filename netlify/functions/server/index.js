const path = require('path');
const { createRequestHandler } = require('@remix-run/netlify');
const Sentry = require('@sentry/node');
// or use es6 import statements
// import * as Sentry from '@sentry/node';

const Tracing = require('@sentry/tracing');
// or use es6 import statements
// import * as Tracing from '@sentry/tracing';

Sentry.init({
  dsn: 'https://f0ef2c7b935d4ec4a22d7c2443b407d1@o1109711.ingest.sentry.io/6138262',

  // Set tracesSampleRate to 1.0 to capture 100%
  // of transactions for performance monitoring.
  // We recommend adjusting this value in production
  tracesSampleRate: 1.0,
});

const BUILD_DIR = path.join(process.cwd(), 'netlify');

function purgeRequireCache() {
  // purge require cache on requests for "server side HMR" this won't let
  // you have in-memory objects between requests in development,
  // netlify typically does this for you, but we've found it to be hit or
  // miss and some times requires you to refresh the page after it auto reloads
  // or even have to restart your server
  for (const key in require.cache) {
    if (key.startsWith(BUILD_DIR)) {
      delete require.cache[key];
    }
  }
}

exports.handler =
  process.env.NODE_ENV === 'production'
    ? createRequestHandler({ build: require('./build') })
    : (event, context) => {
        purgeRequireCache();
        return createRequestHandler({ build: require('./build') })(
          event,
          context,
        );
      };
