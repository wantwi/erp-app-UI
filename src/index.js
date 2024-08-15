import React from "react";
import ReactDOM from 'react-dom/client';
import App from "./App";
import * as serviceWorker from "./serviceWorker";
import { BrowserRouter } from "react-router-dom";
import "./i18n";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { AuthProvider } from "context/AuthProvider";

import store from "./store";
import ErrorBoundary from "ErrorBoundary";
// import { AuthProvider } from "context/AuthContext";
import "./app.css"
const queryClient = new QueryClient()

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Provider store={store}>
          <React.Fragment>
            <BrowserRouter basename={process.env.REACT_APP_BASENAME}>

              <App />


            </BrowserRouter>
          </React.Fragment>
        </Provider>
      </AuthProvider>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </ErrorBoundary>
);

serviceWorker.unregister()
