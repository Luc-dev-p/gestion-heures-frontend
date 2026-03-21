import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Teachers from './pages/Teachers'
import Subjects from './pages/Subjects'
import Hours from './pages/Hours'
import Summary from './pages/Summary'
import AcademicYears from './pages/AcademicYears'
import Profile from './pages/Profile'

// dans les Routes
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/teachers" element={
            <ProtectedRoute roles={['ADMIN', 'RH']}>
              <Teachers />
            </ProtectedRoute>
          } />
          <Route path="/subjects" element={
            <ProtectedRoute roles={['ADMIN', 'RH']}>
              <Subjects />
            </ProtectedRoute>
          } />
          <Route path="/hours" element={
            <ProtectedRoute roles={['ADMIN', 'RH']}>
              <Hours />
            </ProtectedRoute>
          } />
          <Route path="/summary" element={
          <ProtectedRoute roles={['ADMIN', 'RH']}>
            <Summary />
          </ProtectedRoute>
          } />
          <Route path="/academic-years" element={
            <ProtectedRoute roles={['ADMIN']}>
              <AcademicYears />
                </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
               </ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    
  )
}


export default App