import { useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowRight, Mail } from 'lucide-react'
import Logo from '../components/Logo'
import PasswordField, { passwordStrength } from '../components/PasswordField'
import { api } from '../lib/api'

function Layout({children}){return <div className="auth-page"><header className="auth-header"><Link to="/"><Logo light/></Link><Link to="/login" className="text-link">Back to sign in</Link></header><main className="auth-layout"><div className="auth-copy"><span className="kicker">ACCOUNT RECOVERY</span><h1>Get back to your learning space.</h1><p>Use the email address connected to your account. Reset links expire automatically.</p></div>{children}</main></div>}

export function ForgotPasswordPage(){
 const [email,setEmail]=useState(''); const [message,setMessage]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const valid=useMemo(()=>/^\S+@\S+\.\S+$/.test(email),[email])
 const submit=async e=>{e.preventDefault();if(!valid)return;setBusy(true);setError('');try{const r=await api('/auth/password-reset/',{method:'POST',body:JSON.stringify({email})});setMessage(r.detail)}catch(err){setError(err.message)}finally{setBusy(false)}}
 return <Layout><form className="auth-card" onSubmit={submit} noValidate><h2>Reset password</h2><p>We will send reset instructions if the email matches an active account.</p>{message&&<div className="success-banner">{message}</div>}{error&&<div className="error-banner">{error}</div>}<label className={email&&!valid?'field-has-error':''}><span><Mail size={16}/>Email</span><input type="email" required value={email} onChange={e=>setEmail(e.target.value)}/>{email&&!valid&&<small className="field-error">Enter a valid email address.</small>}</label><button disabled={busy||!valid} className="button button--primary button--full">{busy?'Sending…':'Send reset instructions'} <ArrowRight size={16}/></button></form></Layout>
}

export function ResetPasswordPage(){
 const {uid,token}=useParams(); const nav=useNavigate(); const [password,setPassword]=useState(''); const [confirm,setConfirm]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false); const strong=passwordStrength(password)>=2; const match=!confirm||password===confirm
 const submit=async e=>{e.preventDefault();if(!strong){setError('Choose a stronger password.');return}if(password!==confirm){setError('Passwords do not match.');return}setBusy(true);setError('');try{await api('/auth/password-reset/confirm/',{method:'POST',body:JSON.stringify({uid,token,password})});nav('/login',{state:{reset:true}})}catch(err){setError(err.message)}finally{setBusy(false)}}
 return <Layout><form className="auth-card" onSubmit={submit}><h2>Choose a new password</h2><p>Use a password that you do not use on another service.</p>{error&&<div className="error-banner">{error}</div>}<PasswordField label="New password" showStrength minLength="8" required value={password} onChange={e=>setPassword(e.target.value)}/><PasswordField label="Confirm password" minLength="8" required value={confirm} onChange={e=>setConfirm(e.target.value)} error={!match?'Passwords do not match.':''}/><button disabled={busy||!strong||!confirm||!match} className="button button--primary button--full">{busy?'Saving…':'Set new password'} <ArrowRight size={16}/></button></form></Layout>
}
