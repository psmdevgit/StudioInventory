import { Navigate, Outlet } from "react-router-dom";

const RequireAuth = () => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // 👇 check login
  if (!user?.empName) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

export default RequireAuth;