import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate, Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BarChart3, BookOpen, CircleDollarSign, Download, FileText, FolderOpen,
  LayoutDashboard, LockKeyhole, LogOut, Menu, Plus, Search, ShoppingBag, Upload,
  WalletCards, X, CheckCircle2, Eye, Trash2, Pencil, TrendingUp, RefreshCw, ExternalLink,
  PlayCircle, Video, Link2, FileUp, ImagePlus
} from 'lucide-react'

const API_URL = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api').replace(/\/$/, '')
const ADMIN_ACCESS = 'research-store-admin-access'
const ADMIN_REFRESH = 'research-store-admin-refresh'
const ADMIN_USER = 'research-store-admin-user'

const seedMaterials = [
  {id:1,slug:'research-proposal-writing-guide',title:'Research Proposal Writing Guide',category:'Research',description:'A clear guide to choosing a topic, developing objectives and structuring a research proposal.',type:'PDF',access:'free',price:0,downloads:324,published:true,updated:'12 Sep 2026'},
  {id:2,slug:'chapter-one-notes',title:'Chapter One Notes',category:'Research',description:'Practical notes on background, problem statement, objectives, questions, scope and significance.',type:'PDF',access:'paid',price:15000,downloads:186,published:true,updated:'10 Sep 2026'},
  {id:3,slug:'literature-review-made-simple',title:'Literature Review Made Simple',category:'Research',description:'How to search, organize, compare and synthesize literature without turning the chapter into summaries.',type:'PDF',access:'paid',price:20000,downloads:142,published:true,updated:'08 Sep 2026'},
  {id:4,slug:'business-communication-notes',title:'Business Communication Notes',category:'Communication',description:'Professional writing, email etiquette, meetings, presentations and workplace communication essentials.',type:'PDF',access:'free',price:0,downloads:271,published:true,updated:'05 Sep 2026'},
  {id:5,slug:'data-collection-methods-guide',title:'Data Collection Methods Guide',category:'Research',description:'A concise comparison of questionnaires, interviews, observation and document review.',type:'PDF',access:'paid',price:12000,downloads:93,published:true,updated:'30 Aug 2026'},
  {id:6,slug:'presentation-skills-checklist',title:'Presentation Skills Checklist',category:'Communication',description:'A one-page preparation checklist for confident academic and professional presentations.',type:'DOCX',access:'free',price:0,downloads:199,published:true,updated:'28 Aug 2026'},
  {id:7,slug:'basic-statistics-for-research',title:'Basic Statistics for Research',category:'Data Analysis',description:'Beginner-friendly notes on descriptive statistics, interpretation and presenting findings.',type:'PDF',access:'paid',price:18000,downloads:76,published:true,updated:'22 Aug 2026'},
]

function money(v){ return `UGX ${Number(v||0).toLocaleString()}` }
function todayLabel(){ return new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) }
function materialFromApi(m){
  return {
    ...m,
    price:Number(m.price||0),
    downloads:Number(m.downloads||0),
    published:m.published ?? m.is_published ?? true,
    type:m.type || m.file_type || 'PDF',
    contentType:m.content_type || 'document',
    playbackUrl:m.playback_url || '',
    coverUrl:m.cover_image || '',
    updated:m.updated_at ? new Date(m.updated_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) : todayLabel(),
  }
}
async function readError(response){
  try{
    const body=await response.json()
    if(typeof body?.detail==='string') return body.detail
    const first=Object.values(body||{})[0]
    if(Array.isArray(first)) return first[0]
    if(typeof first==='string') return first
  }catch{}
  return `Request failed (${response.status})`
}
async function api(path,{auth=false,_retry=true,...options}={}){
  const headers={...(options.headers||{})}
  if(!(options.body instanceof FormData) && options.body && !headers['Content-Type']) headers['Content-Type']='application/json'
  if(auth){
    const token=localStorage.getItem(ADMIN_ACCESS)
    if(token) headers.Authorization=`Bearer ${token}`
  }
  let response=await fetch(`${API_URL}${path}`,{...options,headers})
  if(response.status===401 && auth && _retry){
    const refresh=localStorage.getItem(ADMIN_REFRESH)
    if(refresh){
      const refreshed=await fetch(`${API_URL}/auth/token/refresh/`,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({refresh})})
      if(refreshed.ok){
        const tokens=await refreshed.json()
        if(tokens.access)localStorage.setItem(ADMIN_ACCESS,tokens.access)
        if(tokens.refresh)localStorage.setItem(ADMIN_REFRESH,tokens.refresh)
        return api(path,{auth,_retry:false,...options})
      }
    }
  }
  if(response.status===204) return null
  if(!response.ok) throw new Error(await readError(response))
  const type=response.headers.get('content-type')||''
  return type.includes('application/json')?response.json():response
}
async function downloadFrom(path, fallbackName='download'){
  const response=await fetch(`${API_URL}${path}`)
  if(!response.ok) throw new Error(await readError(response))
  const blob=await response.blob()
  const disposition=response.headers.get('content-disposition')||''
  const match=disposition.match(/filename\*?=(?:UTF-8''|\")?([^\";]+)/i)
  const filename=match?decodeURIComponent(match[1].replace(/\"/g,'')):fallbackName
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)
}

export default function App(){
  const [materials,setMaterials]=useState(seedMaterials)
  const [apiError,setApiError]=useState('')
  const refreshMaterials=async()=>{
    try{
      const rows=await api('/store/materials/')
      setMaterials((rows||[]).map(materialFromApi))
      setApiError('')
    }catch(err){
      setApiError(err.message)
    }
  }
  useEffect(()=>{refreshMaterials()},[])

  return <Routes>
    <Route path="/" element={<PublicHome materials={materials} refreshMaterials={refreshMaterials} apiError={apiError}/>}/>
    <Route path="/materials" element={<PublicHome materials={materials} refreshMaterials={refreshMaterials} apiError={apiError} focusMaterials/>}/>
    <Route path="/admin/login" element={<AdminLogin/>}/>
    <Route path="/admin/*" element={<AdminGuard><AdminApp onMaterialsChanged={refreshMaterials}/></AdminGuard>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}

function Brand(){
  return <Link to="/" className="simple-brand"><span><BookOpen size={23}/></span><div><strong>Research Skills</strong><small>Learning Resources</small></div></Link>
}

function PublicHome({materials,refreshMaterials,apiError,focusMaterials=false}){
  const [menu,setMenu]=useState(false)
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState('All')
  const [contentType,setContentType]=useState('all')
  const [accessType,setAccessType]=useState('all')
  const [checkout,setCheckout]=useState(null)
  const [viewer,setViewer]=useState(null)
  const [notice,setNotice]=useState('')
  const published=materials.filter(m=>m.published)
  const popular=useMemo(()=>[...published].sort((a,b)=>b.downloads-a.downloads).slice(0,4),[published])
  const categories=['All',...new Set(published.map(m=>m.category).filter(Boolean))]
  const categoryHubs=useMemo(()=>{
    const palette=['lime','coral','violet','teal']
    const hubs=[...new Set(published.map(m=>m.category).filter(Boolean))].slice(0,4).map((label,index)=>({label,category:label,count:published.filter(m=>m.category===label).length,tone:palette[index]}))
    if(hubs.length<4)hubs.push({label:'Video lessons',contentType:'video',count:published.filter(m=>m.contentType==='video').length,tone:palette[hubs.length]})
    return hubs
  },[published])
  const visible=published.filter(m=>(category==='All'||m.category===category) && (contentType==='all'||m.contentType===contentType) && (accessType==='all'||m.access===accessType) && `${m.title} ${m.description} ${m.category}`.toLowerCase().includes(query.toLowerCase()))
  useEffect(()=>{if(focusMaterials)setTimeout(()=>document.getElementById('materials')?.scrollIntoView(),0)},[focusMaterials])

  const showLibrary=({type='all',access='all',topic='All'}={})=>{
    setContentType(type);setAccessType(access);setCategory(topic);setMenu(false)
    requestAnimationFrame(()=>document.getElementById('materials')?.scrollIntoView({behavior:'smooth'}))
  }
  const selectHub=hub=>showLibrary({type:hub.contentType||'all',topic:hub.category||'All'})

  const downloadFree=async(m)=>{
    try{
      await downloadFrom(`/store/materials/${m.slug}/download/`,`${m.slug}.${String(m.type||'pdf').toLowerCase()}`)
      setNotice(`${m.title} download started.`)
      refreshMaterials()
    }catch(err){
      setNotice(err.message)
    }
    setTimeout(()=>setNotice(''),3600)
  }

  return <div className="simple-site resource-marketplace">
    <header className="simple-header"><div className="market-container header-inner">
      <Brand/>
      <nav className={menu?'open':''}><a href="#home" onClick={()=>setMenu(false)}>Home</a><button onClick={()=>showLibrary()}>Browse resources</button><button onClick={()=>showLibrary({type:'video'})}>Videos</button><a href="#about" onClick={()=>setMenu(false)}>How it works</a><Link to="/admin/login" onClick={()=>setMenu(false)}>Admin login</Link></nav>
      <Link className="simple-btn simple-btn--dark header-admin" to="/admin/login"><LockKeyhole size={16}/> Publisher login</Link>
      <button className="mobile-menu" onClick={()=>setMenu(!menu)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button>
    </div></header>

    {notice&&<div className="toast-demo"><CheckCircle2/> {notice}</div>}
    {apiError&&<div className="backend-warning">Backend connection unavailable. Catalogue fallback is visible, but live payments require the Django API.</div>}

    <main className="market-container library-shell" id="home">
      <aside className="resource-sidebar" aria-label="Resource library navigation">
        <div className="sidebar-welcome"><span>RS</span><div><strong>Learning library</strong><small>Find your next resource</small></div></div>
        <div className="sidebar-group"><b>Resources</b><button className={contentType==='all'&&accessType==='all'?'active':''} onClick={()=>showLibrary()}><FolderOpen/> Browse all</button><button className={contentType==='video'?'active':''} onClick={()=>showLibrary({type:'video'})}><PlayCircle/> Video lessons</button><button className={contentType==='document'?'active':''} onClick={()=>showLibrary({type:'document'})}><Download/> Downloads</button></div>
        <div className="sidebar-group"><b>Access</b><button className={accessType==='free'?'active':''} onClick={()=>showLibrary({access:'free'})}><BookOpen/> Free resources</button><button className={accessType==='paid'?'active':''} onClick={()=>showLibrary({access:'paid'})}><ShoppingBag/> Premium resources</button></div>
        <div className="sidebar-group"><b>Topics</b>{categories.filter(c=>c!=='All').map(c=><button key={c} className={category===c?'active':''} onClick={()=>showLibrary({topic:c})}>{c}</button>)}</div>
        <div className="sidebar-help"><strong>Need help?</strong><p>Choose a topic or search for a skill you want to build.</p><a href="#about">How the library works <ArrowRight/></a></div>
      </aside>

      <div className="library-main">
        <section className="resource-masthead">
          <div className="masthead-copy"><span>RESEARCH SKILLS LIBRARY</span><h1>Learning resources</h1><p>Practical books, guides and video lessons for study, research and professional growth.</p></div>
          <div className="masthead-mosaic" aria-hidden="true"><i/><i/><i/><i/><i/><i/></div>
          <form className="market-search" onSubmit={e=>{e.preventDefault();showLibrary({type:contentType,access:accessType,topic:category})}}><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search resources by keyword" aria-label="Search resources"/><button>Search</button></form>
        </section>

        <section className="hub-grid" aria-label="Browse resource hubs">
          {categoryHubs.map(hub=><button key={hub.label} className={`resource-hub hub--${hub.tone}`} onClick={()=>selectHub(hub)}><span><small>RESOURCE HUB</small><strong>{hub.label}</strong><em>{hub.count} {hub.count===1?'resource':'resources'}</em></span><i aria-hidden="true"/></button>)}
        </section>

        <section className="marketplace-section popular-section">
          <div className="marketplace-heading"><h2>Popular resources</h2><span/><button onClick={()=>showLibrary()}>View all <ArrowRight/></button></div>
          <div className="popular-grid">{popular.map(m=><MaterialCard compact key={m.id} material={m} onDownload={()=>downloadFree(m)} onWatch={()=>setViewer({material:m,source:m.playbackUrl})} onBuy={()=>setCheckout(m)}/>)}</div>
        </section>

        <section className="marketplace-section all-resources" id="materials">
          <div className="marketplace-heading"><div><span>FULL LIBRARY</span><h2>Browse all resources</h2><p>{visible.length} {visible.length===1?'result':'results'} matching your filters</p></div><i/></div>
          <div className="content-tabs" aria-label="Filter by content type"><button className={contentType==='all'?'active':''} onClick={()=>setContentType('all')}>All resources</button><button className={contentType==='video'?'active':''} onClick={()=>setContentType('video')}><PlayCircle/> Videos</button><button className={contentType==='document'?'active':''} onClick={()=>setContentType('document')}><FileText/> Downloads</button></div>
          <div className="materials-tools"><div className="material-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search this library"/></div><div className="category-pills">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
          {(accessType!=='all'||query)&&<div className="active-filters"><span>Showing {accessType==='all'?'all access types':accessType} {query&&`for “${query}”`}</span><button onClick={()=>{setAccessType('all');setQuery('')}}>Clear filters <X/></button></div>}
          <div className="materials-grid">{visible.map(m=><MaterialCard key={m.id} material={m} onDownload={()=>downloadFree(m)} onWatch={()=>setViewer({material:m,source:m.playbackUrl})} onBuy={()=>setCheckout(m)}/>)}</div>
          {!visible.length&&<div className="empty-public"><FolderOpen/><h3>No resources found</h3><p>Try another keyword, topic or access type.</p><button className="simple-btn simple-btn--dark" onClick={()=>{setQuery('');setCategory('All');setContentType('all');setAccessType('all')}}>Show all resources</button></div>}
        </section>

        <section className="about-simple market-about" id="about"><div className="about-grid"><div><span className="section-label">HOW IT WORKS</span><h2>Find it. Open it. Learn.</h2><p>A straightforward library for learners who need useful content without a complicated course platform.</p></div><div className="steps-simple"><article><b>1</b><div><h3>Search or choose a hub</h3><p>Find content by topic, format or keyword.</p></div></article><article><b>2</b><div><h3>Open it—or pay once</h3><p>Free content opens immediately. Premium content uses secure Mobile Money.</p></div></article><article><b>3</b><div><h3>Watch or download</h3><p>Learn in the browser or keep the resource for later.</p></div></article></div></div></section>
      </div>
    </main>
    <footer className="simple-footer"><div className="market-container"><Brand/><p>Simple learning resources for students, researchers and professionals.</p><span>© 2026 Research Skills.</span></div></footer>
    {checkout&&<CheckoutModal material={checkout} onClose={()=>setCheckout(null)} onPaid={()=>refreshMaterials()} onWatch={(source)=>{setCheckout(null);setViewer({material:checkout,source})}}/>}
    {viewer&&<VideoModal material={viewer.material} source={viewer.source} onClose={()=>setViewer(null)}/>}
  </div>
}

function MaterialCard({material,onDownload,onWatch,onBuy,compact=false}){
  const isVideo=material.contentType==='video'
  return <article className={`material-card ${isVideo?'material-card--video':''} ${compact?'material-card--compact':''}`}><div className="material-cover">{material.coverUrl?<img src={material.coverUrl} alt={`${material.title} cover`} loading="lazy"/>:<div className="material-cover-fallback">{isVideo?<PlayCircle/>:<BookOpen/>}<span>{material.category}</span></div>}<span className={`access-badge ${material.access}`}>{material.access==='free'?'FREE':'PREMIUM'}</span>{isVideo&&<span className="cover-play"><PlayCircle/></span>}</div><div className="material-card-body"><div className="material-category">{material.category} • {isVideo?'VIDEO':material.type}</div><h3>{material.title}</h3><p>{material.description}</p><div className="material-card-foot"><div><small>{material.downloads.toLocaleString()} {isVideo?'views':'downloads'}</small><strong>{material.access==='free'?'Free':money(material.price)}</strong></div>{material.access==='free'?(isVideo?<button className="simple-btn simple-btn--dark" onClick={onWatch} disabled={!material.playbackUrl}><PlayCircle size={16}/> Watch now</button>:<button className="simple-btn simple-btn--dark" onClick={onDownload}><Download size={16}/> Download</button>):<button className="simple-btn simple-btn--gold" onClick={onBuy}><ShoppingBag size={16}/> {isVideo?'Buy & watch':'Buy & download'}</button>}</div></div></article>
}

function toPlayableSource(source=''){
  try{
    const url=new URL(source,window.location.origin)
    const host=url.hostname.replace(/^www\./,'')
    if(host==='youtu.be')return {src:`https://www.youtube.com/embed/${url.pathname.slice(1)}`,embed:true}
    if(host.endsWith('youtube.com')){
      const id=url.searchParams.get('v')||url.pathname.split('/').filter(Boolean).pop()
      return {src:`https://www.youtube.com/embed/${id}`,embed:true}
    }
    if(host.endsWith('vimeo.com'))return {src:`https://player.vimeo.com/video/${url.pathname.split('/').filter(Boolean).pop()}`,embed:true}
    return {src:url.href,embed:false}
  }catch{return {src:source,embed:false}}
}

function VideoModal({material,source,onClose}){
  const playable=toPlayableSource(source)
  useEffect(()=>{const close=e=>e.key==='Escape'&&onClose();window.addEventListener('keydown',close);return()=>window.removeEventListener('keydown',close)},[onClose])
  return <div className="modal-backdrop video-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="video-modal" role="dialog" aria-modal="true" aria-label={material.title}><button className="modal-close" onClick={onClose} aria-label="Close video"><X/></button><div className="video-frame">{playable.embed?<iframe src={playable.src} title={material.title} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen/>:<video src={playable.src} controls autoPlay playsInline/>}</div><div className="video-copy"><span>{material.category} • VIDEO</span><h2>{material.title}</h2><p>{material.description}</p></div></div></div>
}

function CheckoutModal({material,onClose,onPaid,onWatch}){
  const [network,setNetwork]=useState('MTN')
  const [phone,setPhone]=useState('')
  const [name,setName]=useState('')
  const [email,setEmail]=useState('')
  const [stage,setStage]=useState('form')
  const [payment,setPayment]=useState(null)
  const [statusData,setStatusData]=useState(null)
  const [error,setError]=useState('')

  const checkStatus=async(paymentId=payment?.payment_id)=>{
    if(!paymentId) return
    try{
      const result=await api(`/store/payments/${paymentId}/status/`)
      setStatusData(result)
      if(result.status==='paid'){
        setStage('paid'); setError(''); onPaid?.()
      }else if(result.status==='failed'){
        setStage('failed'); setError('Flutterwave reports that this payment failed. You can try again with a new payment request.')
      }
    }catch(err){
      setError(err.message)
    }
  }
  useEffect(()=>{
    if(stage!=='waiting'||!payment?.payment_id) return
    const timer=window.setInterval(()=>checkStatus(payment.payment_id),4000)
    checkStatus(payment.payment_id)
    return ()=>window.clearInterval(timer)
  },[stage,payment?.payment_id])

  const submit=async(e)=>{
    e.preventDefault(); setError(''); setStage('starting')
    try{
      const result=await api('/store/payments/initiate/',{
        method:'POST',
        body:JSON.stringify({material_slug:material.slug,name,email,phone,network})
      })
      setPayment(result); setStage('waiting')
    }catch(err){
      setError(err.message); setStage('form')
    }
  }
  const restart=()=>{setStage('form');setPayment(null);setStatusData(null);setError('')}

  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="checkout-modal"><button className="modal-close" onClick={onClose}><X/></button>
    <span className="section-label">SECURE MOBILE MONEY</span><h2>{material.title}</h2><p>Pay once with MTN or Airtel Money and download the material immediately after verification.</p><div className="checkout-price">{money(material.price)}</div>
    {stage==='form'&&<form onSubmit={submit} className="checkout-form"><label>Full name<input required value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sarah Namusoke"/></label><label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="sarah@example.com"/></label><label>Mobile Money network<select value={network} onChange={e=>setNetwork(e.target.value)}><option value="MTN">MTN Mobile Money</option><option value="AIRTEL">Airtel Money</option></select></label><label>Phone number<input required value={phone} onChange={e=>setPhone(e.target.value)} placeholder="07xx xxx xxx"/></label>{error&&<div className="checkout-error">{error}</div>}<button className="simple-btn simple-btn--gold simple-btn--full">Pay {money(material.price)} <ArrowRight/></button><small className="demo-note">The amount and material are verified by the Django server; Flutterwave secret keys never enter the browser.</small></form>}
    {stage==='starting'&&<div className="payment-state"><RefreshCw className="spin"/><h3>Starting secure payment…</h3><p>Connecting to Flutterwave.</p></div>}
    {stage==='waiting'&&<div className="payment-state"><span className="payment-phone">{network}</span><h3>Check your phone</h3><p>A payment request for <strong>{money(material.price)}</strong> has been started for <strong>{payment?.phone}</strong>. Approve it with your Mobile Money PIN.</p>{payment?.redirect_url&&<a className="simple-btn simple-btn--outline simple-btn--full" href={payment.redirect_url} target="_blank" rel="noreferrer">Continue Flutterwave confirmation <ExternalLink size={16}/></a>}<button className="simple-btn simple-btn--dark simple-btn--full" onClick={()=>checkStatus()}><RefreshCw size={16}/> Check payment now</button>{error&&<div className="checkout-error">{error}</div>}<small className="demo-note">Keep this window open. Payment status is re-checked automatically.</small></div>}
    {stage==='paid'&&<div className="payment-state payment-success"><CheckCircle2/><h3>Payment successful</h3><p>Flutterwave confirmed the payment. Your content is now unlocked.</p>{material.contentType==='video'&&statusData?.delivery_url?<button className="simple-btn simple-btn--gold simple-btn--full" onClick={()=>onWatch(statusData.delivery_url)}><PlayCircle size={16}/> Watch video</button>:statusData?.download_url&&<a className="simple-btn simple-btn--gold simple-btn--full" href={statusData.download_url}><Download size={16}/> Download {material.type}</a>}<small className="demo-note">Reference: {statusData?.tx_ref}</small></div>}
    {stage==='failed'&&<div className="payment-state"><X/><h3>Payment not completed</h3><p>{error}</p><button className="simple-btn simple-btn--dark simple-btn--full" onClick={restart}>Try again</button></div>}
  </div></div>
}

function AdminLogin(){
  const nav=useNavigate(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [error,setError]=useState(''); const [busy,setBusy]=useState(false)
  const submit=async e=>{
    e.preventDefault(); setBusy(true); setError('')
    try{
      const result=await api('/auth/token/',{method:'POST',body:JSON.stringify({email,password})})
      localStorage.setItem(ADMIN_ACCESS,result.access); localStorage.setItem(ADMIN_REFRESH,result.refresh); localStorage.setItem(ADMIN_USER,JSON.stringify(result.user||{}))
      await api('/store/admin/overview/',{auth:true})
      nav('/admin/dashboard',{replace:true})
    }catch(err){
      localStorage.removeItem(ADMIN_ACCESS); localStorage.removeItem(ADMIN_REFRESH); localStorage.removeItem(ADMIN_USER)
      setError(err.message.includes('permission')?'This account is not allowed to manage store content.':err.message)
    }finally{setBusy(false)}
  }
  return <div className="admin-login-page"><div className="login-brand-row"><Brand/><Link to="/">Back to website</Link></div><div className="login-shell"><section className="login-side"><span>CONTENT OWNER PORTAL</span><h1>Share learning content without the fuss.</h1><p>Publish a document or video in a few clear steps, then see what people are using—all from one simple dashboard.</p><div className="login-benefits"><span><Upload/> Add documents and videos</span><span><BarChart3/> See learner activity</span><span><CircleDollarSign/> Track sales and revenue</span></div></section><form className="login-card" onSubmit={submit}><span className="section-label">ADMIN LOGIN</span><h2>Welcome back</h2><p>Sign in with your Django administrator or content-editor account.</p>{error&&<div className="login-error">{error}</div>}<label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy} className="simple-btn simple-btn--dark simple-btn--full">{busy?'Signing in…':'Sign in'} <ArrowRight/></button></form></div></div>
}

function AdminGuard({children}){return localStorage.getItem(ADMIN_ACCESS)?children:<Navigate to="/admin/login" replace/>}

function AdminApp({onMaterialsChanged}){
  const [sidebar,setSidebar]=useState(false)
  const [data,setData]=useState({materials:[],sales:[],overview:{},payouts:[],payoutConfig:{}})
  const [error,setError]=useState('')
  const nav=useNavigate()
  const logout=()=>{localStorage.removeItem(ADMIN_ACCESS);localStorage.removeItem(ADMIN_REFRESH);localStorage.removeItem(ADMIN_USER);nav('/admin/login',{replace:true})}
  const load=async()=>{
    try{
      const [materials,payments,overview,payouts,payoutConfig]=await Promise.all([
        api('/store/admin/materials/',{auth:true}),
        api('/store/admin/payments/',{auth:true}),
        api('/store/admin/overview/',{auth:true}),
        api('/store/admin/payouts/',{auth:true}),
        api('/store/admin/payout-config/',{auth:true})
      ])
      setData({
        materials:(materials||[]).map(materialFromApi),
        sales:(payments||[]).map(p=>({id:p.id,date:new Date(p.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),customer:p.customer_name,material:p.material_title,amount:Number(p.amount||0),method:p.network,status:p.status,reference:p.tx_ref})),
        overview,
        payouts:payouts||[],
        payoutConfig:payoutConfig||{},
      });setError('')
    }catch(err){if(String(err.message).includes('401')) logout(); else setError(err.message)}
  }
  useEffect(()=>{load()},[])
  const updateMaterial=async(id,patch)=>{
    if(patch.file instanceof File || patch.cover instanceof File){
      const fd=new FormData();if(patch.file)fd.append('file',patch.file);if(patch.cover)fd.append('cover_image',patch.cover);if(patch.type)fd.append('type',patch.type)
      await api(`/store/admin/materials/${id}/`,{auth:true,method:'PATCH',body:fd})
    }else{
      await api(`/store/admin/materials/${id}/`,{auth:true,method:'PATCH',body:JSON.stringify(patch)})
    }
    await load();onMaterialsChanged?.()
  }
  const deleteMaterial=async id=>{await api(`/store/admin/materials/${id}/`,{auth:true,method:'DELETE'});await load();onMaterialsChanged?.()}
  const sendPayout=async id=>{await api(`/store/admin/payouts/${id}/send/`,{auth:true,method:'POST',body:'{}'});await load()}
  const refreshPayout=async id=>{await api(`/store/admin/payouts/${id}/refresh/`,{auth:true,method:'POST',body:'{}'});await load()}
  const addMaterial=async form=>{
    const fd=new FormData();fd.append('title',form.title);fd.append('category',form.category);fd.append('description',form.description);fd.append('content_type',form.contentType);fd.append('type',form.contentType==='video'?'VIDEO':form.type);fd.append('access',form.access);fd.append('price',form.access==='paid'?form.price||0:0);fd.append('currency','UGX');fd.append('published','true');if(form.file)fd.append('file',form.file);if(form.cover)fd.append('cover_image',form.cover);if(form.videoUrl)fd.append('video_url',form.videoUrl)
    await api('/store/admin/materials/',{auth:true,method:'POST',body:fd});await load();onMaterialsChanged?.()
  }
  return <div className="admin-app"><aside className={sidebar?'open':''}><div className="admin-aside-head"><Brand/><button onClick={()=>setSidebar(false)}><X/></button></div><div className="owner-chip"><div>RS</div><span><strong>Content Owner</strong><small>Administrator</small></span></div><nav><AdminNav to="/admin/dashboard" icon={<LayoutDashboard/>}>Overview</AdminNav><AdminNav to="/admin/materials" icon={<FileText/>}>My content</AdminNav><AdminNav to="/admin/upload" icon={<Upload/>}>Add content</AdminNav><AdminNav to="/admin/sales" icon={<WalletCards/>}>Sales & revenue</AdminNav></nav><div className="aside-bottom"><Link to="/" target="_blank"><Eye/> View public website</Link><button onClick={logout}><LogOut/> Sign out</button></div></aside><div className="admin-main"><header className="admin-topbar"><button className="admin-menu" onClick={()=>setSidebar(true)}><Menu/></button><div><strong>Content Management</strong><small>Documents, videos and payments in one place</small></div><Link to="/admin/upload" className="simple-btn simple-btn--dark"><Plus/> Add content</Link></header><main className="admin-content">{error&&<div className="login-error">{error}</div>}<Routes><Route path="dashboard" element={<Overview data={data}/>}/><Route path="materials" element={<MaterialsAdmin data={data} updateMaterial={updateMaterial} deleteMaterial={deleteMaterial}/>}/><Route path="upload" element={<UploadMaterial addMaterial={addMaterial}/>}/><Route path="sales" element={<SalesAdmin data={data} sendPayout={sendPayout} refreshPayout={refreshPayout}/>}/><Route path="*" element={<Navigate to="dashboard" replace/>}/></Routes></main></div></div>
}
function AdminNav({to,icon,children}){return <NavLink to={to} className={({isActive})=>isActive?'active':''}>{icon}<span>{children}</span></NavLink>}

function Overview({data}){
  const overview=data.overview||{}
  const top=[...data.materials].sort((a,b)=>b.downloads-a.downloads).slice(0,5)
  const max=Math.max(...top.map(m=>m.downloads),1)
  const successful=data.sales.filter(s=>s.status==='paid')
  return <div><AdminHeading label="OVERVIEW" title="Your content at a glance" text="See what is published, what learners use and what has sold."/><div className="metric-grid"><Metric icon={<FileText/>} label="Total content" value={overview.total_materials??data.materials.length} note={`${overview.published_materials??data.materials.filter(m=>m.published).length} published`}/><Metric icon={<Video/>} label="Video lessons" value={overview.total_videos??data.materials.filter(m=>m.contentType==='video').length} note="Uploaded or linked videos"/><Metric icon={<ShoppingBag/>} label="Successful sales" value={overview.successful_sales??successful.length} note={`${overview.paid_materials??data.materials.filter(m=>m.access==='paid').length} premium resources`}/><Metric icon={<CircleDollarSign/>} label="Total revenue" value={money(overview.revenue||0)} note="Confirmed Flutterwave revenue"/></div><div className="overview-grid"><section className="admin-panel"><div className="panel-head"><div><h3>Most-used content</h3><p>See what your audience opens most.</p></div><Link to="/admin/materials">View all</Link></div><div className="download-bars">{top.map((m,i)=><div className="download-bar" key={m.id}><span className="rank">{i+1}</span><div className="bar-info"><div><strong>{m.title}</strong><small>{m.downloads.toLocaleString()} {m.contentType==='video'?'views':'downloads'}</small></div><i><b style={{width:`${m.downloads/max*100}%`}}/></i></div></div>)}</div></section><section className="admin-panel"><div className="panel-head"><div><h3>Recent successful sales</h3><p>Latest confirmed premium purchases.</p></div><Link to="/admin/sales">View all</Link></div><div className="recent-sales">{successful.slice(0,5).map(s=><div key={s.id}><span className="sale-icon"><CircleDollarSign/></span><div><strong>{s.material}</strong><small>{s.customer} • {s.method}</small></div><b>{money(s.amount)}</b></div>)}</div></section></div></div>
}
function Metric({icon,label,value,note}){return <article className="metric-card"><span className="metric-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>}
function AdminHeading({label,title,text,action}){return <div className="admin-heading"><div><span>{label}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>}

function MaterialsAdmin({data,updateMaterial,deleteMaterial}){
  const [q,setQ]=useState('');const [filter,setFilter]=useState('all');const [error,setError]=useState('')
  const rows=data.materials.filter(m=>(filter==='all'||m.access===filter)&&`${m.title} ${m.category}`.toLowerCase().includes(q.toLowerCase()))
  const update=async(id,patch)=>{try{setError('');await updateMaterial(id,patch)}catch(err){setError(err.message)}}
  const remove=async m=>{if(!confirm(`Delete ${m.title}?`))return;try{setError('');await deleteMaterial(m.id)}catch(err){setError(err.message)}}
  return <div><AdminHeading label="CONTENT" title="My content" text="Documents and videos in your public learning library." action={<Link to="/admin/upload" className="simple-btn simple-btn--dark"><Plus/> Add content</Link>}/>{error&&<div className="login-error">{error}</div>}<div className="admin-filterbar"><div className="material-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search content"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All access types</option><option value="free">Free</option><option value="paid">Paid</option></select></div><section className="admin-panel table-panel"><div className="data-table material-table"><div className="data-row data-head"><span>Content</span><span>Access</span><span>Price</span><span>Activity</span><span>Status</span><span>Actions</span></div>{rows.map(m=><div className="data-row" key={m.id}><span className="material-cell"><i>{m.coverUrl?<img src={m.coverUrl} alt=""/>:m.contentType==='video'?<Video/>:<FileText/>}</i><span><strong>{m.title}</strong><small>{m.category} • {m.contentType==='video'?'Video':m.type}</small></span></span><span><em className={`access-pill ${m.access}`}>{m.access}</em></span><span>{m.access==='paid'?money(m.price):'—'}</span><span>{m.downloads.toLocaleString()}</span><span><button className={`status-toggle ${m.published?'on':''}`} onClick={()=>update(m.id,{published:!m.published})}><i/>{m.published?'Published':'Hidden'}</button></span><span className="row-actions"><label className="row-file-action" title="Replace cover photo"><ImagePlus/><input type="file" accept="image/jpeg,image/png,image/webp" onChange={e=>{const cover=e.target.files?.[0];if(cover)update(m.id,{cover})}}/></label><label className="row-file-action" title={m.file_name?'Replace content file':'Upload content file'}><Upload/><input type="file" accept={m.contentType==='video'?'video/*':'.pdf,.doc,.docx,.ppt,.pptx,.zip'} onChange={e=>{const f=e.target.files?.[0];if(f)update(m.id,{file:f,type:m.contentType==='video'?'VIDEO':(f.name.split('.').pop()||m.type).toUpperCase()})}}/></label><button title="Rename" onClick={()=>{const t=prompt('Content title',m.title);if(t)update(m.id,{title:t})}}><Pencil/></button><button title="Delete" onClick={()=>remove(m)}><Trash2/></button></span></div>)}</div></section></div>
}

function UploadMaterial({addMaterial}){
  const nav=useNavigate();const [saved,setSaved]=useState(false);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [coverPreview,setCoverPreview]=useState('');const [form,setForm]=useState({title:'',category:'Research',description:'',contentType:'document',videoSource:'upload',videoUrl:'',type:'PDF',access:'free',price:'',file:null,cover:null})
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  useEffect(()=>()=>{if(coverPreview)URL.revokeObjectURL(coverPreview)},[coverPreview])
  const chooseCover=file=>{set('cover',file);setCoverPreview(file?URL.createObjectURL(file):'')}
  const changeContentType=contentType=>setForm(f=>({...f,contentType,file:null,videoUrl:'',type:contentType==='video'?'VIDEO':'PDF'}))
  const submit=async e=>{e.preventDefault();setError('');if(!form.cover){setError('Choose a cover photo for this content.');return}if(form.contentType==='video'&&form.videoSource==='link'&&!form.videoUrl){setError('Add the video link before publishing.');return}if((form.contentType==='document'||form.videoSource==='upload')&&!form.file){setError(`Choose a ${form.contentType==='video'?'video':'document'} to upload.`);return}setBusy(true);try{await addMaterial({...form,file:form.videoSource==='link'?null:form.file,videoUrl:form.videoSource==='link'?form.videoUrl:''});setSaved(true);setTimeout(()=>nav('/admin/materials'),700)}catch(err){setError(err.message)}finally{setBusy(false)}}
  return <div>
    <AdminHeading label="CONTENT" title="Add something new" text="Choose a format, add the details, then publish."/>
    <form className="upload-form admin-panel" onSubmit={submit}>
      {saved&&<div className="success-message"><CheckCircle2/> Your content is now published.</div>}
      {error&&<div className="login-error">{error}</div>}
      <fieldset className="upload-step">
        <legend><b>1</b><span>What are you sharing?</span></legend>
        <div className="content-choice">
          <button type="button" className={form.contentType==='document'?'active':''} onClick={()=>changeContentType('document')}><FileText/><span><strong>A document</strong><small>PDF, Word, slides or ZIP</small></span></button>
          <button type="button" className={form.contentType==='video'?'active':''} onClick={()=>changeContentType('video')}><Video/><span><strong>A video lesson</strong><small>Upload a video or paste a link</small></span></button>
        </div>
      </fieldset>
      <fieldset className="upload-step">
        <legend><b>2</b><span>Tell learners about it</span></legend>
        <div className="form-two">
          <label>Title<input required value={form.title} onChange={e=>set('title',e.target.value)} placeholder={form.contentType==='video'?'e.g. Writing a strong research question':'e.g. Research Methodology Notes'}/></label>
          <label>Category<select value={form.category} onChange={e=>set('category',e.target.value)}><option>Research</option><option>Communication</option><option>Data Analysis</option><option>Career</option><option>Other</option></select></label>
        </div>
        <label>Short description<textarea required rows="3" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="What will someone learn from this?"/></label>
      </fieldset>
      <fieldset className="upload-step">
        <legend><b>3</b><span>Add a cover and the {form.contentType==='video'?'video':'file'}</span></legend>
        <div className="cover-upload-row">
          <label className={`cover-upload ${coverPreview?'has-image':''}`}>
            {coverPreview?<img src={coverPreview} alt="Cover preview"/>:<span><ImagePlus/><strong>Add cover photo</strong><small>JPG, PNG or WebP · max 5 MB</small></span>}
            <input type="file" required accept="image/jpeg,image/png,image/webp" onChange={e=>chooseCover(e.target.files?.[0]||null)}/>
          </label>
          <div className="cover-upload-copy"><strong>Choose a clear, attractive cover.</strong><p>This is the first image learners will see in the library. Portrait or landscape images both work.</p>{form.cover&&<small><CheckCircle2/> {form.cover.name}</small>}</div>
        </div>
        {form.contentType==='video'&&<div className="source-choice"><button type="button" className={form.videoSource==='upload'?'active':''} onClick={()=>set('videoSource','upload')}><FileUp/> Upload video</button><button type="button" className={form.videoSource==='link'?'active':''} onClick={()=>set('videoSource','link')}><Link2/> Paste video link</button></div>}
        {form.contentType==='video'&&form.videoSource==='link'?<label>Video link<input required type="url" value={form.videoUrl} onChange={e=>set('videoUrl',e.target.value)} placeholder="YouTube, Vimeo or a direct video URL"/></label>:<div className="upload-zone">{form.contentType==='video'?<Video/>:<Upload/>}<strong>Choose {form.contentType==='video'?'a video':'the document'} to upload</strong><span>{form.contentType==='video'?'MP4, WebM or MOV':'PDF, DOCX, PPTX or ZIP'}</span><input type="file" accept={form.contentType==='video'?'video/mp4,video/webm,video/quicktime':'.pdf,.doc,.docx,.ppt,.pptx,.zip'} onChange={e=>{const file=e.target.files?.[0]||null;setForm(f=>({...f,file,type:f.contentType==='video'?'VIDEO':(file?.name.split('.').pop()||'PDF').toUpperCase()}))}}/>{form.file&&<b>{form.file.name}</b>}</div>}
        <div className="form-two"><label>Who can access it?<select value={form.access} onChange={e=>set('access',e.target.value)}><option value="free">Everyone — free</option><option value="paid">Premium — pay once</option></select></label>{form.access==='paid'&&<label>Price (UGX)<input type="number" min="1" required value={form.price} onChange={e=>set('price',e.target.value)} placeholder="15000"/></label>}</div>
      </fieldset>
      <div className="form-actions"><Link to="/admin/materials" className="simple-btn simple-btn--outline">Cancel</Link><button disabled={busy} className="simple-btn simple-btn--dark"><Upload/> {busy?'Publishing…':'Publish now'}</button></div>
    </form>
  </div>
}

function SalesAdmin({data,sendPayout,refreshPayout}){
  const overview=data.overview||{}
  const config=data.payoutConfig||{}
  const successful=data.sales.filter(s=>s.status==='paid')
  const avg=successful.length?successful.reduce((a,s)=>a+s.amount,0)/successful.length:0
  const [busy,setBusy]=useState(''); const [error,setError]=useState('')
  const send=async id=>{if(!confirm(`Send this payout to ${config.destination_number||'the configured number'}?`))return;setBusy(id);setError('');try{await sendPayout(id)}catch(e){setError(e.message)}finally{setBusy('')}}
  const refresh=async id=>{setBusy(id);setError('');try{await refreshPayout(id)}catch(e){setError(e.message)}finally{setBusy('')}}
  return <div><AdminHeading label="REVENUE" title="Sales & revenue" text="Flutterwave payment records, payout destination and verified premium-material purchases."/><div className="metric-grid metric-grid--three"><Metric icon={<CircleDollarSign/>} label="Total revenue" value={money(overview.revenue||0)} note="Verified successful payments"/><Metric icon={<ShoppingBag/>} label="Successful sales" value={successful.length} note={`${data.sales.filter(s=>s.status==='pending').length} pending`}/><Metric icon={<WalletCards/>} label="Payout destination" value={config.destination_number||'—'} note={config.automatic_payout?'Automatic payout enabled':'Manual payout mode'}/></div>{error&&<div className="login-error">{error}</div>}<section className="admin-panel table-panel"><div className="panel-head"><div><h3>Payout queue</h3><p>Every verified sale is explicitly assigned to {config.destination_number||'the configured Uganda Mobile Money number'}.</p></div></div><div className="data-table sales-table"><div className="data-row data-head"><span>Reference</span><span>Destination</span><span>Material</span><span>Status</span><span>Action</span></div>{(data.payouts||[]).map(p=><div className="data-row" key={p.id}><span>{p.reference}</span><span>{p.destination_number}</span><span><strong>{p.material_title}</strong><small>{money(p.amount)}</small></span><span>{p.status}</span><span>{p.status==='queued'||p.status==='failed'?<button className="table-action" disabled={busy===p.id} onClick={()=>send(p.id)}>{busy===p.id?'Sending…':'Send payout'}</button>:p.flutterwave_transfer_id&&p.status!=='successful'?<button className="table-action" disabled={busy===p.id} onClick={()=>refresh(p.id)}><RefreshCw size={15}/> Refresh</button>:'Complete'}</span></div>)}</div></section><section className="admin-panel table-panel"><div className="panel-head"><div><h3>Payment history</h3><p>Successful, pending and failed Flutterwave transactions.</p></div></div><div className="data-table sales-table"><div className="data-row data-head"><span>Date</span><span>Customer</span><span>Material</span><span>Method / status</span><span>Amount</span></div>{data.sales.map(s=><div className="data-row" key={s.id}><span>{s.date}</span><span>{s.customer}</span><span><strong>{s.material}</strong></span><span>{s.method} • {s.status}</span><span className={s.status==='paid'?'sale-amount':''}>{money(s.amount)}</span></div>)}</div></section></div>
}
