import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import { router } from './router/router';
export default function App() { return <AuthProvider><RouterProvider router={router} /></AuthProvider>; }
