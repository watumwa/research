import { Link } from 'react-router-dom'
export default function NotFoundPage(){return <div className="not-found"><span>404</span><h1>That page isn’t here.</h1><p>The link may have changed or the resource may no longer be available.</p><Link className="button button--primary" to="/">Return home</Link></div>}
