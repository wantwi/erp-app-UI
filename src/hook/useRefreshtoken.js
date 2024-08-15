import { renewToken, userLogout } from "config/config";
import useAuth from "./useAuth";

const useRefreshtoken = () => {
    const {setAuth, auth} = useAuth()

    const refresh = async () => {
        try {
            const newToken = await renewToken()
            if (newToken) {
                const {access_token} = newToken
               

                setAuth((prev) => ({...prev, access_token }))

               
                    localStorage.setItem(process.env.REACT_APP_SESSIONURL, JSON.stringify({...auth,access_token}))
                  

                return access_token
            }
            
        } catch (error) {

            userLogout()
            
            
        }
           
    }

    return refresh
}

export default useRefreshtoken 