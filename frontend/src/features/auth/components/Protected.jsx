import { Navigate } from "react-router";
import { useAuth } from "../hooks/useAuth.js";

const Protected = ({children}) => {
    const { loading,user } = useAuth()


    if (loading) {
        return <main className="loading-screen"><p>Preparing your interview workspace...</p></main>
    }

    if (!user) {
        return <Navigate to="/login" replace />
    }
    
    return children
}

export default Protected