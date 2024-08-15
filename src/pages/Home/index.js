import useCustomAxios from 'hook/useCustomAxios'
import { useGet } from 'hook/useGet'
import React from 'react'
import { json } from 'react-router-dom';

function Home() {

  const onSuccess = (response)=>{
    console.log({response});

  }

  const onError= (error)=>{
    console.log({onError: error?.message});

  }
/**
 * use the sucess and error callback for your actions or setState
 */
  useGet("/api/Apps", "Apps", onSuccess, onError)

 //or
 /**
  * use return values directiy
  */
 const {data, isError, error, isLoading} = useGet("/api/Apps", "Apps", onSuccess, onError)

 //console.log({data, isError, error});
  if(isError){
    return <h1 style={{marginTop:100}}>{error?.message}</h1>
  }
 
  return (
    <div style={{marginTop:100}}>{isLoading?<h1>isLoading</h1>: <h1>Home</h1>}</div>
  )
}

export default Home