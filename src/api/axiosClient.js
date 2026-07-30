/*import axios from "axios";

const axiosClient = axios.create({
  baseURL: "http://127.0.0.1:5000/api",
  headers: {
    "Content-Type": "application/json",
  },
});


const initToken = () => {
  const t = localStorage.getItem("auth_token");
  if (t) axiosClient.defaults.headers.common["Authorization"] = `Bearer ${t}`;
  else delete axiosClient.defaults.headers.common["Authorization"];
};
initToken();

export const setToken = (token) => {
  if (token) {
    localStorage.setItem("auth_token", token);
    axiosClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    localStorage.removeItem("auth_token");
    delete axiosClient.defaults.headers.common["Authorization"];
  }
};
.
export default axiosClient;*/

import axios from "axios";

const axiosClient = axios.create({


  baseURL: "https://rnaplatform-1.onrender.com",
  // baseURL: "http://192.168.23.67:5080",
  // baseURL: "http://192.168.23.79:5080",


  headers: {
    "Content-Type": "application/json",
  },
});


//  AUTO ATTACH TOKEN
// axiosClient.interceptors.request.use((config) => {
//   const token = localStorage.getItem("auth_token");
//   if (token) {
//     config.headers.Authorization = `Bearer ${token}`;
//   }
//   return config;
// });

// export const setToken = (token) => {
//   axiosClient.defaults.headers.Authorization = `Bearer ${token}`;
// };

export default axiosClient;
