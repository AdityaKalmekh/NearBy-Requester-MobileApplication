export interface User {
  id: string;
  phoneNo: string;
  firstName?:string;
  lastName?: string;
  fullName?: string;
  email?: string;
  role: number;
  isVerified: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  authToken: string;
  refreshToken: string;
  sessionId: string;
  expiresAt: number; // timestamp
}

export interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  isInitializing: boolean; // For checking stored tokens on app start
}

export interface LoginCredentials {
  phoneNo: string;
  otp: string;
  requestId: string;
  isNewUser: boolean;
}

export interface OTPInitiationData {
  phoneNo: string;
  authType: 'PhoneNo';
  role: 'requester' | 'provider';
}

export interface OTPInitiationResponse {
  success: boolean;
  message: string;
  requestId?: string;
  user: {
    userId: string;
    isNewUser: boolean;
  }
}

export interface LoginResponse {
  success: boolean;
  message: string;
  code: number;
  user: User;
  authToken: string;
  refreshToken: string;
  session_id: string;
  encryptedUId?: string;
  encryptionKey?: string;
  encryptedPId?: string;
  encryptionPKey?: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
  sessionId: string;
}

export interface RefreshTokenResponse {
  success: boolean;
  authToken: string;
  message?: string;
}

export interface UserDetailsUpdate {
  firstName: string;
  lastName: string;
}

export interface UserDetailsResponse {
  success: boolean;
  message: string;
  firstName: string;
  lastName: string;
}

export interface AuthContextType {
  authState: AuthState;
  initiateOTP: (data: OTPInitiationData) => Promise<OTPInitiationResponse>;
  verifyOTP: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => Promise<void>;
  // refreshAuthToken: () => Promise<boolean>;
  clearError: () => void;
  isTokenExpired: () => boolean;
  getAuthToken: () => string | null;
  updateUserDetails?: (details: UserDetailsUpdate) => Promise<boolean>;
}