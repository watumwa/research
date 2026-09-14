import { useEffect, useMemo, useState } from 'react'
import { CheckCircle2, Download, Save, Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import Breadcrumbs from '../components/Breadcrumbs'
import { PageSkeleton } from '../components/Skeleton'
import { useToast } from '../context/ToastContext'
const fields=[
 ['source','1. Where is the problem coming from?','Describe what you observed, read, were told or noticed.'],
 ['problem','2. State the problem in one sentence','What is happening, to whom, where and how? Keep it precise.'],
 ['nature','3. Nature of the problem','What is broken or different from what should happen?'],
 ['magnitude','4. Magnitude / evidence','What number, pattern or fact shows this is serious?'],
 ['sourceEvidence','5. Source of the evidence','Where does the number or evidence come from?'],
 ['population','6. Population','Who exactly is affected?'],
 ['duration','7. Duration','Since when has this been happening?'],
 ['place','8. Place / setting','Where is the problem occurring?'],
 ['significance','9. Why does this matter?','What could this study add, and who should care about the answer?'],
]
export default function BuilderPage(){
 const {toast}=useToast(); const [draft,setDraft]=useState({title:'My research problem',data:{}}); const [status,setStatus]=useState('Loading…'); const [error,setError]=useState('')
 useEffect(()=>{api('/builders/research-problem/').then(d=>{setDraft(d);setStatus('Saved')}).catch(e=>setError(e.message))},[])
 useEffect(()=>{if(status==='Loading…')return;setStatus('Unsaved changes');const id=setTimeout(async()=>{try{await api('/builders/research-problem/',{method:'PUT',body:JSON.stringify({title:draft.title,data:draft.data})});setStatus('Saved automatically')}catch(e){setStatus('Save failed')}},900);return()=>clearTimeout(id)},[draft])
 const assembled=useMemo(()=>[draft.data.problem,draft.data.nature,draft.data.magnitude,draft.data.population&&`The problem affects ${draft.data.population}.`,draft.data.duration&&`It has persisted ${draft.data.duration}.`,draft.data.place&&`The study focuses on ${draft.data.place}.`,draft.data.significance].filter(Boolean).join(' '),[draft])
 const update=(k,v)=>setDraft(d=>({...d,data:{...d.data,[k]:v}}))
 const save=async()=>{setStatus('Saving…');try{const d=await api('/builders/research-problem/',{method:'PUT',body:JSON.stringify({title:draft.title,data:draft.data})});setDraft(d);setStatus('Saved');toast('Draft saved.')}catch(e){setStatus('Save failed');toast(e.message,'error')}}
 const download=()=>{const text=`${draft.title}\n\nASSEMBLED PROBLEM STATEMENT\n${assembled||'Complete the builder to assemble your draft.'}\n\nWORKING NOTES\n`+fields.map(([k,t])=>`${t}\n${draft.data[k]||''}`).join('\n\n');const blob=new Blob([text],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='research-problem-draft.txt';a.click();URL.revokeObjectURL(a.href)}
 if(status==='Loading…'&&!error)return <PageSkeleton/>
 return <div className="builder-page"><Breadcrumbs items={[{label:'Home',to:'/dashboard'},{label:'Builders',to:'/builder'},{label:'Research Problem Builder'}]}/><div className="page-heading"><div><span className="page-kicker">GUIDED RESEARCH WORKSPACE</span><h1>Research Problem Blueprint Builder</h1><p>Your work saves to your account automatically as you type.</p></div><div className="builder-actions"><span className="save-status"><Save/>{status}</span><button className="button button--soft" onClick={download}><Download/>Export draft</button><button className="button button--primary" onClick={save}>Save now</button></div></div>{error&&<div className="error-banner">{error}</div>}<div className="builder-layout"><main className="builder-form"><label className="builder-title">Draft title<input value={draft.title||''} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>{fields.map(([k,t,p],i)=><section className="builder-field" key={k}><span className="builder-step">{String(i+1).padStart(2,'0')}</span><div><h2>{t}</h2>{p&&<p>{p}</p>}<textarea rows={k==='problem'?3:5} value={draft.data?.[k]||''} onChange={e=>update(k,e.target.value)} placeholder="Write in your own words…"/></div></section>)}</main><aside className="builder-preview"><div className="builder-preview-card"><Sparkles/><span className="page-kicker">LIVE ASSEMBLY</span><h3>Your working problem statement</h3><p>{assembled||'As you complete the fields, your working statement will assemble here.'}</p><div className="quality-list"><span><CheckCircle2/>Uses your own words</span><span><CheckCircle2/>Evidence prompts stay visible</span><span><CheckCircle2/>Draft remains editable</span></div></div></aside></div></div>
}
