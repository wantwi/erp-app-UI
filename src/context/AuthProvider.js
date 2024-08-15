import React, { createContext, useState } from "react";

const AuthContext = createContext({});
const SessionData = JSON.parse(localStorage.getItem(process.env.REACT_APP_SESSIONURL)) || JSON.parse(sessionStorage.getItem(process.env.REACT_APP_SESSIONURL));


export const AuthProvider = ({ children }) => {
  const [auth, setAuth] = useState(SessionData);

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
