import React from 'react'
import {Routes,Route} from 'react-router-dom'
import SignUpPage from './pages/auth/signup/SignUpPage.js';
import Login from './pages/auth/login/Login.js';
import HomePage from './pages/home/HomePage.js'
import Sidebar from './components/common/Sidebar.js';
import RightPanel from './components/common/RightPanel.js';
import NotificationPage from './pages/notification/NotificationPage.js';
import ProfilePage from './pages/profile/ProfilePage.js';
import {Toaster} from 'react-hot-toast';
import { useQuery } from '@tanstack/react-query';
import { baseUrl } from './urls/Constant.js';
import LoadingSpinner from './components/common/LoadingSpinner.js';
import { Navigate } from 'react-router-dom';
const App = () => {
  
  const {data:authUser, isLoading} = useQuery({
    queryKey : ["authUser"],
    queryFn : async() => {
      try {
        const res = await fetch(`${baseUrl}/api/auth/me`,{
          method : "GET",
          credentials : "include",
          headers:{
            "Content-Type":"application/json"
          }
        })
        const data = await res.json();
        
				if(data.error){
					return null
				}
        if(!res.ok){
          throw new Error(data.error || "Something went Wrong")
        }
       console.log("Auth user :", data);
       return data;

      } catch (error) {
        throw error;
      }
    },
    retry : false 
  })

  if(isLoading){
    return(
      <div className='flex justify-center items-center h-screen'>
        <LoadingSpinner size='x-lg'/>
      </div>
    )
  }
  return (
    <div className='flex max-w-6xl mx-auto'>
      {authUser && <Sidebar/>}
      <Routes>
        <Route path='/' element={authUser ? <HomePage/> : <Navigate to ="/login"/>}/>
        <Route path='/login' element={ !authUser ? <Login/> : <Navigate to ="/"/>}/>
        <Route path='/signup' element={!authUser ? <SignUpPage/> : <Navigate to = "/"/>}/>
        <Route path='/notifications' element={authUser ? <NotificationPage/> : <Navigate to ='/login'/>}/>
        <Route path='/profile/:username' element={authUser ? <ProfilePage/> : <Navigate to ="/login"/>} />
      </Routes>
      
      {authUser && <RightPanel/>}
      <Toaster/>
    </div>
  )
}

export default App;