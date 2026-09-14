import { useEffect, useRef, useState } from 'react'
import { NavLink, Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { LayoutDashboard, GraduationCap, MessageSquareText, PenTool, Bookmark, LogOut, Bell, Search, ShieldCheck, UserRound, Menu, X, CheckCheck, BookOpen, FileText, ChevronRight } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../context/ToastContext'
import { api } from '../lib/api'

const links=[
 ['Home','/dashboard',LayoutDashboard],
 ['Research','/courses/research-blueprint',GraduationCap],
 ['Communication','/courses/business-communication-toolkit',MessageSquareText],
 ['Builders','/builder',PenTool],
 ['Resources','/resources',Bookmark],
 ['Profile','/profile',UserRound],
]

export default function AppShell(){
 const {user,logout,refreshUser}=useAuth(); const {toast}=useToast(); const location=useLocation(); const nav=useNavigate()
 const [drawer,setDrawer]=useState(false); const [query,setQuery]=useState(''); const [search,setSearch]=useState(null); const [searchOpen,setSearchOpen]=useState(false)
 const [notifications,setNotifications]=useState([]); const [noticeOpen,setNoticeOpen]=useState(false); const searchRef=useRef(null); const searchInputRef=useRef(null)
 const initials=(user?.name||user?.email||'U').split(' ').map(x=>x[0]).slice(0,2).join('').toUpperCase()
 const unread=notifications.filter(n=>!n.is_read).length

 useEffect(()=>{setDrawer(false);setSearchOpen(false);setNoticeOpen(false)},[location.pathname])
 useEffect(()=>{const load=()=>api('/notifications/').then(setNotifications).catch(()=>{});load();const id=setInterval(load,45000);return()=>clearInterval(id)},[])
 useEffect(()=>{api('/notifications/').then(setNotifications).catch(()=>{})},[location.pathname])
 useEffect(()=>{if(query.trim().length<2){setSearch(null);return}const id=setTimeout(()=>api(`/search/?q=${encodeURIComponent(query.trim())}`).then(r=>{setSearch(r);setSearchOpen(true)}).catch(()=>{}),250);return()=>clearTimeout(id)},[query])
 useEffect(()=>{const onKey=e=>{if(e.key==='Escape'){setSearchOpen(false);setNoticeOpen(false);setDrawer(false)}if((e.metaKey||e.ctrlKey)&&e.key.toLowerCase()==='k'){e.preventDefault();searchInputRef.current?.focus();setSearchOpen(true)}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey)},[])

 const markAll=async()=>{await api('/notifications/read/',{method:'POST',body:'{}'});setNotifications(v=>v.map(n=>({...n,is_read:true})))}
 const markOne=async n=>{if(!n.is_read){api(`/notifications/${n.id}/read/`,{method:'POST',body:'{}'}).catch(()=>{});setNotifications(v=>v.map(x=>x.id===n.id?{...x,is_read:true}:x))}setNoticeOpen(false);if(n.link)nav(n.link)}
 const resend=async()=>{try{const r=await api('/auth/verify-email/resend/',{method:'POST',body:'{}'});toast(r.detail,'info');await refreshUser()}catch(e){toast(e.message,'error')}}
 const searchCount=search?['courses','lessons','resources','builders'].reduce((n,k)=>n+(search[k]?.length||0),0):0

 return <div className="app-shell">
   <button className={`sidebar-scrim ${drawer?'show':''}`} aria-label="Close menu" onClick={()=>setDrawer(false)}/>
   <aside className={`sidebar ${drawer?'sidebar--open':''}`} aria-label="Main navigation">
     <div className="sidebar-mobile-head"><Link to="/" className="sidebar-brand"><Logo light/></Link><button onClick={()=>setDrawer(false)} aria-label="Close menu"><X/></button></div>
     <Link to="/" className="sidebar-brand sidebar-brand--desktop"><Logo light/></Link>
     <div className="sidebar-label">LEARNING SPACE</div>
     <nav className="sidebar-nav">{links.map(([label,to,Icon])=><NavLink key={to} to={to} className={({isActive})=>isActive?'active':''}><Icon size={19}/><span>{label}</span></NavLink>)}</nav>
     <div className="sidebar-spacer"/>
     {['admin','editor'].includes(user?.role)&&<NavLink to="/admin" className="sidebar-admin"><ShieldCheck size={18}/>Admin console</NavLink>}
     <div className="sidebar-bottom"><button onClick={logout}><LogOut size={18}/>Sign out</button></div>
   </aside>
   <main className="app-main">
     <header className="app-topbar">
       <button className="mobile-menu-button" onClick={()=>setDrawer(true)} aria-label="Open menu"><Menu/></button>
       <div className="top-search-wrap" ref={searchRef}>
         <div className="top-search"><Search size={18}/><input ref={searchInputRef} aria-label="Search learning space" value={query} onFocus={()=>query.length>=2&&setSearchOpen(true)} onChange={e=>setQuery(e.target.value)} placeholder="Search lessons or resources"/><kbd>⌘K</kbd></div>
         {searchOpen&&query.trim().length>=2&&<div className="search-popover" role="dialog" aria-label="Search results">
           <div className="search-popover-head"><span>Search results</span><button onClick={()=>setSearchOpen(false)} aria-label="Close search"><X size={16}/></button></div>
           {!search?<div className="search-empty">Searching…</div>:searchCount===0?<div className="search-empty"><strong>No matches found.</strong><span>Try a shorter phrase such as “problem”, “literature” or “writing”.</span></div>:<>
             <SearchGroup title="Lessons" icon={<BookOpen/>} items={search.lessons} makeTo={x=>`/lessons/${x.slug}`} detail={x=>x.course}/>
             <SearchGroup title="Resources" icon={<FileText/>} items={search.resources} makeTo={x=>`/resources/${x.slug}`} detail={x=>x.access==='paid'?(x.unlocked?'Unlocked':'Premium'):'Free'}/>
             <SearchGroup title="Courses" icon={<GraduationCap/>} items={search.courses} makeTo={x=>`/courses/${x.slug}`} detail={x=>x.subtitle}/>
             <SearchGroup title="Builders" icon={<PenTool/>} items={search.builders} makeTo={x=>`/builders/${x.slug}`} detail={()=> 'Guided workspace'}/>
           </>}
         </div>}
       </div>
       <div className="top-actions">
         <div className="notification-wrap"><button className="notification" onClick={()=>setNoticeOpen(v=>!v)} aria-label={`Notifications${unread?`, ${unread} unread`:''}`}><Bell size={19}/>{unread>0&&<i>{unread>9?'9+':unread}</i>}</button>{noticeOpen&&<div className="notification-panel"><div className="notification-head"><div><strong>Notifications</strong><span>{unread?`${unread} unread`:'You’re all caught up'}</span></div>{unread>0&&<button onClick={markAll}><CheckCheck size={16}/>Mark all read</button>}</div>{notifications.length?<div className="notification-list">{notifications.slice(0,8).map(n=><button key={n.id} className={!n.is_read?'unread':''} onClick={()=>markOne(n)}><span className={`notice-dot notice-dot--${n.kind}`}/><div><strong>{n.title}</strong><p>{n.message}</p><small>{new Date(n.created_at).toLocaleDateString()}</small></div><ChevronRight size={16}/></button>)}</div>:<div className="notification-empty">Nothing new right now.</div>}</div>}</div>
         <Link to="/profile" className="user-pill"><div className="avatar">{user?.avatar_url?<img src={user.avatar_url} alt=""/>:initials}</div><div><strong>{user?.name||user?.email}</strong><small>{user?.role==='admin'?'Administrator':user?.role==='editor'?'Content Editor':'Learner'}</small></div></Link>
       </div>
     </header>
     <div className="app-content">
       {!user?.email_verified&&<div className="verify-banner"><div><strong>Verify your email</strong><span>Confirming your email helps protect your account and recovery options.</span></div><button onClick={resend}>Resend email</button></div>}
       <Outlet/>
     </div>
   </main>
 </div>
}

function SearchGroup({title,icon,items=[],makeTo,detail}){if(!items?.length)return null;return <div className="search-group"><span className="search-group-title">{icon}{title}</span>{items.map(x=><Link key={`${title}-${x.slug}`} to={makeTo(x)}><div><strong>{x.title}</strong><small>{detail(x)}</small></div><ChevronRight size={16}/></Link>)}</div>}
