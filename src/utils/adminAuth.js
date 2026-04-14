export const ADMIN_TOKEN_KEY = 'ecom_admin_token';

export const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

export const setAdminSession = (token) => localStorage.setItem(ADMIN_TOKEN_KEY, token);

export const clearAdminSession = () => localStorage.removeItem(ADMIN_TOKEN_KEY);
