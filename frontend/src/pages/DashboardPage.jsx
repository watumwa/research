import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, BookOpen, CheckCircle2, GraduationCap, MessageSquareText, PenTool, Sparkles, Award, LockOpen } from 'lucide-react'
import { api } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { PageSkeleton } from '../components/Skeleton'

export default function DashboardPage(){
 const {user}=useAuth(); const [data,setData]=useState(null); const [error,setError]=useState('')
 useEffect(()=>{api('/dashboard/').then(setData).catch(e=>setError(e.message))},[])
 const first=(user?.first_name||user?.name||'Learner').split(' ')[0]
 const nextLesson=useMemo(()=>{const recommended=data?.recommended_course;if(recommended?.resume_lesson)return {...recommended.resume_lesson,course:recommended.title,courseSlug:recommended.slug};for(const c of data?.courses||[])if(c.resume_lesson)return {...c.resume_lesson,course:c.title,courseSlug:c.slug};return null},[data])
 if(error)return <div className="error-banner">{error}</div>
 if(!data)return <PageSkeleton/>
 return <div className="dashboard-page simple-dashboard">
  <div className="page-heading"><div><span className="page-kicker">YOUR LEARNING SPACE</span><h1>Welcome, {first}.</h1><p>Pick up one useful task. You do not need to do everything at once.</p></div><Link to="/builder" className="button button--soft"><PenTool size={17}/>My builders</Link></div>
  {nextLesson&&<section className="continue-card continue-card--simple"><div className="continue-main"><div className="course-badge"><BookOpen size={16}/>{nextLesson.course}</div><h2>Continue: {nextLesson.title}</h2><p>{nextLesson.module_title} · {nextLesson.duration_minutes} min</p><Link className="button button--gold" to={`/lessons/${nextLesson.slug}`}>Continue lesson <ArrowRight size={17}/></Link></div><div className="continue-progress"><strong className="big-progress">{nextLesson.percent||0}%</strong><span>saved progress</span></div></section>}
  <div className="dashboard-summary"><div><CheckCircle2/><strong>{data.completed_lessons}</strong><span>Lessons completed</span></div><div><PenTool/><strong>{data.latest_builder?'1':'0'}</strong><span>Recent builder</span></div><div><LockOpen/><strong>{data.premium_access_count}</strong><span>Premium resources</span></div></div>
  <div className="section-row"><div><span className="page-kicker">PATHWAYS</span><h2>Choose what you need today</h2></div></div>
  <div className="path-grid path-grid--simple">{data.courses.map(c=><article className="path-card" key={c.slug}><div className="path-top"><div className={`path-icon ${c.accent==='teal'?'path-icon--teal':'path-icon--navy'}`}>{c.accent==='teal'?<MessageSquareText/>:<GraduationCap/>}</div><span>{c.completion}%</span></div><h3>{c.title}</h3><p>{c.subtitle}</p><div className="path-progress"><i style={{width:`${c.completion}%`}}/></div><Link to={`/courses/${c.slug}`}>{c.resume_lesson?'Continue pathway':'Explore pathway'} <ArrowRight/></Link></article>)}</div>
  <div className="dashboard-two-col">
   <section className="panel dashboard-recent"><div className="panel-title"><div><h3>Recent activity</h3><p className="subtle">Your latest saved work</p></div></div>{data.recent_activity?.length?data.recent_activity.map(x=><Link to={`/lessons/${x.lesson_slug}`} className="activity-row" key={`${x.lesson_slug}-${x.updated_at}`}><div><strong>{x.lesson_title}</strong><span>{x.course_title}</span></div><b>{x.completed?'Completed':`${x.percent}%`}</b></Link>):<div className="empty-state-action"><BookOpen/><strong>No learning activity yet.</strong><span>Start with one short lesson.</span><Link to="/courses/research-blueprint">Browse lessons</Link></div>}</section>
   <section className="panel"><div className="panel-title"><div><h3><Award/>Milestones</h3><p className="subtle">Simple markers of progress, not a competition</p></div></div>{data.milestones?.length?data.milestones.map((m,i)=><div className="milestone-row" key={i}><Sparkles/><div><strong>{m.title}</strong><span>{m.detail}</span></div></div>):<div className="empty-state-action"><Award/><strong>Your first milestone is close.</strong><span>Complete one lesson to begin.</span></div>}</section>
  </div>
 </div>
}
