// export interface User {
//     user_id: number;
//     client_id: number;
//     client_user_id: number;
//     user_name: string;
//     user_email: string;

//     id?: string;
//     email?: string;
//     name?: string;
//     avatar?: string;
//     roles?: string[];
// }

// export interface AuthState {
//     user: User | null;
//     isAuthenticated: boolean;
//     isLoading: boolean;
//     token: string | null;
// }

// export interface AuthContextType extends AuthState {
//     login: <T>(data: LoginFormValues) => Promise<T>;
//     logout: () => void;
//     getUserDetails: () => Promise<void>;
// }

// // contexts/AuthContext.tsx
// import React, { useReducer, useEffect, useCallback } from 'react';
// // import axios from 'axios';
// import { useNavigate } from 'react-router-dom';
// import { AuthContext } from '@/hooks/authHook';

// // export const AuthContext = createContext<AuthContextType | undefined>(undefined);
// // Action types
// type AuthAction =
//     | { type: 'SET_LOADING'; payload: boolean }
//     | { type: 'SET_USER'; payload: User }
//     | { type: 'SET_TOKEN'; payload: string }
//     | { type: 'LOGOUT' }
//     | { type: 'SET_AUTHENTICATED'; payload: boolean };

// // Initial state
// const initialState: AuthState = {
//     user: null,
//     isAuthenticated: false,
//     isLoading: true,
//     token: localStorage.getItem('token'),
// };

// // Reducer
// const authReducer = (state: AuthState, action: AuthAction): AuthState => {
//     switch (action.type) {
//         case 'SET_LOADING':
//             return { ...state, isLoading: action.payload };
//         case 'SET_USER':
//             return { ...state, user: action.payload, isAuthenticated: true, isLoading: false };
//         case 'SET_TOKEN':
//             return { ...state, token: action.payload };
//         case 'SET_AUTHENTICATED':
//             return { ...state, isAuthenticated: action.payload };
//         case 'LOGOUT':
//             return { ...state, user: null, isAuthenticated: false, token: null, isLoading: false };
//         default:
//             return state;
//     }
// };

// // Auth Provider Component
// export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
//     const [state, dispatch] = useReducer(authReducer, initialState);
//     const navigate = useNavigate();

//     const decodeTokenAndSetUser = useCallback((token: string): User | null => {
//         try {
//             const payload = JSON.parse(atob(token.split('.')[1]));

//             // Create user object from token payload
//             const user: User = {
//                 user_id: payload.user_id,
//                 client_id: payload.client_id,
//                 client_user_id: payload.client_user_id,
//                 user_name: payload.user_name,
//                 user_email: payload.user_email,
//                 // Optional compatibility fields
//                 id: payload.user_id?.toString(),
//                 email: payload.user_email,
//                 name: payload.user_name,
//                 avatar: '', // Default empty avatar
//                 roles: [] // Default empty roles
//             };

//             dispatch({ type: 'SET_USER', payload: user });
//             return user;
//         } catch (error) {
//             console.error('Error decoding token:', error);
//             return null;
//         }
//     }, []);

//     // Check if token is expired
//     const isTokenExpired = useCallback((token: string): boolean => {
//         try {
//             const payload = JSON.parse(atob(token.split('.')[1]));
//             const currentTime = Date.now() / 1000;

//             const expirationTime = payload.exp || payload.expAt;
//             return expirationTime < currentTime;
//         } catch {
//             return true;
//         }
//     }, []);


//     const login = async <T = unknown>(data: LoginFormValues): Promise<T> => {
//         try {
//             dispatch({ type: 'SET_LOADING', payload: true });

//             const res = await loginApi(data);

//             if (res.token && res.user) {
//                 const { token, user } = res;
//                 localStorage.setItem('token', token);
//                 dispatch({ type: 'SET_TOKEN', payload: token });
//                 dispatch({ type: 'SET_USER', payload: user });
//             }
//             // If API returns only token, decode it to get user data
//             else if (res.token) {
//                 const { token } = res;
//                 localStorage.setItem('token', token);
//                 dispatch({ type: 'SET_TOKEN', payload: token });
//                 decodeTokenAndSetUser(token);
//             }

//             return res;

//         } catch (error) {
//             dispatch({ type: 'SET_LOADING', payload: false });
//             throw error;
//         }
//     };


//     const getUserDetails = async (): Promise<void> => {
//         try {
//             dispatch({ type: 'SET_LOADING', payload: true });

//             if (state.token) {
//                 decodeTokenAndSetUser(state.token);
//             }

//             dispatch({ type: 'SET_LOADING', payload: false });

//         } catch (error) {
//             dispatch({ type: 'SET_LOADING', payload: false });
//             logout();
//             throw error;
//         }
//     };

//     // Logout function
//     const logout = (): void => {
//         localStorage.removeItem('token');
//         dispatch({ type: 'LOGOUT' });
//     };

//     // Check authentication status on mount and token change
//     useEffect(() => {
//         const checkAuth = async () => {
//             const token = localStorage.getItem('token');

//             if (!token) {
//                 dispatch({ type: 'SET_LOADING', payload: false });
//                 return;
//             }

//             if (isTokenExpired(token)) {
//                 console.log("iugfyj");

//                 logout();
//                 navigate('/login');
//                 return;
//             }

//             dispatch({ type: 'SET_TOKEN', payload: token });

//             try {
//                 decodeTokenAndSetUser(token);
//                 dispatch({ type: 'SET_LOADING', payload: false });
//             } catch (error) {
//                 console.log(error);

//                 logout();
//                 navigate('/login');
//             }
//         };

//         checkAuth();
//     }, []);

//     // Auto refresh token when it's about to expire
//     useEffect(() => {
//         if (!state.token || !state.isAuthenticated) return;

//         const checkTokenExpiry = () => {
//             if (isTokenExpired(state.token!)) {
//                 alert("Your session has expired. Please login again.");
//                 logout();
//                 navigate('/login');
//                 return;
//             }
//         };

//         // Check immediately
//         checkTokenExpiry();

//         // Check every minute
//         const interval = setInterval(checkTokenExpiry, 60000);

//         return () => clearInterval(interval);
//     }, [state.token, state.isAuthenticated, isTokenExpired]);

//     const value: AuthContextType = {
//         ...state,
//         login,
//         logout,
//         getUserDetails,
//     };

//     return (
//         <AuthContext.Provider value={value}>
//             {children}
//         </AuthContext.Provider>
//     );
// };

