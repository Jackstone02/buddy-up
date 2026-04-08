import * as WebBrowser from 'expo-web-browser';
import * as Linking from 'expo-linking';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

const REDIRECT_URI = 'com.buddyline.app://auth/callback';

export async function signInWithGoogle(): Promise<{ data: any; error: any }> {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: REDIRECT_URI,
        skipBrowserRedirect: true,
        queryParams: {
          skip_http_redirect: 'true',
        },
      },
    });

    if (error) throw error;
    if (!data?.url) throw new Error('No authorization URL returned');

    const result = await WebBrowser.openAuthSessionAsync(data.url, REDIRECT_URI);

    if (result.type === 'success') {
      return await _handleCallback(result.url);
    }

    if (result.type === 'dismiss') {
      // Android: check if a deep link URL arrived while the browser was open
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl && initialUrl.startsWith(REDIRECT_URI)) {
        return await _handleCallback(initialUrl);
      }
      throw new Error('Google sign-in redirect was not received.');
    }

    throw new Error('Google sign-in was cancelled');
  } catch (error) {
    return { data: null, error };
  }
}

/** Handles both PKCE (code in query) and implicit flow (tokens in hash) */
async function _handleCallback(url: string): Promise<{ data: any; error: any }> {
  const hashIndex = url.indexOf('#');
  const queryIndex = url.indexOf('?');
  const queryEnd = hashIndex !== -1 ? hashIndex : url.length;
  const queryString = queryIndex !== -1 ? url.substring(queryIndex + 1, queryEnd) : '';
  const hashString = hashIndex !== -1 ? url.substring(hashIndex + 1) : '';

  const queryParams = new URLSearchParams(queryString);
  const hashParams = new URLSearchParams(hashString);

  // PKCE flow: authorization code in query string
  const code = queryParams.get('code');
  if (code) {
    return await supabase.auth.exchangeCodeForSession(code);
  }

  // Implicit flow: tokens in URL hash
  const accessToken = hashParams.get('access_token');
  const refreshToken = hashParams.get('refresh_token');
  if (accessToken && refreshToken) {
    return await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
  }

  throw new Error('OAuth callback missing both authorization code and access tokens');
}
