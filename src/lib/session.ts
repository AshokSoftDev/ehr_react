// Session event management for handling 401 responses
type SessionListener = () => void;

class SessionManager {
  private listeners: SessionListener[] = [];
  private isExpired = false;

  subscribe(listener: SessionListener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  setExpired() {
    if (this.isExpired) return; // Prevent multiple triggers
    this.isExpired = true;
    this.listeners.forEach((listener) => listener());
  }

  reset() {
    this.isExpired = false;
  }

  getIsExpired() {
    return this.isExpired;
  }
}

export const sessionManager = new SessionManager();
