
import { useQuery } from "@tanstack/react-query"
// import axios from "axios"
import useCustomAxios from "./useCustomAxios"
import { showToast } from "helpers/utility"

  export const useGet = (url, key, onsuccess = () => {}, onError = () => {}) => {

  const axios = useCustomAxios()
  
    const getFunction = async () => {
        const request = await axios.get(url)

        // console.log({request});
       //let response = JSON.parse(request?.data)
      
       //"{\"ErrorMessage\":\"Internal Server Error\",\"StatusCode\":500}"
        // if(response?.status >=400){
        //   const error = new Error(response?.ErrorMessage)
        //   error.code = response?.StatusCode

        //   throw error;
        // }

        return request.data 
    }

   const reactQuery =  useQuery({
        queryKey:[key],
        queryFn:getFunction,
        onSuccess:(data) => onsuccess(data || []),
        onError:(error) => {
        // showToast("error", error?.message, "Notice")
          onError(error)
        },
        enabled: true,
        retry:0,
        select:(data)=>{
          // let parseData = JSON.parse(data.data)
          // console.log({parseData});
          return data?.payload
        },
        keepPreviousData:true,
      
    })

    return reactQuery

}
