export const getAuthUser = () => {
  const user = localStorage.getItem("auth_user");
  return user ? JSON.parse(user) : null;
};

export const getUserRole = () => {
  return localStorage.getItem("userRole");
};

// export const isAuthenticated = () => {
//   return !!localStorage.getItem("auth_token");
// };

export const logout = () => {
  localStorage.clear();
  window.location.href = "/login";
};
