import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = () => {
    const token = sessionStorage.getItem('token');

    if (!token) {
        // Redirect to login if no token is found
        return <Navigate to="/login" replace />;
    }

    // Render the protected content (Outlet for layouts)
    return <Outlet />;
};

export default ProtectedRoute;
