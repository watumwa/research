import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api, login as apiLogin, googleLogin as apiGoogleLogin, logout as clearTokens } from '../lib/api'

const AuthContext = createContext(null)

export function AuthProvider({children}){
  const [user,setUser] = useState(null)
  const [loading,setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('rsbc-access')
    if(!token){ setLoading(false); return }
    api('/auth/me/').then(setUser).catch(()=>{ clearTokens(); setUser(null) }).finally(()=>setLoading(false))
  },[])

  const login = async (email,password)=>{
    const u = await apiLogin(email,password)
    setUser(u)
    return u
  }
  const register = async (payload)=> api('/auth/register/', {method:'POST',body:JSON.stringify(payload)})
  const googleLogin = async (credential, acceptedTerms=false)=>{
    const u = await apiGoogleLogin(credential, acceptedTerms)
    setUser(u)
    return u
  }
  const logout = ()=>{ clearTokens(); setUser(null) }
  const refreshUser = async ()=>{ const u=await api('/auth/me/'); setUser(u); return u }
  const value = useMemo(()=>({user,loading,login,register,googleLogin,logout,refreshUser,setUser}),[user,loading])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = ()=>useContext(AuthContext)
