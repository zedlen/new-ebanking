export interface UserProfile {
  customer_id: string;
  customer_type: number;
  id: number;
  profile: string;
  profile_id: number;
  role: string;
  role_id: number;
  username: string;
  name: string;
  email: string;
  image: string;
}

export interface AuthSession {
  token: string;
  profile: UserProfile;
}

export interface LoginCredentials {
  username: string;
  password: string;
  forced?: boolean;
}

export interface LoginResponse {
  status: string;
  code: number;
  data: {
    token: string;
    session?: { ip?: string; agent?: string };
    data?: { session?: { ip?: string; agent?: string } };
  };
}

export interface ActiveSessionConflict {
  ip?: string;
  agent?: string;
}
