import { Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import Login from './pages/Login'
import VerifyEmail from './pages/VerifyEmail'
import Verify from './pages/Verify'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import ForgotPassword from './pages/ForgotPassword'
import VerifyOTP from './pages/VerifyOTP'
import ChangePassword from './pages/ChangePassword'


const App = () => {
  return (

    <Routes>
      <Route path='/' element={<ProtectedRoute> <Navbar/><Home/> </ProtectedRoute>}/>
      <Route path='/signup' element={<Signup/>}/>
      <Route path='/verify' element={<VerifyEmail/>}/>
      <Route path='/verify/:token' element={<Verify/>}/>
      <Route path='/login' element={<Login/>}/>
      <Route path='/forgot-password' element={<ForgotPassword/>}/>
      <Route path='/verify-otp/:email' element={<VerifyOTP/>}/>
      <Route path='/change-password/:email' element={<ChangePassword/>}/>
      <Route path='*' element={<h1>404 not found</h1>}/>
    </Routes>
    
  )
}

export default App
