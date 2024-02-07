import { NextTestEnv } from './utils/helpers';

// This test asserts that our wrapping of `res.end` doesn't break API routes on Vercel if people call `res.json` or
// `res.send` multiple times in one request handler.
//  https://github.com/getsentry/sentry-javascript/issues/6670
it.skip('should not break API routes on Vercel if people call res.json or res.send multiple times in one request handler', async () => {
  const env = await NextTestEnv.init();
  const url = `${env.url}/api/doubleEndMethodOnVercel`;
  const response = await env.getAPIResponse(url);

  expect(response).toMatchObject({
    success: true,
  });
});
