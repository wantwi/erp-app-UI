import React, { useState, useContext } from "react"
import useCustomAxios from "../hook/useCustomAxios"
import { signinCallback, userLogin, userLogout } from "config/config"
export const AuthContext = React.createContext()
export const useAuth = () => useContext(AuthContext)
// const SESSION_DATA = sessionStorage.getItem(JSON.parse(process.env.REACT_APP_SESSIONURL))
// console.log({SESSION_DATA})
export const AuthProvider = ({
    children
}) => {

    const [isAuthenticated, setIsAuthenticated] = useState(false)

    const [user, setUser] = useState()
    const [auth, setAuth] = useState({})

   const axios =  useCustomAxios()

    const getUser = async () => {
        const signinCallback = await signinCallback()
        console.log({signinCallback});
    }
    const login = async () => {
       await userLogin()
    }

    const logout = async () => {
        await userLogout()
    }


    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                user,
                setUser,
                setIsAuthenticated,
                login,
                logout,
                getUser,
                auth, 
                setAuth
            }}
        >
            {children}
        </AuthContext.Provider>
    )
}