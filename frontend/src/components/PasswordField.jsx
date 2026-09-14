import { useState } from 'react'
import { Eye, EyeOff, LockKeyhole } from 'lucide-react'
export function passwordStrength(value=''){
 let score=0
 if(value.length>=8)score++
 if(/[A-Z]/.test(value))score++
 if(/[0-9]/.test(value))score++
 if(/[^A-Za-z0-9]/.test(value))score++
 return score
}
export default function PasswordField({label='Password',value,onChange,autoComplete='current-password',showStrength=false,error='',...props}){
 const [show,setShow]=useState(false); const score=passwordStrength(value)
 return <label className={`password-field ${error?'field-has-error':''}`}><span><LockKeyhole size={16}/>{label}</span><div className="password-input-wrap"><input {...props} type={show?'text':'password'} value={value} onChange={onChange} autoComplete={autoComplete}/><button type="button" onClick={()=>setShow(v=>!v)} aria-label={show?'Hide password':'Show password'}>{show?<EyeOff size={18}/>:<Eye size={18}/>}</button></div>{error&&<small className="field-error">{error}</small>}{showStrength&&<div className="password-strength"><div className="strength-bars">{[1,2,3,4].map(n=><i key={n} className={score>=n?'active':''}/>)}</div><small>{score<2?'Use 8+ characters with a number and uppercase letter.':score<4?'Good. Add a symbol for a stronger password.':'Strong password.'}</small></div>}</label>
}
