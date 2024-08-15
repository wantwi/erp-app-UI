import React from 'react'

const Overlay = ({children}) => {
  return (
    <div style={{display:"flex", zIndex:10000000, position:"absolute", width:"100vw", height:"100vh", background:"red"}}>
        <div style={{flex:1}}>
         {children}
        </div>
        
    </div>
  )
}

export default Overlay