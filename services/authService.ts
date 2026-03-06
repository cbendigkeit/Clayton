import * as AppleAuthentication from 'expo-apple-authentication';
import * as Crypto from 'expo-crypto';
import { supabase } from './supabase';
import type { Charity, ConnectedAccount, NotificationPreferences } from '@/types';

interface UserProfile {
  defaultCharity?: Charity | null;
  connectedAccounts?: ConnectedAccount[];
  notifications?: NotificationPreferences;
}

async function generateNonce(): Promise<{ rawNonce: string; hashedNonce: string }> {
  const rawNonce = Math.random().toString(36).substring(2, 18);
  const hashedNonce = await Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    rawNonce
  );
  return { rawNonce, hashedNonce };
}

export const authService = {
  async signInWithApple() {
    const { rawNonce, hashedNonce } = await generateNonce();

    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });

    if (!credential.identityToken) {
      throw new Error('Apple Sign In failed: no identity token returned.');
    }

    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce: rawNonce,
    });

    if (error) throw error;

    // Apple only sends name on first sign-in — persist it to user metadata
    const fullName = credential.fullName;
    if (fullName?.givenName || fullName?.familyName) {
      const name = [fullName.givenName, fullName.familyName].filter(Boolean).join(' ');
      await supabase.auth.updateUser({ data: { full_name: name } });
    }

    return data;
  },

  async signInWithEmail(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signUpWithEmail(name: string, email: string, password: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: name } },
    });
    if (error) throw error;
    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getSession() {
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  onAuthStateChange(callback: Parameters<typeof supabase.auth.onAuthStateChange>[0]) {
    return supabase.auth.onAuthStateChange(callback);
  },

  /**
   * Persists per-user profile data (charity, accounts, notification prefs)
   * to Supabase user_metadata so it survives reinstalls and syncs across devices.
   * Fire-and-forget — failures are logged but do not block the UI.
   */
  syncProfile(profile: UserProfile): void {
    supabase.auth
      .updateUser({ data: { profile } })
      .then(({ error }) => {
        if (error) console.warn('[authService.syncProfile]', error.message);
      });
  },
};
