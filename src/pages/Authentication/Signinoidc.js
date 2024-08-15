import PropTypes from "prop-types";
import React, { useEffect } from "react";

import { Row, Col, CardBody, Card, Alert, Container, Form, Input, FormFeedback, Label } from "reactstrap";

import withRouter from "components/Common/withRouter";
import {useNavigate} from "react-router-dom"

import useAuth from "hook/useAuth";
import { signinCallback } from "config/config";



const Signinoidc = props => {
  const {auth, setAuth} = useAuth()
  const navigate = useNavigate()

  //meta title
  document.title = "Login | Biz360";
  const getData = async () => {
     try {
      const request = await signinCallback()
      console.log({request});
      localStorage.setItem(process.env.REACT_APP_SESSIONURL, JSON.stringify(request))
      setAuth(request)
     } catch (error) {
      
     }
      
  }

 useEffect(() => {
   
  getData()
   return () => {
     
   }
 }, [])
 
 console.log({auth});

 if(auth?.access_token){
      
   window.location.href ="/"
 }

  return (
    <React.Fragment>
     
         <h1>Please wait ...</h1>
        
    </React.Fragment>
  );
};

export default withRouter(Signinoidc);

Signinoidc.propTypes = {
  history: PropTypes.object,
};
