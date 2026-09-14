import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight, Check, BookOpenText, MessageSquareText, GraduationCap, PenLine,
  LockKeyhole, Layers3, FileText, BriefcaseBusiness, Target, ShieldCheck,
  Mail, Send, ChevronRight, SearchCheck, ClipboardCheck, BookMarked,
  UserRoundCheck, Building2
} from 'lucide-react'
import PublicHeader from '../components/PublicHeader'
import Footer from '../components/Footer'
import { api } from '../lib/api'

const method = [
  ['01', 'Explain', 'Learn the idea in clear language before academic terminology is added.'],
  ['02', 'Model', 'See the same skill used properly in credible academic or workplace writing.'],
  ['03', 'Practice', 'Work through a focused task using your own words, reasoning and citations.'],
  ['04', 'Apply', 'Use the skill on a realistic problem until you can repeat it independently.'],
]

const audiences = [
  ['University students', 'Build the research and academic-writing habits needed for proposals, projects and dissertations.'],
  ['Researchers', 'Use structured checkpoints to sharpen problems, literature reviews and methodology decisions.'],
  ['Professionals', 'Improve emails, reports, meetings, presentations and everyday workplace communication.'],
  ['Institutions & teams', 'Use a consistent learning framework for cohorts, staff development and guided training.'],
]

const faqs = [
  ['What can I access for free?', 'Learners can create an account, access selected foundation lessons and use free resources. Premium lessons and resources clearly show when payment is required.'],
  ['Is Problem Analysis free?', 'No. “Problem Analysis: Four Ways to Diagnose a Research Problem” is a premium resource. The public page shows a preview, while the full lesson becomes available only after access has been confirmed for your account.'],
  ['Do the builders write my research for me?', 'No. The builders are guided scaffolds. They organise your own reasoning, evidence, citations and writing into a workable draft instead of generating a finished academic chapter for you.'],
  ['Will my progress and drafts be saved?', 'Yes. Signed-in learners can save lesson progress, quiz attempts and builder drafts to their account and continue later.'],
  ['Can an institution use the platform?', 'Yes. The system already separates learner and administrator roles and can be extended for institutional cohorts, reporting and bulk access. Contact us for an implementation plan.'],
]

export default function LandingPage(){
  const [form,setForm]=useState({name:'',email:'',subject:'',message:''})
  const [sent,setSent]=useState(false)
  const [error,setError]=useState('')
  const submit=async e=>{
    e.preventDefault(); setError(''); setSent(false)
    try{
      await api('/contact/',{method:'POST',body:JSON.stringify(form)})
      setSent(true); setForm({name:'',email:'',subject:'',message:''})
    }catch(err){ setError(err.message) }
  }

  return <div className="landing-v2">
    <PublicHeader/>

    <section className="human-hero">
      <div className="human-hero__photo" aria-hidden="true"/>
      <div className="human-hero__shade" aria-hidden="true"/>
      <div className="container human-hero__inner">
        <div className="human-hero__copy">
          <span className="human-kicker">PRACTICAL GUIDANCE FOR SERIOUS WORK</span>
          <h1>Build better research.<br/><em>Communicate with confidence.</em></h1>
          <p>Learn how to define a research problem, structure Chapter One, review literature and communicate professionally through guided lessons, real examples and practical builders.</p>
          <div className="human-hero__actions">
            <Link to="/register" className="button button--gold">Start learning free <ArrowRight size={17}/></Link>
            <a href="#products" className="human-link human-link--light">Explore the learning pathways <ArrowRight size={15}/></a>
          </div>
          <div className="human-hero__proof" aria-label="Platform features">
            <span><Check/> Guided lessons</span>
            <span><Check/> Research builders</span>
            <span><Check/> Real examples</span>
            <span><LockKeyhole/> Premium resources</span>
          </div>
        </div>
        <div className="human-hero__caption">
          <span>LEARN BY DOING</span>
          <strong>Structure first. Confidence follows.</strong>
          <p>The platform is built around repeated practice rather than one-off tips or shortcuts.</p>
        </div>
      </div>
    </section>

    <section className="human-audience" aria-label="Who the platform is for">
      <div className="container human-audience__inner">
        <span>Designed for</span>
        <b>University students</b><i/> <b>Researchers</b><i/> <b>Professionals</b><i/> <b>Institutions</b>
      </div>
    </section>

    <section className="human-section human-products" id="products">
      <div className="container">
        <div className="human-heading human-heading--split">
          <div><span className="human-kicker human-kicker--dark">THE TWO LEARNING PATHWAYS</span><h2>Choose the skill you need to strengthen.</h2></div>
          <p>Research and communication are taught as practical skills: understand the principle, see it done well, practise it, then apply it to your own work.</p>
        </div>
        <div className="pathway-list">
          <article className="pathway pathway--research">
            <div className="pathway__number">01</div>
            <div className="pathway__icon"><GraduationCap/></div>
            <div className="pathway__body">
              <span>ACADEMIC & APPLIED RESEARCH</span>
              <h3>The Research Blueprint</h3>
              <p>A step-by-step system for moving from a rough research idea to structured, defensible academic work.</p>
              <div className="pathway__points"><span><Check/> Research-problem diagnosis</span><span><Check/> Chapter One guidance</span><span><Check/> Literature-review method</span><span><Check/> Methodology foundations</span></div>
            </div>
            <Link to="/register" className="pathway__action">Explore the Blueprint <ArrowRight/></Link>
          </article>

          <article className="pathway pathway--communication">
            <div className="pathway__number">02</div>
            <div className="pathway__icon"><MessageSquareText/></div>
            <div className="pathway__body">
              <span>PROFESSIONAL COMMUNICATION</span>
              <h3>Business Communication Toolkit</h3>
              <p>Practical training for writing, speaking and meetings where clarity, tone and confidence matter.</p>
              <div className="pathway__points"><span><Check/> Professional writing</span><span><Check/> Speaking with confidence</span><span><Check/> Meeting communication</span><span><Check/> Real workplace practice</span></div>
            </div>
            <Link to="/register" className="pathway__action">Explore the Toolkit <ArrowRight/></Link>
          </article>
        </div>
      </div>
    </section>

    <section className="human-section human-method" id="method">
      <div className="container">
        <div className="human-heading human-heading--split human-heading--light">
          <div><span className="human-kicker">THE LEARNING ENGINE</span><h2>Explain. Model. Practice. Apply.</h2></div>
          <p>Every lesson follows the same sequence. The learner spends less time figuring out the interface and more time building the skill.</p>
        </div>
        <div className="human-method__grid">
          {method.map(([n,title,desc])=><article key={title}><span>{n}</span><h3>{title}</h3><p>{desc}</p></article>)}
        </div>
      </div>
    </section>

    <section className="human-section human-inside" id="inside">
      <div className="container">
        <div className="human-heading">
          <span className="human-kicker human-kicker--dark">INSIDE THE PLATFORM</span>
          <h2>Not just lessons. Working tools for the difficult parts.</h2>
          <p>These are examples of what learners actually work with after signing in.</p>
        </div>
        <div className="inside-layout">
          <article className="inside-feature inside-feature--wide">
            <div className="inside-feature__top"><div><LockKeyhole/><span>PREMIUM RESOURCE</span></div><b>Problem Analysis</b></div>
            <h3>Four ways to diagnose a research problem</h3>
            <p>Not every research problem needs the same kind of analysis. Learners choose the diagnostic path that fits the problem instead of forcing one formula onto every study.</p>
            <div className="diagnostic-paths"><span>Condition-based</span><span>Process-based</span><span>Historical / narrative</span><span>Comparative / disparity</span></div>
            <Link to="/register">See how premium access works <ArrowRight/></Link>
          </article>

          <article className="inside-feature">
            <div className="inside-feature__top"><div><PenLine/><span>GUIDED BUILDER</span></div><b>Chapter One</b></div>
            <h3>Build the chapter from your own reasoning.</h3>
            <ol className="mini-outline"><li>Background</li><li>Problem statement</li><li>Purpose & objectives</li><li>Research questions</li><li>Gap & significance</li></ol>
          </article>

          <article className="inside-feature">
            <div className="inside-feature__top"><div><BookMarked/><span>LITERATURE REVIEW</span></div><b>Four-layer method</b></div>
            <h3>Move from reading sources to writing synthesis.</h3>
            <div className="literature-flow"><span>Understand</span><ChevronRight/><span>Extract</span><ChevronRight/><span>Compare</span><ChevronRight/><span>Synthesise</span></div>
          </article>
        </div>
      </div>
    </section>

    <section className="human-section human-for" id="audience">
      <div className="container human-for__layout">
        <div className="human-heading human-heading--sticky">
          <span className="human-kicker human-kicker--dark">WHO IT IS FOR</span>
          <h2>Different goals. One need for clearer structure.</h2>
          <p>The platform is useful where people have capable ideas but need a dependable process for turning those ideas into strong work.</p>
        </div>
        <div className="audience-list">
          {audiences.map(([title,desc],i)=><article key={title}><span>0{i+1}</span><div><h3>{title}</h3><p>{desc}</p></div></article>)}
        </div>
      </div>
    </section>

    <section className="human-section human-access" id="access">
      <div className="container">
        <div className="human-heading centered-human"><span className="human-kicker human-kicker--dark">ACCESS</span><h2>Start free. Pay only when you need deeper material.</h2><p>Free learning stays clearly separated from premium content. Paid access is securely linked to the learner account after payment is confirmed.</p></div>
        <div className="access-grid">
          <article><span className="access-type">FREE</span><h3>Foundation access</h3><p>Start with selected lessons and free review resources before deciding whether you need more.</p><ul><li><Check/>Create a learner account</li><li><Check/>Selected foundation lessons</li><li><Check/>Progress tracking</li><li><Check/>Free resources</li></ul><Link to="/register">Create free account <ArrowRight/></Link></article>
          <article className="access-grid__featured"><span className="access-type">PAY PER RESOURCE</span><h3>Premium resources</h3><p>Unlock specialist material such as Problem Analysis without exposing the protected content publicly.</p><ul><li><Check/>Secure entitlement after payment</li><li><Check/>Full premium lesson content</li><li><Check/>Worked examples and checks</li><li><Check/>Access remains on your account</li></ul><Link to="/register">View premium resources <ArrowRight/></Link></article>
          <article><span className="access-type">PATHWAY ACCESS</span><h3>Complete learning pathway</h3><p>For learners who want the complete sequence rather than purchasing individual resources one at a time.</p><ul><li><Check/>Full course pathway</li><li><Check/>Interactive builders</li><li><Check/>Assessments and progress</li><li><Check/>Future modules as configured</li></ul><Link to="/register">Explore pathway access <ArrowRight/></Link></article>
        </div>
      </div>
    </section>

    <section className="human-section human-founder" id="about">
      <div className="container human-founder__layout">
        <div className="founder-note">
          <span>MEET THE FOUNDER</span>
          <h2>Madina Bakar</h2>
          <p>Educator, research mentor and program designer.</p>
          <blockquote>“Learners rise to the level of the structure they’re given.”</blockquote>
        </div>
        <div className="founder-story">
          <p>Research Skills & Business Communication grew from a simple observation: strong ideas are often weakened by unclear structure. The platform turns long experience in teaching, research supervision and program design into repeatable learning systems.</p>
          <div className="founder-credentials">
            <div><BookOpenText/><span><b>Bachelor of Education</b><small>English & Literature · Makerere University</small></span></div>
            <div><Building2/><span><b>Masters in Management</b><small>Public Administration & Management · Uganda Management Institute</small></span></div>
            <div><ShieldCheck/><span><b>TESOL Certificate</b><small>Arizona State University</small></span></div>
            <div><UserRoundCheck/><span><b>Research supervision & teaching</b><small>Tertiary, secondary and community learning contexts</small></span></div>
          </div>
        </div>
      </div>
    </section>

    <section className="human-section human-faq" id="faq">
      <div className="container human-faq__layout">
        <div className="human-heading"><span className="human-kicker human-kicker--dark">FREQUENTLY ASKED</span><h2>What learners usually need to know first.</h2></div>
        <div className="faq-list">{faqs.map(([q,a])=><details key={q}><summary>{q}<span>+</span></summary><p>{a}</p></details>)}</div>
      </div>
    </section>

    <section className="human-section human-contact" id="contact">
      <div className="container human-contact__layout">
        <div className="human-heading"><span className="human-kicker human-kicker--dark">CONTACT</span><h2>Questions, support or institutional access?</h2><p>Use the form for learner support, partnerships and institutional enquiries.</p><div className="human-contact__note"><Mail/><span>Your message goes directly to the support team for follow-up.</span></div></div>
        <form className="contact-card" onSubmit={submit}>
          {sent&&<div className="success-banner">Message received. Thank you.</div>}
          {error&&<div className="error-banner">{error}</div>}
          <div className="form-grid"><label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})}/></label><label>Email<input type="email" required value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/></label></div>
          <label>Subject<input value={form.subject} onChange={e=>setForm({...form,subject:e.target.value})}/></label>
          <label>Message<textarea rows="5" required value={form.message} onChange={e=>setForm({...form,message:e.target.value})}></textarea></label>
          <button className="button button--primary">Send message <Send size={16}/></button>
        </form>
      </div>
    </section>

    <section className="human-final-cta"><div className="container human-final-cta__inner"><div><span>READY WHEN YOU ARE</span><h2>Start with one lesson. Build a skill you can reuse.</h2></div><Link to="/register" className="button button--gold">Create a free account <ArrowRight/></Link></div></section>
    <Footer/>
  </div>
}
