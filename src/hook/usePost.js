import { useMutation, useQueryClient } from "@tanstack/react-query"
import useCustomAxios from "./useCustomAxios"

  export const usePost = (url, key, onsuccess = () => {}, onError = () => {}) => {
    const axios = useCustomAxios()
    const queryClient = useQueryClient()
  
    const postFunction = async (postData) => {
       
         const request = await axios.post(url, postData)
        // let response = JSON.parse(request?.data)
        // if(response?.StatusCode >=400){
        //   const error = new Error(response?.ErrorMessage)
        //   error.code = response?.StatusCode
        //   throw error;
        // }
        return request.data
    }

   const reactQuery =  useMutation({
        mutationFn: postFunction,
        onSuccess:(data) => {
            queryClient.invalidateQueries({ queryKey: [key] })
            // queryClient.invalidateQueries({ queryKey: [key2] })
            onsuccess(data)
        },
        onError:(error) => onError(error)
        
    })


    return reactQuery

}
