import React from "react";
import { useAuthContext } from "../../context/AuthContext";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({
  children,
  requiredAdmin = false,
}: {
  children: React.ReactNode;
  requiredAdmin?: boolean;
}) => {
  const {
    authState: { user, isLoading },
  } = useAuthContext();
  // user 정보가 없거나, 어드민온리 인데 유저가 어드민이 아닌 경우
  if (isLoading) {
    return null;
  }
  if (!user || (requiredAdmin && !user.isAdmin)) {
    // 꺼져!
    return <Navigate to="/" replace />;
  } else {
    return children;
  }
};

export default ProtectedRoute;
