import { useEffect, useMemo, useState } from 'react'
import { Download, Save, Sparkles } from 'lucide-react'
import { api } from '../lib/api'
import Breadcrumbs from '../components/Breadcrumbs'
import { PageSkeleton } from '../components/Skeleton'
import { useToast } from '../context/ToastContext'

const schemas={
 'chapter-one':{
   title:'Chapter One Builder',defaultTitle:'My Chapter One draft',kicker:'CHAPTER ONE SCAFFOLD',previewTitle:'Chapter One working outline',
   fields:[
    ['background','1. Background to the study','Explain the broader context, then narrow toward the specific issue.'],
    ['problemStatement','2. Problem statement','State the documented discrepancy between what is and what should be.'],
    ['purpose','3. Purpose of the study','In one sentence, state what the study intends to establish or understand.'],
    ['objectives','4. Specific objectives','List the concrete outcomes the study will pursue.'],
    ['questions','5. Research questions','Turn each objective into a focused, answerable research question.'],
    ['hypotheses','6. Hypotheses, if applicable','For quantitative studies, state testable expectations where appropriate.'],
    ['scope','7. Scope','Set boundaries for population, geography, variables and time.'],
    ['significance','8. Significance','Who can use the findings, and how might the evidence matter?'],
    ['framework','9. Conceptual / theoretical framework','Explain the main concepts or theory and how they relate.'],
    ['gap','10. Research gap','State precisely what existing evidence has not yet resolved.'],
   ]
 },
 'literature-review':{
   title:'Literature Review Builder',defaultTitle:'My Literature Review draft',kicker:'LITERATURE REVIEW SCAFFOLD',previewTitle:'Literature review working structure',
   fields:[
    ['focus','1. Review focus','What problem, question or objective is this review supporting?'],
    ['theme1','2. Theme One','Name the theme, list key sources and note the main pattern in the evidence.'],
    ['theme1Synthesis','3. Theme One synthesis','Where do the sources agree, disagree or use different methods/contexts?'],
    ['theme2','4. Theme Two','Name a second theme, key sources and the main evidence pattern.'],
    ['theme2Synthesis','5. Theme Two synthesis','Compare sources and explain what the pattern means for your study.'],
    ['theme3','6. Theme Three','Add a third theme if your review needs it.'],
    ['crossTheme','7. Cross-theme synthesis','What larger pattern becomes visible when the themes are considered together?'],
    ['limitations','8. Limitations in existing literature','What populations, contexts, variables or methods remain weakly covered?'],
    ['gap','9. Literature gap','What exactly remains unresolved and therefore justifies your study?'],
    ['bridge','10. Bridge to your study','Explain how your study responds to that gap.'],
   ]
 }
}

export default function StructuredBuilderPage({type}){
 const {toast}=useToast(); const schema=schemas[type]; const [draft,setDraft]=useState({title:schema.defaultTitle,data:{}}); const [status,setStatus]=useState('Loading…'); const [error,setError]=useState('')
 useEffect(()=>{api(`/builders/${type}/`).then(d=>{setDraft(d);setStatus('Saved')}).catch(e=>setError(e.message))},[type])
 useEffect(()=>{if(status==='Loading…')return;setStatus('Unsaved changes');const id=setTimeout(async()=>{try{await api(`/builders/${type}/`,{method:'PUT',body:JSON.stringify({title:draft.title,data:draft.data})});setStatus('Saved automatically')}catch{setStatus('Save failed')}},900);return()=>clearTimeout(id)},[draft,type])
 const assembled=useMemo(()=>schema.fields.map(([k,t])=>draft.data?.[k]?`${t.replace(/^\d+\.\s*/, '')}\n${draft.data[k]}`:'').filter(Boolean).join('\n\n'),[draft,schema])
 const update=(k,v)=>setDraft(d=>({...d,data:{...d.data,[k]:v}}))
 const save=async()=>{setStatus('Saving…');try{const d=await api(`/builders/${type}/`,{method:'PUT',body:JSON.stringify({title:draft.title,data:draft.data})});setDraft(d);setStatus('Saved');toast('Draft saved.')}catch(e){setStatus('Save failed');toast(e.message,'error')}}
 const download=()=>{const blob=new Blob([`${draft.title}\n\n${assembled}`],{type:'text/plain'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${type}-draft.txt`;a.click();URL.revokeObjectURL(a.href)}
 if(status==='Loading…'&&!error)return <PageSkeleton/>
 return <div className="builder-page"><Breadcrumbs items={[{label:'Home',to:'/dashboard'},{label:'Builders',to:'/builder'},{label:schema.title}]}/><div className="page-heading"><div><span className="page-kicker">{schema.kicker}</span><h1>{schema.title}</h1><p>Your work is saved under your account and remains editable.</p></div><div className="builder-actions"><span className="save-status"><Save/>{status}</span><button className="button button--soft" onClick={download}><Download/>Export</button><button className="button button--primary" onClick={save}>Save now</button></div></div>{error&&<div className="error-banner">{error}</div>}<div className="builder-layout"><main className="builder-form"><label className="builder-title">Draft title<input value={draft.title||''} onChange={e=>setDraft({...draft,title:e.target.value})}/></label>{schema.fields.map(([k,t,p],i)=><section className="builder-field" key={k}><span className="builder-step">{String(i+1).padStart(2,'0')}</span><div><h2>{t}</h2><p>{p}</p><textarea rows="6" value={draft.data?.[k]||''} onChange={e=>update(k,e.target.value)} placeholder="Write in your own words…"/></div></section>)}</main><aside className="builder-preview"><div className="builder-preview-card"><Sparkles/><span className="page-kicker">LIVE OUTLINE</span><h3>{schema.previewTitle}</h3><p className="builder-long-preview">{assembled||'Complete the prompts to build your working structure here.'}</p></div></aside></div></div>
}
