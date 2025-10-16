import { createContext, PropsWithChildren, useContext, useMemo, useState } from 'react';

type User = { uid: string; email?: string | null };

type AuthContextType = {
    user: User | null;
    setUser: (u: User | null) => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
    const [user, setUser] = useState<User | null>(null);
    const value = useMemo(() => ({ user, setUser }), [user]);
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error('useAuth must be used within AuthProvider');
    return ctx;
}

export default AuthContext;
