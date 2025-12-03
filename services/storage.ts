// DEPRECATED: Usar services/api.ts
export const storageService = {
  getCurrentUser: () => {
    try {
      const u = localStorage.getItem('jf_user');
      return u ? JSON.parse(u) : null;
    } catch { return null; }
  },
  setCurrentUser: (user: any) => {
    localStorage.setItem('jf_user', JSON.stringify(user));
  },
  logout: () => {
    localStorage.removeItem('jf_user');
  }
};