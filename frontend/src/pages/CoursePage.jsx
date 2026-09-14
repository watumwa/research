import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, BookOpenCheck, CheckCircle2, Clock3, LockKeyhole, Sparkles, ChevronDown } from 'lucide-react'
import { api } from '../lib/api'
import Breadcrumbs from '../components/Breadcrumbs'
import { PageSkeleton } from '../components/Skeleton'

export default function CoursePage(){
 const {slug}=useParams(); const [course,setCourse]=useState(null); const [error,setError]=useState(''); const [open,setOpen]=useState({})
 useEffect(()=>{setCourse(null);setError('');api(`/courses/${slug}/`).then(c=>{setCourse(c);const resumeModule=c.modules.find(m=>m.lessons.some(l=>l.slug===c.resume_lesson?.slug));setOpen({[resumeModule?.slug||c.modules[0]?.slug]:true})}).catch(e=>setError(e.message))},[slug])
 const total=useMemo(()=>course?.modules?.reduce((n,m)=>n+m.lessons.length,0)||0,[course])
 if(error)return <div className="error-banner">{error}</div>
 if(!course)return <PageSkeleton/>
 return <div className="course-page"><Breadcrumbs items={[{label:'Home',to:'/dashboard'},{label:course.title}]}/><section className={`course-hero course-hero--${course.accent}`}><div><span className="page-kicker">{course.category}</span><h1>{course.title}</h1><p>{course.description}</p><div className="course-hero-meta"><span><BookOpenCheck/> {course.modules.length} modules · {total} activities</span><span><Sparkles/> Explain → Model → Practice → Apply</span></div>{course.resume_lesson&&<Link className="button button--gold course-resume" to={`/lessons/${course.resume_lesson.slug}`}>Continue: {course.resume_lesson.title} <ArrowRight/></Link>}</div><div className="course-score"><strong>{course.completion}%</strong><span>complete</span></div></section>
 <div className="course-modules">{course.modules.map((m,mi)=>{const expanded=!!open[m.slug];return <section className={`module-card ${expanded?'expanded':''}`} key={m.slug}><button className="module-toggle" onClick={()=>setOpen(v=>({...v,[m.slug]:!v[m.slug]}))} aria-expanded={expanded}><div className="module-number">{String(mi+1).padStart(2,'0')}</div><div className="module-content"><div className="module-heading"><div><h2>{m.title}</h2><p>{m.description}</p></div><span>{m.completion?.done||0}/{m.completion?.total||m.lessons.length} complete</span></div></div><ChevronDown className="module-chevron"/></button>{expanded&&<div className="lesson-list">{m.lessons.map((l,i)=><Link key={l.slug} to={l.locked?'/resources/problem-analysis':`/lessons/${l.slug}`} className={`lesson-row ${l.locked?'locked':''}`}><span className="lesson-index">{String(i+1).padStart(2,'0')}</span><div><strong>{l.title}</strong><small>{l.duration_minutes} min {l.is_premium?'· Premium':''}</small></div><div className="lesson-row-end">{l.progress?.completed?<CheckCircle2/>:l.locked?<LockKeyhole/>:<><Clock3/><span>{l.progress?.percent||0}%</span></>}<ArrowRight/></div></Link>)}</div>}</section>})}</div></div>
}
