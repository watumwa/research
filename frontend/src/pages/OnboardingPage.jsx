import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, BookOpen, BriefcaseBusiness, GraduationCap, MessagesSquare } from 'lucide-react'
import Logo from '../components/Logo'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'

const goals=[
 {id:'research',title:'Research skills',text:'Research problems, Chapter One, literature review and methodology.',icon:BookOpen},
 {id:'communication',title:'Business communication',text:'Professional writing, speaking and workplace communication.',icon:MessagesSquare},
 {id:'both',title:'Both pathways',text:'Build research and communication skills together.',icon:GraduationCap},
]
const levels=['Undergraduate student','Postgraduate student','Researcher / educator','Working professional']
export default function OnboardingPage(){
 const {user,refreshUser}=useAuth(); const nav=useNavigate(); const {toast}=useToast(); const [step,setStep]=useState(1); const [goal,setGoal]=useState(user?.learning_goal||''); const [level,setLevel]=useState(user?.learner_level||''); const [busy,setBusy]=useState(false)
 const finish=async()=>{setBusy(true);try{await api('/auth/me/',{method:'PATCH',body:JSON.stringify({learning_goal:goal,learner_level:level,onboarding_completed:true})});await refreshUser();toast('Your learning space is ready.');nav('/dashboard',{replace:true})}catch(e){toast(e.message,'error')}finally{setBusy(false)}}
 return <div className="onboarding-page"><header><Logo light/><span>2 quick steps</span></header><main className="onboarding-card"><div className="onboarding-progress"><i className={step>=1?'active':''}/><i className={step>=2?'active':''}/></div>{step===1?<><span className="page-kicker">STEP 1 OF 2</span><h1>What do you want to work on first?</h1><p>This only helps us recommend a starting point. You can access both pathways at any time.</p><div className="choice-grid">{goals.map(g=>{const Icon=g.icon;return <button key={g.id} className={goal===g.id?'selected':''} onClick={()=>setGoal(g.id)}><Icon/><div><strong>{g.title}</strong><span>{g.text}</span></div></button>})}</div><button className="button button--primary button--full" disabled={!goal} onClick={()=>setStep(2)}>Continue <ArrowRight/></button></>:<><span className="page-kicker">STEP 2 OF 2</span><h1>Which description fits you best?</h1><p>We use this only to keep examples and recommendations relevant.</p><div className="level-list">{levels.map(l=><button key={l} className={level===l?'selected':''} onClick={()=>setLevel(l)}><BriefcaseBusiness/><span>{l}</span></button>)}</div><div className="onboarding-actions"><button className="button button--soft" onClick={()=>setStep(1)}>Back</button><button className="button button--primary" disabled={!level||busy} onClick={finish}>{busy?'Saving…':'Enter my learning space'} <ArrowRight/></button></div></>}</main></div>
}
