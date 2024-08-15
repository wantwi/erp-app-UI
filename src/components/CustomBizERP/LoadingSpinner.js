import React from "react";
import './index.css'

export default function LoadingSpinner({message = 'loading...'}) {
    return (
        <div id="global-loader" style={{display:'flex', flexDirection:'column', gap:50, justifyContent:'center', alignItems:'center'}}>
            <div className="whirly-loader"></div>
            <div>{message}</div>
        </div>       
    );
}