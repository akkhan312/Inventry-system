import { Navigate, Outlet } from 'react-router-dom';


interface ProtectedRouteProps {
    redirectPath?: string;
    allowedRoles?: string[];
}

const ProtectedRoute = ({ redirectPath = '/login', allowedRoles }: ProtectedRouteProps) => {
    const token = sessionStorage.getItem('token');
    const userStr = sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!token) {
        // Redirect to login if no token is found
        return <Navigate to={redirectPath} replace />;
    }

    // Role-based access control
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    // Render the protected content (Outlet for layouts)
    return <Outlet />;
};

export default ProtectedRoute;
