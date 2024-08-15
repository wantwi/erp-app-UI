import { useMutation, useQueryClient } from "@tanstack/react-query"
import useCustomAxios from "./useCustomAxios"

  export const usePut = (url, key, onsuccess = () => {}, onError = () => {}) => {
    const axios = useCustomAxios()
    const queryClient = useQueryClient()
  
    const postFunction = async (postData) => {
       
        const request = await axios.put(url, postData)

        console.log({putfun: request});

        return request.data
    }

   const reactQuery =  useMutation({
        mutationFn: postFunction,
        onSuccess:(data) => {
            queryClient.invalidateQueries({ queryKey: [key] })
            onsuccess(data)
        },
        onError:(error) => onError(error)
        
    })


    return reactQuery

}
