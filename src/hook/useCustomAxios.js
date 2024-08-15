
import {useEffect} from "react"
import useRefreshtoken from "hook/useRefreshtoken"
import { CustomAxios } from "api/CustomAxios"
import useAuth from "./useAuth"


const useCustomAxios = () => {
    const {auth} = useAuth()

    const refresh = useRefreshtoken()
   
    useEffect(() => {

        const requestintercept =  CustomAxios.interceptors.request.use(
            config => {
                if (!config.headers.Authorization) {
                    config.headers.Authorization = `Bearer ${auth?.access_token}`
                }
                return config
            }, (error) => Promise.reject(error)
        )
        
        const responseintercept =  CustomAxios.interceptors.response.use(
            response => response,
            async (error) => {
                const prevRequest = error?.config
                if (error?.response?.status === 401 && !prevRequest?.sent) {
                    prevRequest.sent = true
                    const newAccesstoken = await refresh()
                  
                    prevRequest.headers.Authorization = `Bearer ${newAccesstoken}`
                    return CustomAxios(prevRequest)

                }
                return  Promise.reject(error)
            }
        )
      
    
      return () => {
        CustomAxios.interceptors.request.eject(requestintercept)
        CustomAxios.interceptors.response.eject(responseintercept)
      }
    }, [auth, refresh])
    
   
   return CustomAxios

}





export default useCustomAxios