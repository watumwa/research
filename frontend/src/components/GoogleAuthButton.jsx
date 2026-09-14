import { useEffect, useRef, useState } from 'react'

const GOOGLE_SCRIPT_ID = 'google-identity-services'

function loadGoogleIdentityScript(){
  return new Promise((resolve, reject)=>{
    if(window.google?.accounts?.id){ resolve(window.google); return }
    const existing = document.getElementById(GOOGLE_SCRIPT_ID)
    if(existing){
      existing.addEventListener('load', ()=>resolve(window.google), {once:true})
      existing.addEventListener('error', ()=>reject(new Error('Could not load Google sign-in.')), {once:true})
      return
    }
    const script = document.createElement('script')
    script.id = GOOGLE_SCRIPT_ID
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = ()=>resolve(window.google)
    script.onerror = ()=>reject(new Error('Could not load Google sign-in.'))
    document.head.appendChild(script)
  })
}

export default function GoogleAuthButton({onCredential, disabled=false, onError}){
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID
  const mountRef = useRef(null)
  const [ready,setReady] = useState(false)

  useEffect(()=>{
    let active = true
    if(!clientId){ setReady(false); return }
    loadGoogleIdentityScript().then(()=>{
      if(!active || !mountRef.current) return
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: response=>{
          if(response?.credential) onCredential(response.credential)
          else onError?.('Google did not return a valid sign-in credential.')
        },
        cancel_on_tap_outside: true,
      })
      mountRef.current.innerHTML = ''
      window.google.accounts.id.renderButton(mountRef.current, {
        type: 'standard',
        theme: 'outline',
        size: 'large',
        text: 'continue_with',
        shape: 'rectangular',
        logo_alignment: 'left',
        width: Math.min(400, mountRef.current.clientWidth || 400),
      })
      setReady(true)
    }).catch(err=>onError?.(err.message)).finally(()=>{})
    return ()=>{ active=false }
  },[clientId,onCredential,onError])

  if(!clientId){
    return <button type="button" className="google-fallback" onClick={()=>onError?.('Google sign-in is not configured yet. Add VITE_GOOGLE_CLIENT_ID to frontend/.env and GOOGLE_OAUTH_CLIENT_ID to backed/.env.')} disabled={disabled}>
      <GoogleMark/> Continue with Google
    </button>
  }

  return <div className={`google-auth-wrap ${disabled?'is-disabled':''}`} aria-busy={!ready}>
    <div ref={mountRef} className="google-auth-mount"/>
    {!ready && <div className="google-auth-loading"><GoogleMark/> Loading Google…</div>}
  </div>
}

function GoogleMark(){
  return <svg className="google-mark" viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.72-.06-1.25-.2-1.8H12v3.47h5.52c-.11.86-.71 2.16-2.04 3.03l-.02.12 2.96 2.3.21.02c1.93-1.79 2.97-4.42 2.97-7.14Z"/><path fill="#34A853" d="M12 22c2.76 0 5.08-.91 6.77-2.48l-3.23-2.5c-.86.58-2.01.99-3.54.99-2.65 0-4.9-1.79-5.7-4.26l-.11.01-3.08 2.38-.04.11C4.75 19.59 8.19 22 12 22Z"/><path fill="#FBBC05" d="M6.3 13.75A6.02 6.02 0 0 1 5.98 12c0-.61.11-1.2.3-1.75l-.01-.12-3.12-2.42-.1.05A10 10 0 0 0 2 12c0 1.52.34 2.95 1.07 4.24l3.23-2.49Z"/><path fill="#EA4335" d="M12 5.99c1.92 0 3.22.83 3.97 1.52l2.87-2.8C17.07 3.06 14.76 2 12 2 8.19 2 4.75 4.4 3.07 7.76l3.22 2.49c.81-2.47 3.06-4.26 5.71-4.26Z"/></svg>
}
