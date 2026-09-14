import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import Logo from './Logo'
import { useAuth } from '../context/AuthContext'

export default function PublicHeader(){
 const [open,setOpen]=useState(false)
 const {user}=useAuth()
 const close=()=>setOpen(false)
 return <header className="public-header public-header--human"><div className="public-header__inner container">
   <Link to="/" onClick={close}><Logo/></Link>
   <nav className={`public-nav ${open?'is-open':''}`}>
     <a href="#products" onClick={close}>Products</a>
     <a href="#method" onClick={close}>How it works</a>
     <a href="#inside" onClick={close}>Inside the platform</a>
     <a href="#access" onClick={close}>Access</a>
     <a href="#about" onClick={close}>About</a>
     <a href="#contact" onClick={close}>Contact</a>
   </nav>
   <div className="public-actions">{user?
     <Link className="button button--primary hide-mobile" to="/dashboard">Open dashboard</Link>:
     <><Link className="text-link hide-mobile" to="/login">Sign in</Link><Link className="button button--primary hide-mobile" to="/register">Create account</Link></>}
     <button className="icon-button menu-button" aria-label="Toggle menu" onClick={()=>setOpen(!open)}>{open?<X/>:<Menu/>}</button>
   </div>
 </div></header>
}
