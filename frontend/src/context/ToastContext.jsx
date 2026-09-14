import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext=createContext(null)
export function ToastProvider({children}){
 const [items,setItems]=useState([])
 const toast=useCallback((message,type='success')=>{const id=Date.now()+Math.random();setItems(v=>[...v,{id,message,type}]);setTimeout(()=>setItems(v=>v.filter(x=>x.id!==id)),3600)},[])
 const remove=id=>setItems(v=>v.filter(x=>x.id!==id))
 const value=useMemo(()=>({toast}),[toast])
 return <ToastContext.Provider value={value}>{children}<div className="toast-stack" aria-live="polite">{items.map(t=><div className={`toast toast--${t.type}`} key={t.id}>{t.type==='error'?<AlertCircle/>:t.type==='info'?<Info/>:<CheckCircle2/>}<span>{t.message}</span><button onClick={()=>remove(t.id)} aria-label="Dismiss notification"><X size={16}/></button></div>)}</div></ToastContext.Provider>
}
export const useToast=()=>useContext(ToastContext)
