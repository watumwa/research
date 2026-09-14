import { Link } from 'react-router-dom'
import { ArrowRight, BookOpenText, FilePenLine, Layers3 } from 'lucide-react'
import Breadcrumbs from '../components/Breadcrumbs'
const builders=[
 {slug:'research-problem',icon:FilePenLine,title:'Research Problem Builder',tag:'FOUNDATIONS',text:'Move from the source of a problem to a specific, evidence-backed problem statement and significance statement.'},
 {slug:'chapter-one',icon:Layers3,title:'Chapter One Builder',tag:'CHAPTER ONE',text:'Organise background, problem statement, purpose, objectives, questions, scope, significance, framework and research gap.'},
 {slug:'literature-review',icon:BookOpenText,title:'Literature Review Builder',tag:'LITERATURE REVIEW',text:'Build theme maps, source notes, synthesis paragraphs and a defensible literature gap without losing your own academic voice.'},
]
export default function BuildersPage(){return <div><Breadcrumbs items={[{label:'Home',to:'/dashboard'},{label:'Builders'}]}/><div className="page-heading"><div><span className="page-kicker">GUIDED WORKSPACES</span><h1>Blueprint Builders</h1><p>Scaffolds that organise your own reasoning and writing. They do not write the research for you.</p></div></div><div className="builder-card-grid">{builders.map(({slug,icon:Icon,title,tag,text})=><Link to={`/builders/${slug}`} className="builder-card" key={slug}><div className="builder-card-icon"><Icon/></div><span>{tag}</span><h2>{title}</h2><p>{text}</p><b>Open builder <ArrowRight/></b></Link>)}</div></div>}
