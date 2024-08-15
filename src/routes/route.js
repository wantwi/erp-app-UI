import { userLogin } from "config/config";
import useAuth from "hook/useAuth";
import useCustomAxios from "hook/useCustomAxios";
import React from "react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";


const Authmiddleware = (props) => {
  const axios =  useCustomAxios()
  const { auth } = useAuth();
    // const { user, setUser, isAuthenticated, setIsAuthenticated } = useAuth()

    // const getUser = async () => {
    //     try {
    //         const response = await axios.get(`/bff/user`)
    //         const obj = {}
    //         response?.data.forEach(x => {
    //             obj[x?.type] = x?.value
    //         })
    //         setIsAuthenticated(true)
    //         setUser(obj)
    //     } catch (error) {
    //         setIsAuthenticated(false)
    //         window.location = `${process.env.REACT_APP_BASENAME}/login`
    //     }


    // }
  
  useEffect(() => {

    if(!auth?.access_token){
      userLogin()
    }
    return () => {
      
    }
  }, [])
  
  if (!auth?.access_token) {
    return (
      <h1>Please wait ...</h1>
      
    );
  }
  return (<React.Fragment>
    {props.children}
  </React.Fragment>);
};

export default Authmiddleware;
