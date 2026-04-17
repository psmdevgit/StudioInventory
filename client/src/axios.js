import axios from "axios";

const API = axios.create({
//    baseURL: "http://localhost:9000/api",  
    baseURL: "https://192.168.5.225:100/api",  
    headers: {
        "Content-Type": "application/json"
    }
});

export default API;