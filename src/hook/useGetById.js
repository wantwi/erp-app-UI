
import { useQuery } from "@tanstack/react-query"
// import axios from "axios"
import useCustomAxios from "./useCustomAxios"

  export const useGetById = (url, key, id, onsuccess = () => {}, onError = () => {}) => {

  const axios = useCustomAxios()
  
    const getFunction = async () => {
        const request = await axios.get(url)
        return request.data  //JSON.parse(data?.data || data?.ErrorMessage)
    }

   const reactQuery =  useQuery({
        queryKey:[key, id],
        queryFn:getFunction,
        onSuccess:(data) => onsuccess(data || []),
        onError:(error) => onError(error),
        enabled: false,
        select:(data)=>{
          return data?.payload
        },
    })

    return reactQuery

}
