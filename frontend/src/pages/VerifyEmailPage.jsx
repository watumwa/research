import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { CheckCircle2, MailCheck } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
export default function VerifyEmailPage(){
 const {uid,token}=useParams(); const {user,refreshUser}=useAuth(); const [state,setState]=useState({loading:true,message:'',error:''})
 useEffect(()=>{api('/auth/verify-email/',{method:'POST',body:JSON.stringify({uid,token})}).then(async r=>{if(user){try{await refreshUser()}catch{}}setState({loading:false,message:r.detail,error:''})}).catch(e=>setState({loading:false,message:'',error:e.message}))},[uid,token])
 return <div className="legal-page"><div className="verification-card">{state.loading?<><MailCheck/><h1>Verifying your email…</h1></>:state.error?<><MailCheck/><h1>We could not verify this link.</h1><p>{state.error}</p><Link className="button button--primary" to="/login">Sign in</Link></>:<><CheckCircle2/><h1>Email verified.</h1><p>{state.message}</p><Link className="button button--primary" to={user?'/dashboard':'/login'}>{user?'Go to dashboard':'Sign in'}</Link></>}</div></div>
}
