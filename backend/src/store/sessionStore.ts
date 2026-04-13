export interface SessionInfo {
  userId:    number;
  role:      string;
  createdAt: Date;
  userAgent: string;
  ip:        string;
}

export interface SessionEntry extends SessionInfo {
  jti: string;
}

/**
 * An in-memory store for tracking active JWT sessions.
 * Provides bidirectional lookups: by Token ID (jti) and by User ID.
 */
class SessionStore {
  private sessions  = new Map<string, SessionInfo>();
  private userIndex = new Map<number, Set<string>>();

  /**
   * Records a new session and updates the user-to-session index.
   */
  create(jti: string, info: SessionInfo): void {
    this.sessions.set(jti, info);

    let set = this.userIndex.get(info.userId);
    if (!set) {
      set = new Set();
      this.userIndex.set(info.userId, set);
    }
    set.add(jti);
  }

  /**
   * Retrieves metadata for a specific session ID.
   */
  get(jti: string): SessionInfo | undefined {
    return this.sessions.get(jti);
  }

  /**
   * Revokes a single session by JTI and cleans up the user index.
   */
  delete(jti: string): void {
    const session = this.sessions.get(jti);
    if (!session) return;

    this.sessions.delete(jti);

    const set = this.userIndex.get(session.userId);
    if (set) {
      set.delete(jti);
      if (set.size === 0) this.userIndex.delete(session.userId);
    }
  }

  /**
   * Revokes ALL active sessions for a specific user.
   * Commonly used after password resets or when an account is locked.
   */
  deleteAllForUser(userId: number): void {
    const set = this.userIndex.get(userId);
    if (!set) return;

    for (const jti of set) {
      this.sessions.delete(jti);
    }
    this.userIndex.delete(userId);
  }

  /**
   * Returns a list of all active sessions for a user.
   * Useful for a "Security Settings" page where users manage logged-in devices.
   */
  getForUser(userId: number): SessionEntry[] {
    const set = this.userIndex.get(userId);
    if (!set) return [];

    const result: SessionEntry[] = [];
    for (const jti of set) {
      const info = this.sessions.get(jti);
      if (info) result.push({ jti, ...info });
    }
    return result;
  }
}
export const sessionStore = new SessionStore();