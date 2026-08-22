import React, { createContext, useContext, useReducer, useState, useEffect } from 'react';
import axios from '../Components/utils/axiosConfig'

const AuthContext = createContext();

/*
 * Extrae el mensaje de un fallo de axios.
 *
 * Antes se hacia `error.response.data` directamente: si la peticion no llegaba
 * a salir (backend caido, sin red), `response` es undefined y el propio catch
 * lanzaba un TypeError que dejaba el formulario colgado sin mostrar nada.
 */
const mensajeDeError = (error, porDefecto) => {
    const data = error?.response?.data;
    if (typeof data === 'string') return data;
    if (data?.message) return data.message;
    return porDefecto;
};

const authReducer = (state, action) => {
    switch (action.type) {
        case 'LOGIN_SUCCESS':
            return { ...state, isAuthenticated: true, user: action.payload.user, token: action.payload.token, loginError: null };
        case 'LOGIN_FAILED':
            return { ...state, isAuthenticated: false, user: null, token: null, loginError: action.payload };
        case 'LOGOUT':
            return { ...state, isAuthenticated: false, user: null, token: null, loginError: null };
        case 'REGISTER_SUCCESS':
            return { ...state, isAuthenticated: true, user: action.payload.user, token: action.payload.token, loginError: null };
        case 'REGISTER_FAILED':
            return { ...state, isAuthenticated: false, user: null, token: null, loginError: action.payload };
        default:
            throw new Error(`Unhandled action type: ${action.type}`);
    }
};

export const AuthProvider = ({ children }) => {
    const initialState = {
        isAuthenticated: false,
        user: null,
        token: null,
        loginError: null
    };

    const [state, dispatch] = useReducer(authReducer, initialState);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            const user = JSON.parse(localStorage.getItem('user'));
            console.log(user);
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        try {
            const response = await axios.post('/api/auth/login', { email, password });
            /* El backend responde { token, user }. Antes se leia `accessToken`,
               que no existe, y se guardaba la cadena "undefined". */
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            dispatch({ type: 'LOGIN_SUCCESS', payload: { user, token } });
        } catch (error) {
            dispatch({ type: 'LOGIN_FAILED', payload: mensajeDeError(error, 'Error al iniciar sesión') })
        }
    };

    const register = async (email, password, username, adminCode) => {
        try {
            const response = await axios.post('/api/auth/register', { email, password, username, adminCode });
            const { token, user } = response.data;
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            dispatch({ type: 'REGISTER_SUCCESS', payload: { user, token } });
        } catch (error) {
            dispatch({ type: 'REGISTER_FAILED', payload: mensajeDeError(error, 'Error en el registro') });
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        dispatch({ type: 'LOGOUT' });
    };

    const getToken = () => {
        return state.token;
    };

    return (
        <AuthContext.Provider value={{ login, register, logout, getToken, state, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);