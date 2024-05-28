import React from "react";
import { Navigate } from "react-router-dom";
import AuthService from "../services/auth.service";
import IUser from "../types/user.type";

type Props = {
  children: React.ReactNode;
  roles: string[];
};

const PrivateRoute: React.FC<Props> = ({ children, roles }) => {
  const currentUser: IUser | null = AuthService.getCurrentUser();

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  const hasRequiredRole = currentUser.roles?.some((role) =>
    roles.includes(role)
  );

  if (!hasRequiredRole) {
    return <Navigate to="/" />;
  }

  return <>{children}</>;
};

export default PrivateRoute;
