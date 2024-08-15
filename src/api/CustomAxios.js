import axios from "axios"

export const CustomAxios = axios.create({
    baseURL: '',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json' 
    },
    // withCredentials: true
})