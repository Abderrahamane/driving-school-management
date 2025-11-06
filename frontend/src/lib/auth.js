export const setAuth = (token, user) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
};

export const getAuth = () => {
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) return null;

    return {
        token,
        user: JSON.parse(user),
    };
};

export const clearAuth = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

export const isAuthenticated = () => {
    return !!getAuth()?.token;
};

export const getUserRole = () => {
    return getAuth()?.user?.role;
};

export const redirectByRole = (role) => {
    const roleRoutes = {
        admin: '/dashboard/admin',
        'super-admin': '/dashboard/admin',
        instructor: '/dashboard/instructor',
        student: '/dashboard/student',
    };

    return roleRoutes[role] || '/';
};