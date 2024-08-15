import {  UserManager } from "oidc-client";
const {
  REACT_APP_LOGOUT_REDIRECT,
  REACT_APP_AUTHORITY,
  REACT_APP_CLIENT_ID,
  REACT_APP_CLIENT_ROOT,
  REACT_APP_CLIENT_SECRET,
  REACT_APP_RESPONSE_TYPE,
  REACT_APP_scope,
  REACT_APP_REDIRECT_URI,
} = process.env;

export const config = {
  authority: REACT_APP_AUTHORITY,
  client_id: REACT_APP_CLIENT_ID,
  redirect_uri: REACT_APP_REDIRECT_URI,
  client_root: REACT_APP_CLIENT_ROOT,
  client_secret: REACT_APP_CLIENT_SECRET,
  scope:REACT_APP_scope,
  post_logout_redirect_uri: REACT_APP_LOGOUT_REDIRECT,
  response_type:REACT_APP_RESPONSE_TYPE,
  response_mode: "query",
  
};



export const userManager = new UserManager(config);
export const getUser = async () => {
  return userManager.getUser();
};
export const userLogin = async () => {
  return userManager.signinRedirect();
};

export const renewToken = async () => {
  return userManager.signinSilent();
};

export const userLogout = async () => {
  localStorage.removeItem(process.env.REACT_APP_SESSIONURL)
  return userManager.signoutRedirect();
};

export const signinCallback = async () => {
  return userManager.signinRedirectCallback();
};
