import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowRight, CheckCircle2, LockKeyhole, ShieldCheck } from 'lucide-react'
import { api } from '../lib/api'
import { PageSkeleton } from '../components/Skeleton'
import Breadcrumbs from '../components/Breadcrumbs'
export default function PremiumResourcePage(){
 const {slug}=useParams(); const [resource,setResource]=useState(null); const [error,setError]=useState('')
 useEffect(()=>{api(`/resources/${slug}/`).then(setResource).catch(e=>setError(e.message))},[slug])
 if(error)return <div className="error-banner">{error}</div>; if(!resource)return <PageSkeleton/>
 const crumb=<Breadcrumbs items={[{label:'Home',to:'/dashboard'},{label:'Resources',to:'/resources'},{label:resource.title}]}/>
 if(resource.access==='free')return <div>{crumb}<div className="page-heading"><div><span className="page-kicker">FREE RESOURCE</span><h1>{resource.title}</h1><p>{resource.summary}</p></div></div><section className="panel"><div className="preview-list">{resource.preview.map((x,i)=><div key={i}><CheckCircle2/><div><strong>{x.title}</strong><p>{x.text}</p></div></div>)}</div></section></div>
 if(resource.unlocked&&resource.lesson)return <div>{crumb}<div className="premium-unlocked"><CheckCircle2/><div><span className="page-kicker">ACCESS UNLOCKED</span><h1>{resource.title}</h1><p>This resource is available to your account.</p></div><Link to={`/lessons/${resource.lesson.slug}`} className="button button--gold">Open full module <ArrowRight/></Link></div></div>
 return <div>{crumb}<div className="premium-resource-hero"><div><span className="page-kicker">PREMIUM RESOURCE</span><h1>{resource.title}</h1><p>{resource.summary}</p></div><div className="premium-lock"><LockKeyhole/><span>Premium access</span></div></div><div className="premium-layout"><main><section className="premium-preview"><span className="kicker">WHAT YOU’LL UNLOCK</span><div className="preview-list">{resource.preview.map((x,i)=><div key={i}><CheckCircle2/><div><strong>{x.title}</strong><p>{x.text}</p></div></div>)}</div></section><section className="paywall-panel"><div><span className="page-kicker">ONE-TIME ACCESS</span><h2>{Number(resource.price).toLocaleString()} {resource.currency}</h2><p>Pay once to unlock this resource for your learner account.</p></div><Link to={`/checkout/${resource.slug}`} className="button button--gold">Continue to checkout <ArrowRight/></Link></section></main><aside className="premium-side-note"><ShieldCheck/><h3>Your access stays protected</h3><p>The full material becomes available only after payment is confirmed for your account.</p></aside></div></div>
}
