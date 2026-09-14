import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
export default function Breadcrumbs({items=[]}){return <nav className="breadcrumbs" aria-label="Breadcrumb">{items.map((item,i)=><span key={`${item.label}-${i}`}>{item.to?<Link to={item.to}>{item.label}</Link>:<strong aria-current="page">{item.label}</strong>}{i<items.length-1&&<ChevronRight size={14}/>}</span>)}</nav>}
