import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user session
    const storedUser = localStorage.getItem('admin_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Check users from DataContext (localStorage or Supabase)
    try {
      const storedUsers = localStorage.getItem('admin_users');
      if (storedUsers) {
        const users = JSON.parse(storedUsers) as Array<{
          id: string;
          email: string;
          name: string;
          role: 'admin' | 'staff' | 'customer';
          password?: string;
          isActive?: boolean;
        }>;
           
        const foundUser = users.find(
          (u) => u.email.toLowerCase() === email.toLowerCase() && u.isActive !== false
        );

        if (foundUser && foundUser.password === password) {
          // Only allow admin and staff roles to login
          if (foundUser.role === 'admin' || foundUser.role === 'staff') {
            const authUser: User = {
              id: foundUser.id,
              email: foundUser.email,
              name: foundUser.name,
              role: foundUser.role === 'staff' ? 'admin' : 'admin', // Staff can access admin panel
              createdAt: new Date().toISOString(),
            };
            setUser(authUser);
            localStorage.setItem('admin_user', JSON.stringify(authUser));
            return true;
          }
        }
      }
    } catch (error) {
      console.error('Error reading users from storage:', error);
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('admin_user');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        logout,
        isAuthenticated: !!user,
        isAdmin: user?.role === 'admin',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

