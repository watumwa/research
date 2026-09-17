import { useEffect, useMemo, useState } from 'react'
import { Routes, Route, Navigate, Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BarChart3, BookOpen, CircleDollarSign, Download, FileText, FolderOpen,
  LayoutDashboard, LockKeyhole, LogOut, Menu, Plus, Search, ShoppingBag, Upload,
  WalletCards, X, CheckCircle2, Eye, Trash2, Pencil, TrendingUp, RefreshCw, ExternalLink
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
  const [checkout,setCheckout]=useState(null)
  const [notice,setNotice]=useState('')
  const [featuredIndex,setFeaturedIndex]=useState(0)
  const [featuredPaused,setFeaturedPaused]=useState(false)
  const published=materials.filter(m=>m.published)
  const featuredMaterials=useMemo(()=>[...published].sort((a,b)=>{
    if(a.access!==b.access) return a.access==='paid'?-1:1
    return b.downloads-a.downloads
  }).slice(0,5),[published])
  const featuredMaterial=featuredMaterials[featuredIndex] || featuredMaterials[0]
  const categories=['All',...new Set(published.map(m=>m.category).filter(Boolean))]
  const visible=published.filter(m=>(category==='All'||m.category===category) && `${m.title} ${m.description} ${m.category}`.toLowerCase().includes(query.toLowerCase()))
  useEffect(()=>{if(focusMaterials)setTimeout(()=>document.getElementById('materials')?.scrollIntoView(),0)},[focusMaterials])
  useEffect(()=>{setFeaturedIndex(current=>featuredMaterials.length?current%featuredMaterials.length:0)},[featuredMaterials.length])
  useEffect(()=>{
    if(featuredPaused || featuredMaterials.length<2) return
    const timer=window.setInterval(()=>setFeaturedIndex(current=>(current+1)%featuredMaterials.length),5000)
    return ()=>window.clearInterval(timer)
  },[featuredMaterials.length,featuredPaused])

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

  return <div className="simple-site">
    <header className="simple-header"><div className="simple-container header-inner">
      <Brand/>
      <nav className={menu?'open':''}><a href="#home" onClick={()=>setMenu(false)}>Home</a><a href="#materials" onClick={()=>setMenu(false)}>Materials</a><a href="#about" onClick={()=>setMenu(false)}>About</a><Link to="/admin/login" onClick={()=>setMenu(false)}>Admin login</Link></nav>
      <Link className="simple-btn simple-btn--dark header-admin" to="/admin/login"><LockKeyhole size={16}/> Admin login</Link>
      <button className="mobile-menu" onClick={()=>setMenu(!menu)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button>
    </div></header>

    {notice&&<div className="toast-demo"><CheckCircle2/> {notice}</div>}
    {apiError&&<div className="backend-warning">Backend connection unavailable. Catalogue fallback is visible, but live payments require the Django API.</div>}

    <main>
      <section className="simple-hero" id="home"><div className="simple-container hero-layout">
        <div><span className="eyebrow-simple">LEARN • DOWNLOAD • GROW</span><h1>Learning materials,<br/><em>made simple.</em></h1><p>Browse useful notes and learning resources. Download free materials instantly, or pay once to access premium content.</p><div className="hero-buttons"><a href="#materials" className="simple-btn simple-btn--gold">Browse materials <ArrowRight size={17}/></a><a href="#about" className="plain-link">How it works <ArrowRight size={15}/></a></div></div>
        {featuredMaterial&&<div className="hero-resource-card" onMouseEnter={()=>setFeaturedPaused(true)} onMouseLeave={()=>setFeaturedPaused(false)} onFocus={()=>setFeaturedPaused(true)} onBlur={event=>!event.currentTarget.contains(event.relatedTarget)&&setFeaturedPaused(false)}>
          <div className="hero-card-content" key={featuredMaterial.id}>
            <div className="hero-card-head"><FileText/><span>POPULAR MATERIAL</span></div>
            <h3>{featuredMaterial.title}</h3><p>{featuredMaterial.description}</p>
            <div className="hero-card-meta"><span>{featuredMaterial.type}</span><strong>{featuredMaterial.access==='free'?'Free':money(featuredMaterial.price)}</strong></div>
            <a href="#materials" className="simple-btn simple-btn--light">View material</a>
          </div>
        </div>}
      </div></section>

      <section className="quick-strip"><div className="simple-container quick-grid"><div><strong>{published.length}</strong><span>Learning materials</span></div><div><strong>{published.reduce((a,m)=>a+m.downloads,0).toLocaleString()}+</strong><span>Total downloads</span></div><div><strong>{published.filter(m=>m.access==='free').length}</strong><span>Free resources</span></div><div><strong>{published.filter(m=>m.access==='paid').length}</strong><span>Premium resources</span></div></div></section>

      <section className="materials-section" id="materials"><div className="simple-container">
        <div className="section-heading"><div><span>RESOURCE LIBRARY</span><h2>Find what you need and download it.</h2><p>No courses, no complicated learning path. Just useful content in one clean library.</p></div></div>
        <div className="materials-tools"><div className="material-search"><Search/><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search materials..."/></div><div className="category-pills">{categories.map(c=><button key={c} className={category===c?'active':''} onClick={()=>setCategory(c)}>{c}</button>)}</div></div>
        <div className="materials-grid">{visible.map(m=><MaterialCard key={m.id} material={m} onDownload={()=>downloadFree(m)} onBuy={()=>setCheckout(m)}/>)}</div>
        {!visible.length&&<div className="empty-public"><FolderOpen/><h3>No materials found</h3><p>Try another search or category.</p></div>}
      </div></section>

      <section className="about-simple" id="about"><div className="simple-container about-grid"><div><span className="section-label">HOW IT WORKS</span><h2>Three simple steps.</h2><p>The platform is designed for people who just want to find useful material and get it without unnecessary steps.</p></div><div className="steps-simple"><article><b>1</b><div><h3>Find a material</h3><p>Search or browse the resource library.</p></div></article><article><b>2</b><div><h3>Pay with mobile money</h3><p>Premium materials use a secure MTN or Airtel Flutterwave payment request.</p></div></article><article><b>3</b><div><h3>Download and read</h3><p>The download unlocks only after Flutterwave confirms the payment.</p></div></article></div></div></section>
    </main>
    <footer className="simple-footer"><div className="simple-container"><Brand/><p>Simple learning resources for students, researchers and professionals.</p><span>© 2026 Research Skills.</span></div></footer>
    {checkout&&<CheckoutModal material={checkout} onClose={()=>setCheckout(null)} onPaid={()=>refreshMaterials()}/>} 
  </div>
}

function MaterialCard({material,onDownload,onBuy}){
  return <article className="material-card"><div className="material-card-top"><div className="file-icon"><FileText/></div><span className={`access-badge ${material.access}`}>{material.access==='free'?'FREE':'PREMIUM'}</span></div><div className="material-category">{material.category} • {material.type}</div><h3>{material.title}</h3><p>{material.description}</p><div className="material-card-foot"><div><small>{material.downloads.toLocaleString()} downloads</small><strong>{material.access==='free'?'Free':money(material.price)}</strong></div>{material.access==='free'?<button className="simple-btn simple-btn--dark" onClick={onDownload}><Download size={16}/> Download</button>:<button className="simple-btn simple-btn--gold" onClick={onBuy}><ShoppingBag size={16}/> Buy & download</button>}</div></article>
}

function CheckoutModal({material,onClose,onPaid}){
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
    {stage==='paid'&&<div className="payment-state payment-success"><CheckCircle2/><h3>Payment successful</h3><p>Flutterwave confirmed the payment. Your material is now unlocked.</p>{statusData?.download_url&&<a className="simple-btn simple-btn--gold simple-btn--full" href={statusData.download_url}><Download size={16}/> Download {material.type}</a>}<small className="demo-note">Reference: {statusData?.tx_ref}</small></div>}
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
  return <div className="admin-login-page"><div className="login-brand-row"><Brand/><Link to="/">Back to website</Link></div><div className="login-shell"><section className="login-side"><span>CONTENT OWNER PORTAL</span><h1>Manage your learning materials in one place.</h1><p>Upload content, see what people download, track Flutterwave sales and monitor revenue without using the Django super-admin screen.</p><div className="login-benefits"><span><Upload/> Upload materials</span><span><BarChart3/> See download statistics</span><span><CircleDollarSign/> Track sales and revenue</span></div></section><form className="login-card" onSubmit={submit}><span className="section-label">ADMIN LOGIN</span><h2>Welcome back</h2><p>Sign in with your Django administrator or content-editor account.</p>{error&&<div className="login-error">{error}</div>}<label>Email address<input required type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input required type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button disabled={busy} className="simple-btn simple-btn--dark simple-btn--full">{busy?'Signing in…':'Sign in'} <ArrowRight/></button></form></div></div>
}

function AdminGuard({children}){return localStorage.getItem(ADMIN_ACCESS)?children:<Navigate to="/admin/login" replace/>}

function AdminApp({onMaterialsChanged}){
  const [sidebar,setSidebar]=useState(false)
  const [data,setData]=useState({materials:[],sales:[],overview:{}})
  const [error,setError]=useState('')
  const nav=useNavigate()
  const logout=()=>{localStorage.removeItem(ADMIN_ACCESS);localStorage.removeItem(ADMIN_REFRESH);localStorage.removeItem(ADMIN_USER);nav('/admin/login',{replace:true})}
  const load=async()=>{
    try{
      const [materials,payments,overview]=await Promise.all([
        api('/store/admin/materials/',{auth:true}), api('/store/admin/payments/',{auth:true}), api('/store/admin/overview/',{auth:true})
      ])
      setData({
        materials:(materials||[]).map(materialFromApi),
        sales:(payments||[]).map(p=>({id:p.id,date:new Date(p.created_at).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}),customer:p.customer_name,material:p.material_title,amount:Number(p.amount||0),method:p.network,status:p.status,reference:p.tx_ref})),
        overview,
      });setError('')
    }catch(err){if(String(err.message).includes('401')) logout(); else setError(err.message)}
  }
  useEffect(()=>{load()},[])
  const updateMaterial=async(id,patch)=>{
    if(patch.file instanceof File){
      const fd=new FormData();fd.append('file',patch.file);if(patch.type)fd.append('type',patch.type)
      await api(`/store/admin/materials/${id}/`,{auth:true,method:'PATCH',body:fd})
    }else{
      await api(`/store/admin/materials/${id}/`,{auth:true,method:'PATCH',body:JSON.stringify(patch)})
    }
    await load();onMaterialsChanged?.()
  }
  const deleteMaterial=async id=>{await api(`/store/admin/materials/${id}/`,{auth:true,method:'DELETE'});await load();onMaterialsChanged?.()}
  const addMaterial=async form=>{
    const fd=new FormData();fd.append('title',form.title);fd.append('category',form.category);fd.append('description',form.description);fd.append('type',form.type);fd.append('access',form.access);fd.append('price',form.access==='paid'?form.price||0:0);fd.append('currency','UGX');fd.append('published','true');if(form.file)fd.append('file',form.file)
    await api('/store/admin/materials/',{auth:true,method:'POST',body:fd});await load();onMaterialsChanged?.()
  }
  return <div className="admin-app"><aside className={sidebar?'open':''}><div className="admin-aside-head"><Brand/><button onClick={()=>setSidebar(false)}><X/></button></div><div className="owner-chip"><div>RS</div><span><strong>Content Owner</strong><small>Administrator</small></span></div><nav><AdminNav to="/admin/dashboard" icon={<LayoutDashboard/>}>Overview</AdminNav><AdminNav to="/admin/materials" icon={<FileText/>}>Materials</AdminNav><AdminNav to="/admin/upload" icon={<Upload/>}>Upload material</AdminNav><AdminNav to="/admin/sales" icon={<WalletCards/>}>Sales & revenue</AdminNav></nav><div className="aside-bottom"><Link to="/" target="_blank"><Eye/> View public website</Link><button onClick={logout}><LogOut/> Sign out</button></div></aside><div className="admin-main"><header className="admin-topbar"><button className="admin-menu" onClick={()=>setSidebar(true)}><Menu/></button><div><strong>Content Management</strong><small>Live Django + Flutterwave dashboard</small></div><Link to="/admin/upload" className="simple-btn simple-btn--dark"><Plus/> Add material</Link></header><main className="admin-content">{error&&<div className="login-error">{error}</div>}<Routes><Route path="dashboard" element={<Overview data={data}/>}/><Route path="materials" element={<MaterialsAdmin data={data} updateMaterial={updateMaterial} deleteMaterial={deleteMaterial}/>}/><Route path="upload" element={<UploadMaterial addMaterial={addMaterial}/>}/><Route path="sales" element={<SalesAdmin data={data}/>}/><Route path="*" element={<Navigate to="dashboard" replace/>}/></Routes></main></div></div>
}
function AdminNav({to,icon,children}){return <NavLink to={to} className={({isActive})=>isActive?'active':''}>{icon}<span>{children}</span></NavLink>}

function Overview({data}){
  const overview=data.overview||{}
  const top=[...data.materials].sort((a,b)=>b.downloads-a.downloads).slice(0,5)
  const max=Math.max(...top.map(m=>m.downloads),1)
  const successful=data.sales.filter(s=>s.status==='paid')
  return <div><AdminHeading label="OVERVIEW" title="Store performance" text="Live material, download and Flutterwave payment statistics from Django."/><div className="metric-grid"><Metric icon={<FileText/>} label="Total materials" value={overview.total_materials??data.materials.length} note={`${overview.published_materials??data.materials.filter(m=>m.published).length} published`}/><Metric icon={<Download/>} label="Total downloads" value={Number(overview.total_downloads||0).toLocaleString()} note="Verified file downloads"/><Metric icon={<ShoppingBag/>} label="Successful sales" value={overview.successful_sales??successful.length} note={`${overview.paid_materials??data.materials.filter(m=>m.access==='paid').length} paid materials`}/><Metric icon={<CircleDollarSign/>} label="Total revenue" value={money(overview.revenue||0)} note="Confirmed Flutterwave revenue"/></div><div className="overview-grid"><section className="admin-panel"><div className="panel-head"><div><h3>Most downloaded materials</h3><p>See what your audience is using most.</p></div><Link to="/admin/materials">View all</Link></div><div className="download-bars">{top.map((m,i)=><div className="download-bar" key={m.id}><span className="rank">{i+1}</span><div className="bar-info"><div><strong>{m.title}</strong><small>{m.downloads.toLocaleString()} downloads</small></div><i><b style={{width:`${m.downloads/max*100}%`}}/></i></div></div>)}</div></section><section className="admin-panel"><div className="panel-head"><div><h3>Recent successful sales</h3><p>Latest confirmed premium downloads.</p></div><Link to="/admin/sales">View all</Link></div><div className="recent-sales">{successful.slice(0,5).map(s=><div key={s.id}><span className="sale-icon"><CircleDollarSign/></span><div><strong>{s.material}</strong><small>{s.customer} • {s.method}</small></div><b>{money(s.amount)}</b></div>)}</div></section></div></div>
}
function Metric({icon,label,value,note}){return <article className="metric-card"><span className="metric-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>}
function AdminHeading({label,title,text,action}){return <div className="admin-heading"><div><span>{label}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>}

function MaterialsAdmin({data,updateMaterial,deleteMaterial}){
  const [q,setQ]=useState('');const [filter,setFilter]=useState('all');const [error,setError]=useState('')
  const rows=data.materials.filter(m=>(filter==='all'||m.access===filter)&&`${m.title} ${m.category}`.toLowerCase().includes(q.toLowerCase()))
  const update=async(id,patch)=>{try{setError('');await updateMaterial(id,patch)}catch(err){setError(err.message)}}
  const remove=async m=>{if(!confirm(`Delete ${m.title}?`))return;try{setError('');await deleteMaterial(m.id)}catch(err){setError(err.message)}}
  return <div><AdminHeading label="CONTENT" title="Materials" text="All free and paid learning resources stored by Django." action={<Link to="/admin/upload" className="simple-btn simple-btn--dark"><Plus/> Add material</Link>}/>{error&&<div className="login-error">{error}</div>}<div className="admin-filterbar"><div className="material-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search materials"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All access types</option><option value="free">Free</option><option value="paid">Paid</option></select></div><section className="admin-panel table-panel"><div className="data-table material-table"><div className="data-row data-head"><span>Material</span><span>Access</span><span>Price</span><span>Downloads</span><span>Status</span><span>Actions</span></div>{rows.map(m=><div className="data-row" key={m.id}><span className="material-cell"><i><FileText/></i><span><strong>{m.title}</strong><small>{m.category} • {m.type}</small></span></span><span><em className={`access-pill ${m.access}`}>{m.access}</em></span><span>{m.access==='paid'?money(m.price):'—'}</span><span>{m.downloads.toLocaleString()}</span><span><button className={`status-toggle ${m.published?'on':''}`} onClick={()=>update(m.id,{published:!m.published})}><i/>{m.published?'Published':'Hidden'}</button></span><span className="row-actions"><label className="row-file-action" title={m.file_name?'Replace file':'Upload file'}><Upload/><input type="file" onChange={e=>{const f=e.target.files?.[0];if(f)update(m.id,{file:f,type:(f.name.split('.').pop()||m.type).toUpperCase()})}}/></label><button title="Rename" onClick={()=>{const t=prompt('Material title',m.title);if(t)update(m.id,{title:t})}}><Pencil/></button><button title="Delete" onClick={()=>remove(m)}><Trash2/></button></span></div>)}</div></section></div>
}

function UploadMaterial({addMaterial}){
  const nav=useNavigate();const [saved,setSaved]=useState(false);const [error,setError]=useState('');const [busy,setBusy]=useState(false);const [form,setForm]=useState({title:'',category:'Research',description:'',type:'PDF',access:'free',price:'',file:null})
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  const submit=async e=>{e.preventDefault();setBusy(true);setError('');try{await addMaterial(form);setSaved(true);setTimeout(()=>nav('/admin/materials'),700)}catch(err){setError(err.message)}finally{setBusy(false)}}
  return <div><AdminHeading label="CONTENT" title="Upload a new material" text="Add the real downloadable file and decide whether access is free or paid."/><form className="upload-form admin-panel" onSubmit={submit}>{saved&&<div className="success-message"><CheckCircle2/> Material uploaded successfully.</div>}{error&&<div className="login-error">{error}</div>}<div className="form-two"><label>Material title<input required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Research Methodology Notes"/></label><label>Category<select value={form.category} onChange={e=>set('category',e.target.value)}><option>Research</option><option>Communication</option><option>Data Analysis</option><option>Career</option><option>Other</option></select></label></div><label>Description<textarea required rows="4" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Briefly explain what this material contains..."/></label><div className="upload-zone"><Upload/><strong>Choose the real file to upload</strong><span>PDF, DOCX, PPTX or ZIP</span><input type="file" onChange={e=>set('file',e.target.files?.[0]||null)}/>{form.file&&<b>{form.file.name}</b>}</div><div className="form-two"><label>File type<select value={form.type} onChange={e=>set('type',e.target.value)}><option>PDF</option><option>DOCX</option><option>PPTX</option><option>ZIP</option></select></label><label>Access<select value={form.access} onChange={e=>set('access',e.target.value)}><option value="free">Free download</option><option value="paid">Paid material</option></select></label></div>{form.access==='paid'&&<label>Price (UGX)<input type="number" min="1" required value={form.price} onChange={e=>set('price',e.target.value)} placeholder="15000"/></label>}<div className="form-actions"><Link to="/admin/materials" className="simple-btn simple-btn--outline">Cancel</Link><button disabled={busy} className="simple-btn simple-btn--dark"><Upload/> {busy?'Uploading…':'Publish material'}</button></div></form></div>
}

function SalesAdmin({data}){
  const overview=data.overview||{}
  const successful=data.sales.filter(s=>s.status==='paid')
  const avg=successful.length?successful.reduce((a,s)=>a+s.amount,0)/successful.length:0
  return <div><AdminHeading label="REVENUE" title="Sales & revenue" text="Flutterwave payment records and verified premium-material purchases."/><div className="metric-grid metric-grid--three"><Metric icon={<CircleDollarSign/>} label="Total revenue" value={money(overview.revenue||0)} note="Verified successful payments"/><Metric icon={<ShoppingBag/>} label="Successful sales" value={successful.length} note={`${data.sales.filter(s=>s.status==='pending').length} pending`}/><Metric icon={<TrendingUp/>} label="Average sale" value={money(Math.round(avg))} note="Per successful transaction"/></div><section className="admin-panel table-panel"><div className="panel-head"><div><h3>Payment history</h3><p>Successful, pending and failed Flutterwave transactions.</p></div></div><div className="data-table sales-table"><div className="data-row data-head"><span>Date</span><span>Customer</span><span>Material</span><span>Method / status</span><span>Amount</span></div>{data.sales.map(s=><div className="data-row" key={s.id}><span>{s.date}</span><span>{s.customer}</span><span><strong>{s.material}</strong></span><span>{s.method} • {s.status}</span><span className={s.status==='paid'?'sale-amount':''}>{money(s.amount)}</span></div>)}</div></section></div>
}
