import { useEffect, useState } from 'react'
import { Routes, Route, Navigate, Link, NavLink, useNavigate } from 'react-router-dom'
import {
  ArrowRight, BarChart3, BookOpen, CircleDollarSign, Download, FileText, FolderOpen,
  LayoutDashboard, LockKeyhole, LogOut, Menu, Plus, Search, ShoppingBag, Upload,
  WalletCards, X, CheckCircle2, Eye, Trash2, Pencil, TrendingUp
} from 'lucide-react'

const DEMO_ADMIN = { email: 'admin@researchskills.com', password: 'admin123' }
const STORAGE_KEY = 'simple-learning-demo-data-v1'
const ADMIN_SESSION = 'simple-learning-admin-session'

const seedMaterials = [
  {id:1,title:'Research Proposal Writing Guide',category:'Research',description:'A clear guide to choosing a topic, developing objectives and structuring a research proposal.',type:'PDF',access:'free',price:0,downloads:324,published:true,updated:'12 Sep 2026'},
  {id:2,title:'Chapter One Notes',category:'Research',description:'Practical notes on background, problem statement, objectives, questions, scope and significance.',type:'PDF',access:'paid',price:15000,downloads:186,published:true,updated:'10 Sep 2026'},
  {id:3,title:'Literature Review Made Simple',category:'Research',description:'How to search, organize, compare and synthesize literature without turning the chapter into summaries.',type:'PDF',access:'paid',price:20000,downloads:142,published:true,updated:'08 Sep 2026'},
  {id:4,title:'Business Communication Notes',category:'Communication',description:'Professional writing, email etiquette, meetings, presentations and workplace communication essentials.',type:'PDF',access:'free',price:0,downloads:271,published:true,updated:'05 Sep 2026'},
  {id:5,title:'Data Collection Methods Guide',category:'Research',description:'A concise comparison of questionnaires, interviews, observation and document review.',type:'PDF',access:'paid',price:12000,downloads:93,published:true,updated:'30 Aug 2026'},
  {id:6,title:'Presentation Skills Checklist',category:'Communication',description:'A one-page preparation checklist for confident academic and professional presentations.',type:'DOCX',access:'free',price:0,downloads:199,published:true,updated:'28 Aug 2026'},
  {id:7,title:'Basic Statistics for Research',category:'Data Analysis',description:'Beginner-friendly notes on descriptive statistics, interpretation and presenting findings.',type:'PDF',access:'paid',price:18000,downloads:76,published:true,updated:'22 Aug 2026'},
]

const seedSales = [
  {id:101,date:'16 Sep 2026',customer:'Amina K.',material:'Chapter One Notes',amount:15000,method:'MTN MoMo'},
  {id:102,date:'16 Sep 2026',customer:'Peter M.',material:'Literature Review Made Simple',amount:20000,method:'Airtel Money'},
  {id:103,date:'15 Sep 2026',customer:'Joan N.',material:'Basic Statistics for Research',amount:18000,method:'MTN MoMo'},
  {id:104,date:'15 Sep 2026',customer:'David O.',material:'Data Collection Methods Guide',amount:12000,method:'Airtel Money'},
  {id:105,date:'14 Sep 2026',customer:'Sarah A.',material:'Chapter One Notes',amount:15000,method:'MTN MoMo'},
  {id:106,date:'13 Sep 2026',customer:'Mark T.',material:'Literature Review Made Simple',amount:20000,method:'MTN MoMo'},
]

function loadDemo(){
  try{
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null')
    if(parsed?.materials && parsed?.sales) return parsed
  }catch{}
  return {materials: seedMaterials, sales: seedSales, historicalRevenue: 5690000}
}
function saveDemo(data){ localStorage.setItem(STORAGE_KEY, JSON.stringify(data)) }
function money(v){ return `UGX ${Number(v||0).toLocaleString()}` }
function todayLabel(){ return new Date().toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'}) }

export default function App(){
  const [data,setData] = useState(loadDemo)
  useEffect(()=>saveDemo(data),[data])
  const updateMaterial = (id,patch)=>setData(d=>({...d,materials:d.materials.map(m=>m.id===id?{...m,...patch}:m)}))
  const deleteMaterial = id=>setData(d=>({...d,materials:d.materials.filter(m=>m.id!==id)}))
  const addMaterial = material=>setData(d=>({...d,materials:[{...material,id:Date.now(),downloads:0,published:true,updated:todayLabel()},...d.materials]}))
  const recordDownload = (id)=>setData(d=>({...d,materials:d.materials.map(m=>m.id===id?{...m,downloads:m.downloads+1}:m)}))
  const recordSale = (material, method, customer='Demo customer')=>setData(d=>({
    ...d,
    materials:d.materials.map(m=>m.id===material.id?{...m,downloads:m.downloads+1}:m),
    sales:[{id:Date.now(),date:todayLabel(),customer,material:material.title,amount:material.price,method},...d.sales]
  }))
  const resetDemo=()=>setData({materials:seedMaterials,sales:seedSales,historicalRevenue:5690000})

  return <Routes>
    <Route path="/" element={<PublicHome materials={data.materials} onDownload={recordDownload} onSale={recordSale}/>}/>
    <Route path="/materials" element={<PublicHome materials={data.materials} onDownload={recordDownload} onSale={recordSale} focusMaterials/>}/>
    <Route path="/admin/login" element={<AdminLogin/>}/>
    <Route path="/admin/*" element={<AdminGuard><AdminApp data={data} addMaterial={addMaterial} updateMaterial={updateMaterial} deleteMaterial={deleteMaterial} resetDemo={resetDemo}/></AdminGuard>}/>
    <Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes>
}

function Brand(){
  return <Link to="/" className="simple-brand"><span><BookOpen size={23}/></span><div><strong>Research Skills</strong><small>Learning Resources</small></div></Link>
}

function PublicHome({materials,onDownload,onSale,focusMaterials=false}){
  const [menu,setMenu]=useState(false)
  const [query,setQuery]=useState('')
  const [category,setCategory]=useState('All')
  const [checkout,setCheckout]=useState(null)
  const [notice,setNotice]=useState('')
  const [featuredIndex,setFeaturedIndex]=useState(0)
  const [featuredPaused,setFeaturedPaused]=useState(false)
  const published=materials.filter(m=>m.published)
  const featuredMaterials=[...published].sort((a,b)=>{
    if(a.access!==b.access) return a.access==='paid'?-1:1
    return b.downloads-a.downloads
  }).slice(0,5)
  const featuredMaterial=featuredMaterials[featuredIndex] || featuredMaterials[0]
  const categories=['All',...new Set(published.map(m=>m.category))]
  const visible=published.filter(m=>(category==='All'||m.category===category) && `${m.title} ${m.description} ${m.category}`.toLowerCase().includes(query.toLowerCase()))
  useEffect(()=>{if(focusMaterials)setTimeout(()=>document.getElementById('materials')?.scrollIntoView(),0)},[focusMaterials])
  useEffect(()=>{
    setFeaturedIndex(current=>featuredMaterials.length?current%featuredMaterials.length:0)
  },[featuredMaterials.length])
  useEffect(()=>{
    if(featuredPaused || featuredMaterials.length<2) return
    const timer=window.setInterval(()=>setFeaturedIndex(current=>(current+1)%featuredMaterials.length),5000)
    return ()=>window.clearInterval(timer)
  },[featuredMaterials.length,featuredPaused])

  const downloadFree=(m)=>{
    onDownload(m.id)
    demoFile(m)
    setNotice(`${m.title} download started.`)
    setTimeout(()=>setNotice(''),2800)
  }
  const paidComplete=(m,method,customer)=>{
    onSale(m,method,customer)
    demoFile(m)
    setCheckout(null)
    setNotice(`Demo payment successful. ${m.title} download started.`)
    setTimeout(()=>setNotice(''),3200)
  }

  return <div className="simple-site">
    <header className="simple-header"><div className="simple-container header-inner">
      <Brand/>
      <nav className={menu?'open':''}><a href="#home" onClick={()=>setMenu(false)}>Home</a><a href="#materials" onClick={()=>setMenu(false)}>Materials</a><a href="#about" onClick={()=>setMenu(false)}>About</a><Link to="/admin/login" onClick={()=>setMenu(false)}>Admin login</Link></nav>
      <Link className="simple-btn simple-btn--dark header-admin" to="/admin/login"><LockKeyhole size={16}/> Admin login</Link>
      <button className="mobile-menu" onClick={()=>setMenu(!menu)} aria-label="Toggle menu">{menu?<X/>:<Menu/>}</button>
    </div></header>

    {notice&&<div className="toast-demo"><CheckCircle2/> {notice}</div>}

    <main>
      <section className="simple-hero" id="home"><div className="simple-container hero-layout">
        <div><span className="eyebrow-simple">LEARN • DOWNLOAD • GROW</span><h1>Learning materials,<br/><em>made simple.</em></h1><p>Browse useful notes and learning resources. Download free materials instantly, or pay once to access premium content.</p><div className="hero-buttons"><a href="#materials" className="simple-btn simple-btn--gold">Browse materials <ArrowRight size={17}/></a><a href="#about" className="plain-link">How it works <ArrowRight size={15}/></a></div></div>
        {featuredMaterial&&<div className="hero-resource-card" onMouseEnter={()=>setFeaturedPaused(true)} onMouseLeave={()=>setFeaturedPaused(false)} onFocus={()=>setFeaturedPaused(true)} onBlur={event=>!event.currentTarget.contains(event.relatedTarget)&&setFeaturedPaused(false)}>
          <div className="hero-card-content" key={featuredMaterial.id}>
            <div className="hero-card-head"><FileText/><span>POPULAR MATERIAL</span></div>
            <h3>{featuredMaterial.title}</h3>
            <p>{featuredMaterial.description}</p>
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

      <section className="about-simple" id="about"><div className="simple-container about-grid"><div><span className="section-label">HOW IT WORKS</span><h2>Three simple steps.</h2><p>The platform is designed for people who just want to find useful material and get it without unnecessary steps.</p></div><div className="steps-simple"><article><b>1</b><div><h3>Find a material</h3><p>Search or browse the resource library.</p></div></article><article><b>2</b><div><h3>Free or premium</h3><p>Free materials download immediately. Premium materials show the price clearly.</p></div></article><article><b>3</b><div><h3>Download and read</h3><p>After payment, the purchased material becomes available for download.</p></div></article></div></div></section>
    </main>
    <footer className="simple-footer"><div className="simple-container"><Brand/><p>Simple learning resources for students, researchers and professionals.</p><span>© 2026 Research Skills. Demo frontend.</span></div></footer>
    {checkout&&<CheckoutModal material={checkout} onClose={()=>setCheckout(null)} onComplete={paidComplete}/>} 
  </div>
}

function MaterialCard({material,onDownload,onBuy}){
  return <article className="material-card"><div className="material-card-top"><div className="file-icon"><FileText/></div><span className={`access-badge ${material.access}`}>{material.access==='free'?'FREE':'PREMIUM'}</span></div><div className="material-category">{material.category} • {material.type}</div><h3>{material.title}</h3><p>{material.description}</p><div className="material-card-foot"><div><small>{material.downloads.toLocaleString()} downloads</small><strong>{material.access==='free'?'Free':money(material.price)}</strong></div>{material.access==='free'?<button className="simple-btn simple-btn--dark" onClick={onDownload}><Download size={16}/> Download</button>:<button className="simple-btn simple-btn--gold" onClick={onBuy}><ShoppingBag size={16}/> Buy & download</button>}</div></article>
}

function CheckoutModal({material,onClose,onComplete}){
  const [method,setMethod]=useState('MTN MoMo')
  const [phone,setPhone]=useState('')
  const [name,setName]=useState('')
  return <div className="modal-backdrop" onMouseDown={e=>e.target===e.currentTarget&&onClose()}><div className="checkout-modal"><button className="modal-close" onClick={onClose}><X/></button><span className="section-label">DEMO CHECKOUT</span><h2>{material.title}</h2><p>Pay once and download the material immediately.</p><div className="checkout-price">{money(material.price)}</div><label>Your name<input value={name} onChange={e=>setName(e.target.value)} placeholder="e.g. Sarah Namusoke"/></label><label>Payment method<select value={method} onChange={e=>setMethod(e.target.value)}><option>MTN MoMo</option><option>Airtel Money</option><option>Card</option></select></label>{method!=='Card'&&<label>Phone number<input value={phone} onChange={e=>setPhone(e.target.value)} placeholder="07xx xxx xxx"/></label>}<button className="simple-btn simple-btn--gold simple-btn--full" onClick={()=>onComplete(material,method,name||'Demo customer')}>Complete demo payment <ArrowRight/></button><small className="demo-note">Prototype only — no real money is collected.</small></div></div>
}

function demoFile(material){
  const text=`${material.title}\n\n${material.description}\n\nThis is a demonstration download generated by the frontend prototype.\nIn the production system this button will deliver the actual uploaded ${material.type} file.`
  const blob=new Blob([text],{type:'text/plain'})
  const url=URL.createObjectURL(blob)
  const a=document.createElement('a');a.href=url;a.download=`${material.title.replace(/[^a-z0-9]+/gi,'-').replace(/^-|-$/g,'')}-DEMO.txt`;document.body.appendChild(a);a.click();a.remove();URL.revokeObjectURL(url)
}

function AdminLogin(){
  const nav=useNavigate(); const [email,setEmail]=useState(DEMO_ADMIN.email); const [password,setPassword]=useState(DEMO_ADMIN.password); const [error,setError]=useState('')
  const submit=e=>{e.preventDefault();if(email===DEMO_ADMIN.email&&password===DEMO_ADMIN.password){localStorage.setItem(ADMIN_SESSION,'1');nav('/admin/dashboard',{replace:true})}else setError('Incorrect demo email or password.')}
  return <div className="admin-login-page"><div className="login-brand-row"><Brand/><Link to="/">Back to website</Link></div><div className="login-shell"><section className="login-side"><span>CONTENT OWNER PORTAL</span><h1>Manage your learning materials in one place.</h1><p>Upload content, see what people download, track paid materials and monitor revenue without using the Django super-admin screen.</p><div className="login-benefits"><span><Upload/> Upload materials</span><span><BarChart3/> See download statistics</span><span><CircleDollarSign/> Track sales and revenue</span></div></section><form className="login-card" onSubmit={submit}><span className="section-label">ADMIN LOGIN</span><h2>Welcome back</h2><p>Sign in to manage the resource library.</p>{error&&<div className="login-error">{error}</div>}<label>Email address<input type="email" value={email} onChange={e=>setEmail(e.target.value)}/></label><label>Password<input type="password" value={password} onChange={e=>setPassword(e.target.value)}/></label><button className="simple-btn simple-btn--dark simple-btn--full">Sign in <ArrowRight/></button><div className="demo-credentials"><strong>Demo credentials</strong><span>{DEMO_ADMIN.email}</span><span>{DEMO_ADMIN.password}</span></div></form></div></div>
}

function AdminGuard({children}){
  return localStorage.getItem(ADMIN_SESSION)==='1'?children:<Navigate to="/admin/login" replace/>
}

function AdminApp({data,addMaterial,updateMaterial,deleteMaterial,resetDemo}){
  const [sidebar,setSidebar]=useState(false)
  const nav=useNavigate()
  const logout=()=>{localStorage.removeItem(ADMIN_SESSION);nav('/admin/login',{replace:true})}
  return <div className="admin-app"><aside className={sidebar?'open':''}><div className="admin-aside-head"><Brand/><button onClick={()=>setSidebar(false)}><X/></button></div><div className="owner-chip"><div>RS</div><span><strong>Content Owner</strong><small>Administrator</small></span></div><nav><AdminNav to="/admin/dashboard" icon={<LayoutDashboard/>}>Overview</AdminNav><AdminNav to="/admin/materials" icon={<FileText/>}>Materials</AdminNav><AdminNav to="/admin/upload" icon={<Upload/>}>Upload material</AdminNav><AdminNav to="/admin/sales" icon={<WalletCards/>}>Sales & revenue</AdminNav></nav><div className="aside-bottom"><Link to="/" target="_blank"><Eye/> View public website</Link><button onClick={logout}><LogOut/> Sign out</button></div></aside><div className="admin-main"><header className="admin-topbar"><button className="admin-menu" onClick={()=>setSidebar(true)}><Menu/></button><div><strong>Content Management</strong><small>Simple admin dashboard</small></div><Link to="/admin/upload" className="simple-btn simple-btn--dark"><Plus/> Add material</Link></header><main className="admin-content"><Routes><Route path="dashboard" element={<Overview data={data}/>}/><Route path="materials" element={<MaterialsAdmin data={data} updateMaterial={updateMaterial} deleteMaterial={deleteMaterial}/>}/><Route path="upload" element={<UploadMaterial addMaterial={addMaterial}/>}/><Route path="sales" element={<SalesAdmin data={data}/>}/><Route path="*" element={<Navigate to="dashboard" replace/>}/></Routes><button className="reset-demo" onClick={resetDemo}>Reset demo data</button></main></div></div>
}
function AdminNav({to,icon,children}){return <NavLink to={to} onClick={()=>{}} className={({isActive})=>isActive?'active':''}>{icon}<span>{children}</span></NavLink>}

function Overview({data}){
  const totalDownloads=data.materials.reduce((a,m)=>a+m.downloads,0)
  const revenue=data.historicalRevenue+data.sales.reduce((a,s)=>a+s.amount,0)
  const paid=data.materials.filter(m=>m.access==='paid')
  const top=[...data.materials].sort((a,b)=>b.downloads-a.downloads).slice(0,5)
  const max=Math.max(...top.map(m=>m.downloads),1)
  return <div><AdminHeading label="OVERVIEW" title="Good morning 👋" text="Here is a simple view of how your learning materials are performing."/><div className="metric-grid"><Metric icon={<FileText/>} label="Total materials" value={data.materials.length} note={`${data.materials.filter(m=>m.published).length} published`}/><Metric icon={<Download/>} label="Total downloads" value={totalDownloads.toLocaleString()} note="Across all materials"/><Metric icon={<ShoppingBag/>} label="Paid materials" value={paid.length} note={`${data.sales.length} recent sales recorded`}/><Metric icon={<CircleDollarSign/>} label="Total revenue" value={money(revenue)} note="Demo accumulated revenue"/></div><div className="overview-grid"><section className="admin-panel"><div className="panel-head"><div><h3>Most downloaded materials</h3><p>See what your audience is using most.</p></div><Link to="/admin/materials">View all</Link></div><div className="download-bars">{top.map((m,i)=><div className="download-bar" key={m.id}><span className="rank">{i+1}</span><div className="bar-info"><div><strong>{m.title}</strong><small>{m.downloads.toLocaleString()} downloads</small></div><i><b style={{width:`${m.downloads/max*100}%`}}/></i></div></div>)}</div></section><section className="admin-panel"><div className="panel-head"><div><h3>Recent sales</h3><p>Latest premium downloads.</p></div><Link to="/admin/sales">View all</Link></div><div className="recent-sales">{data.sales.slice(0,5).map(s=><div key={s.id}><span className="sale-icon"><CircleDollarSign/></span><div><strong>{s.material}</strong><small>{s.customer} • {s.method}</small></div><b>{money(s.amount)}</b></div>)}</div></section></div>
  </div>
}
function Metric({icon,label,value,note}){return <article className="metric-card"><span className="metric-icon">{icon}</span><div><small>{label}</small><strong>{value}</strong><p>{note}</p></div></article>}
function AdminHeading({label,title,text,action}){return <div className="admin-heading"><div><span>{label}</span><h1>{title}</h1><p>{text}</p></div>{action}</div>}

function MaterialsAdmin({data,updateMaterial,deleteMaterial}){
  const [q,setQ]=useState('');const [filter,setFilter]=useState('all')
  const rows=data.materials.filter(m=>(filter==='all'||m.access===filter)&&`${m.title} ${m.category}`.toLowerCase().includes(q.toLowerCase()))
  return <div><AdminHeading label="CONTENT" title="Materials" text="All free and paid learning resources in one place." action={<Link to="/admin/upload" className="simple-btn simple-btn--dark"><Plus/> Add material</Link>}/><div className="admin-filterbar"><div className="material-search"><Search/><input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search materials"/></div><select value={filter} onChange={e=>setFilter(e.target.value)}><option value="all">All access types</option><option value="free">Free</option><option value="paid">Paid</option></select></div><section className="admin-panel table-panel"><div className="data-table material-table"><div className="data-row data-head"><span>Material</span><span>Access</span><span>Price</span><span>Downloads</span><span>Status</span><span>Actions</span></div>{rows.map(m=><div className="data-row" key={m.id}><span className="material-cell"><i><FileText/></i><span><strong>{m.title}</strong><small>{m.category} • {m.type}</small></span></span><span><em className={`access-pill ${m.access}`}>{m.access}</em></span><span>{m.access==='paid'?money(m.price):'—'}</span><span>{m.downloads.toLocaleString()}</span><span><button className={`status-toggle ${m.published?'on':''}`} onClick={()=>updateMaterial(m.id,{published:!m.published})}><i/>{m.published?'Published':'Hidden'}</button></span><span className="row-actions"><button title="Edit demo" onClick={()=>{const t=prompt('Material title',m.title);if(t)updateMaterial(m.id,{title:t,updated:todayLabel()})}}><Pencil/></button><button title="Delete" onClick={()=>confirm(`Delete ${m.title}?`)&&deleteMaterial(m.id)}><Trash2/></button></span></div>)}</div></section></div>
}

function UploadMaterial({addMaterial}){
  const nav=useNavigate();const [saved,setSaved]=useState(false);const [form,setForm]=useState({title:'',category:'Research',description:'',type:'PDF',access:'free',price:'',fileName:''})
  const set=(k,v)=>setForm(f=>({...f,[k]:v}))
  const submit=e=>{e.preventDefault();addMaterial({...form,price:form.access==='paid'?Number(form.price||0):0,fileName:form.fileName||'uploaded-material.pdf'});setSaved(true);setTimeout(()=>nav('/admin/materials'),800)}
  return <div><AdminHeading label="CONTENT" title="Upload a new material" text="Add a note, guide, handout or any resource you want learners to access."/><form className="upload-form admin-panel" onSubmit={submit}>{saved&&<div className="success-message"><CheckCircle2/> Material added to the demo library.</div>}<div className="form-two"><label>Material title<input required value={form.title} onChange={e=>set('title',e.target.value)} placeholder="e.g. Research Methodology Notes"/></label><label>Category<select value={form.category} onChange={e=>set('category',e.target.value)}><option>Research</option><option>Communication</option><option>Data Analysis</option><option>Career</option><option>Other</option></select></label></div><label>Description<textarea required rows="4" value={form.description} onChange={e=>set('description',e.target.value)} placeholder="Briefly explain what this material contains..."/></label><div className="upload-zone"><Upload/><strong>Choose a file to upload</strong><span>PDF, DOCX, PPTX or ZIP • Demo stores the filename only</span><input type="file" onChange={e=>set('fileName',e.target.files?.[0]?.name||'')}/>{form.fileName&&<b>{form.fileName}</b>}</div><div className="form-two"><label>File type<select value={form.type} onChange={e=>set('type',e.target.value)}><option>PDF</option><option>DOCX</option><option>PPTX</option><option>ZIP</option></select></label><label>Access<select value={form.access} onChange={e=>set('access',e.target.value)}><option value="free">Free download</option><option value="paid">Paid material</option></select></label></div>{form.access==='paid'&&<label>Price (UGX)<input type="number" min="0" required value={form.price} onChange={e=>set('price',e.target.value)} placeholder="15000"/></label>}<div className="form-actions"><Link to="/admin/materials" className="simple-btn simple-btn--outline">Cancel</Link><button className="simple-btn simple-btn--dark"><Upload/> Publish material</button></div></form></div>
}

function SalesAdmin({data}){
  const revenue=data.historicalRevenue+data.sales.reduce((a,s)=>a+s.amount,0)
  const avg=data.sales.length?data.sales.reduce((a,s)=>a+s.amount,0)/data.sales.length:0
  return <div><AdminHeading label="REVENUE" title="Sales & revenue" text="See which paid materials are selling and how much has been collected."/><div className="metric-grid metric-grid--three"><Metric icon={<CircleDollarSign/>} label="Total revenue" value={money(revenue)} note="Demo accumulated revenue"/><Metric icon={<ShoppingBag/>} label="Recent paid downloads" value={data.sales.length} note="Transactions in demo data"/><Metric icon={<TrendingUp/>} label="Average recent sale" value={money(Math.round(avg))} note="Per premium transaction"/></div><section className="admin-panel table-panel"><div className="panel-head"><div><h3>Payment history</h3><p>Recent successful premium-material purchases.</p></div></div><div className="data-table sales-table"><div className="data-row data-head"><span>Date</span><span>Customer</span><span>Material</span><span>Method</span><span>Amount</span></div>{data.sales.map(s=><div className="data-row" key={s.id}><span>{s.date}</span><span>{s.customer}</span><span><strong>{s.material}</strong></span><span>{s.method}</span><span className="sale-amount">{money(s.amount)}</span></div>)}</div></section></div>
}
