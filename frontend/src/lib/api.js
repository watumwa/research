const configuredApiUrl = (import.meta.env.VITE_API_URL || '').trim()
const configuredBackendUrl = (import.meta.env.VITE_BACKEND_URL || '').trim()

// Localhost is a development-only fallback. In production we intentionally do
// not silently point a visitor's browser back to 127.0.0.1.
const API_URL = (configuredApiUrl || (import.meta.env.DEV ? 'http://127.0.0.1:8000/api' : '')).replace(/\/+$/, '')
const BACKEND_URL = (configuredBackendUrl || (API_URL ? API_URL.replace(/\/api\/?$/, '') : '')).replace(/\/+$/, '')

function ensureApiConfigured(){
  if(!API_URL){
    throw new Error('The application server is not configured. Set VITE_API_URL in the frontend deployment and redeploy.')
  }
}

function endpoint(path=''){
  ensureApiConfigured()
  const cleanPath = String(path).startsWith('/') ? path : `/${path}`
  return `${API_URL}${cleanPath}`
}

function getToken(){ return localStorage.getItem('rsbc-access') }
function getRefresh(){ return localStorage.getItem('rsbc-refresh') }

async function request(url, options={}){
  try {
    return await fetch(url, options)
  } catch (error) {
    throw new Error('Unable to reach the application server. Check the API URL/CORS configuration and try again.')
  }
}

async function refreshAccess(){
  const refresh = getRefresh()
  if(!refresh) return null
  const res = await request(endpoint('/auth/token/refresh/'), {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({refresh})
  })
  if(!res.ok) return null
  const data = await res.json()
  localStorage.setItem('rsbc-access', data.access)
  if(data.refresh) localStorage.setItem('rsbc-refresh', data.refresh)
  return data.access
}

export async function api(path, options={}){
  const headers = {'Content-Type':'application/json', ...(options.headers||{})}
  const token = getToken()
  if(token) headers.Authorization = `Bearer ${token}`
  let res = await request(endpoint(path), {...options, headers})
  if(res.status === 401 && token && !options._retried){
    const fresh = await refreshAccess()
    if(fresh){
      headers.Authorization = `Bearer ${fresh}`
      res = await request(endpoint(path), {...options, headers, _retried:true})
    }
  }
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = {detail:text} }
  if(!res.ok){
    const err = new Error(data?.detail || `Request failed (${res.status})`)
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export async function apiHealth(){
  const res = await request(endpoint('/health/'), {headers:{'Accept':'application/json'}})
  if(!res.ok) throw new Error(`API health check failed (${res.status})`)
  return res.json()
}

export async function login(email, password){
  const res = await request(endpoint('/auth/token/'), {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({email,password})
  })
  const data = await res.json().catch(()=>null)
  if(!res.ok) throw new Error(data?.detail || 'Invalid email or password')
  localStorage.setItem('rsbc-access', data.access)
  localStorage.setItem('rsbc-refresh', data.refresh)
  return data.user
}

export async function googleLogin(credential, accepted_terms=false){
  const res = await request(endpoint('/auth/google/'), {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({credential, accepted_terms})
  })
  const data = await res.json().catch(()=>null)
  if(!res.ok) throw new Error(data?.detail || 'Google sign-in failed')
  localStorage.setItem('rsbc-access', data.access)
  localStorage.setItem('rsbc-refresh', data.refresh)
  return data.user
}

export function logout(){
  localStorage.removeItem('rsbc-access')
  localStorage.removeItem('rsbc-refresh')
}

export const API_CONFIGURED = Boolean(API_URL)
export { API_URL, BACKEND_URL }
