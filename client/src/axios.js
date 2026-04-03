import axios from "axios";

const API = axios.create({
   baseURL: "http://localhost:9000/api",  
    // baseURL: "http://192.168.5.13:4488/api",  
    headers: {
        "Content-Type": "application/json"
    }
});

export default API;