import React from 'react'

const DisplaySubAccount = ({data}) => {
  return (
    <div className='col mt-3' style={{background:"#f8f8fb", padding:"10px 0"}}>
      
      <hr className='subAccount'/>
      
        <ul>
              {
                data.map(x => <li key={x?.name}>{x?.name}</li>)
              }  
        </ul>
     
       

    </div>
  )
}

export default DisplaySubAccount