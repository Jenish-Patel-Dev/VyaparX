export interface AuthUser {
  email: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

export type OtpPurpose = 'login' | 'pin_reset';

export interface SendOtpResponse {
  success: boolean;
  message?: string;
}

const SESSION_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 Days in milliseconds

function handleNonJsonResponse(res: Response, text: string): never {
  if (text.includes('NOT_FOUND') || text.includes('could not be found') || res.status === 404) {
    throw new Error(
      'Backend API endpoint not found (404). Please ensure vercel.json and api/ directory are committed to GitHub and deployed.'
    );
  }
  if (text.includes('<!DOCTYPE html>') || text.includes('<html')) {
    throw new Error(
      'API server returned an HTML page. Please verify your Vercel or Netlify serverless deployment and environment variables.'
    );
  }
  throw new Error(`Server returned unexpected response: ${text.slice(0, 100)}`);
}

export const authService = {
  isSessionValid(): boolean {
    const expiresAt = localStorage.getItem('sauda_session_expires_at');
    if (!expiresAt) return false;
    const isNotExpired = Date.now() < Number(expiresAt);
    if (!isNotExpired) {
      this.clearToken();
      return false;
    }
    return true;
  },

  setSession(token: string, email: string): void {
    const expiresAt = Date.now() + SESSION_DURATION_MS;
    const cleanEmail = email.toLowerCase().trim();
    localStorage.setItem('sauda_auth_token', token);
    sessionStorage.setItem('sauda_auth_token', token);
    localStorage.setItem('sauda_user_email', cleanEmail);
    sessionStorage.setItem('sauda_user_email', cleanEmail);
    localStorage.setItem('sauda_session_expires_at', String(expiresAt));
  },

  getToken(): string | null {
    if (!this.isSessionValid()) {
      return null;
    }
    return localStorage.getItem('sauda_auth_token') || sessionStorage.getItem('sauda_auth_token');
  },

  setToken(token: string): void {
    localStorage.setItem('sauda_auth_token', token);
    sessionStorage.setItem('sauda_auth_token', token);
  },

  clearToken(): void {
    localStorage.removeItem('sauda_auth_token');
    sessionStorage.removeItem('sauda_auth_token');
    localStorage.removeItem('sauda_user_email');
    sessionStorage.removeItem('sauda_user_email');
    localStorage.removeItem('sauda_session_expires_at');
    sessionStorage.removeItem('sauda_pin_unlocked');
    sessionStorage.removeItem('sauda_pending_email');
  },

  getUserEmail(): string {
    if (!this.isSessionValid()) {
      return '';
    }
    const email = localStorage.getItem('sauda_user_email') || sessionStorage.getItem('sauda_user_email') || '';
    return email.toLowerCase().trim();
  },

  setUserEmail(email: string): void {
    if (email) {
      const clean = email.toLowerCase().trim();
      sessionStorage.setItem('sauda_user_email', clean);
      localStorage.setItem('sauda_user_email', clean);
    }
  },

  async sendOtp(email: string, purpose: OtpPurpose = 'login'): Promise<SendOtpResponse> {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), purpose }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      handleNonJsonResponse(res, text);
    }

    const data = await res.json();
    if (data.otpToken) {
      sessionStorage.setItem('sauda_otp_token', data.otpToken);
      if (data.expiresAt) {
        sessionStorage.setItem('sauda_otp_expires', String(data.expiresAt));
      }
    }
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Unable to send OTP. Please try again.');
    }
    return data;
  },

  async verifyOtp(email: string, otp: string): Promise<VerifyOtpResponse> {
    const otpToken = sessionStorage.getItem('sauda_otp_token') || undefined;
    const expiresAt = sessionStorage.getItem('sauda_otp_expires')
      ? Number(sessionStorage.getItem('sauda_otp_expires'))
      : undefined;

    const res = await fetch('/api/auth/verify-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), otp, otpToken, expiresAt }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      handleNonJsonResponse(res, text);
    }

    const data = await res.json();
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Invalid verification code. Please try again.');
    }

    // Set 30-day session
    const token = data.token || `session_token_${Date.now()}`;
    this.setSession(token, email);

    sessionStorage.removeItem('sauda_otp_token');
    sessionStorage.removeItem('sauda_otp_expires');
    return data;
  },

  async resendOtp(email: string, purpose: OtpPurpose = 'login'): Promise<SendOtpResponse> {
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: email.toLowerCase().trim(), purpose }),
    });

    const contentType = res.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      const text = await res.text();
      handleNonJsonResponse(res, text);
    }

    const data = await res.json();
    if (data.otpToken) {
      sessionStorage.setItem('sauda_otp_token', data.otpToken);
      if (data.expiresAt) {
        sessionStorage.setItem('sauda_otp_expires', String(data.expiresAt));
      }
    }
    if (!res.ok || !data.success) {
      throw new Error(data.message || 'Unable to resend OTP. Please try again.');
    }
    return data;
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    const token = this.getToken();
    if (!token) return null;

    const email = this.getUserEmail();
    if (!email) return null;

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user?.email) {
          this.setUserEmail(data.user.email);
          return data.user;
        }
      }
    } catch {
      // Backend serverless or network offline: 30-day session persists on device
    }

    return { email };
  },

  async registerCompanyOnBackend(company: { id: number; name: string; username: string }): Promise<void> {
    const token = this.getToken();
    if (!token) return;
    try {
      await fetch('/api/companies/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(company),
      });
    } catch (err) {
      console.error('Failed to register company on backend:', err);
    }
  },

  async validateCompanyAccess(companyId: number): Promise<boolean> {
    const token = this.getToken();
    if (!token) return true;
    try {
      const res = await fetch('/api/companies/validate-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) return true;
      const data = await res.json();
      return typeof data.authorized === 'boolean' ? data.authorized : true;
    } catch {
      return true;
    }
  },
};
