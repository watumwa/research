import { BookOpenCheck } from 'lucide-react'
export default function Logo({compact=false,light=false}){
  return <div className={`brand ${light?'brand--light':''}`}><span className="brand-mark"><BookOpenCheck size={22} strokeWidth={2.2}/></span>{!compact&&<span className="brand-copy"><strong>Research Skills</strong><small>& Business Communication</small></span>}</div>
}
