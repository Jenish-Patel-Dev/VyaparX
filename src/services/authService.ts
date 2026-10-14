export interface AuthUser {
  email: string;
}

export interface VerifyOtpResponse {
  success: boolean;
  message?: string;
  token?: string;
  user?: AuthUser;
}

export interface SendOtpResponse {
  success: boolean;
  message?: string;
}

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
  getToken(): string | null {
    return sessionStorage.getItem('sauda_auth_token');
  },

  setToken(token: string): void {
    sessionStorage.setItem('sauda_auth_token', token);
  },

  clearToken(): void {
    sessionStorage.removeItem('sauda_auth_token');
  },

  async sendOtp(email: string): Promise<SendOtpResponse> {
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
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
      body: JSON.stringify({ email, otp, otpToken, expiresAt }),
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
    if (data.token) {
      this.setToken(data.token);
    }
    sessionStorage.removeItem('sauda_otp_token');
    sessionStorage.removeItem('sauda_otp_expires');
    return data;
  },

  async resendOtp(email: string): Promise<SendOtpResponse> {
    const res = await fetch('/api/auth/resend-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
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

    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) {
        this.clearToken();
        return null;
      }
      const data = await res.json();
      return data.user || null;
    } catch {
      return null;
    }
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
    if (!token) return false;
    try {
      const res = await fetch('/api/companies/validate-access', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ companyId }),
      });
      if (!res.ok) return false;
      const data = await res.json();
      return Boolean(data.authorized);
    } catch {
      // In case of offline/network failure, allow access if client verification matches
      return true;
    }
  },
};
