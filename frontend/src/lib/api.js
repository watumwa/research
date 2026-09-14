const API_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000/api'
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || API_URL.replace(/\/api\/?$/, '')

function getToken(){ return localStorage.getItem('rsbc-access') }
function getRefresh(){ return localStorage.getItem('rsbc-refresh') }

async function refreshAccess(){
  const refresh = getRefresh()
  if(!refresh) return null
  const res = await fetch(`${API_URL}/auth/token/refresh/`, {method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({refresh})})
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
  let res = await fetch(`${API_URL}${path}`, {...options, headers})
  if(res.status === 401 && token && !options._retried){
    const fresh = await refreshAccess()
    if(fresh){
      headers.Authorization = `Bearer ${fresh}`
      res = await fetch(`${API_URL}${path}`, {...options, headers, _retried:true})
    }
  }
  const text = await res.text()
  let data = null
  try { data = text ? JSON.parse(text) : null } catch { data = {detail:text} }
  if(!res.ok){
    const err = new Error(data?.detail || 'Request failed')
    err.status = res.status
    err.data = data
    throw err
  }
  return data
}

export async function login(email, password){
  const res = await fetch(`${API_URL}/auth/token/`, {method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})})
  const data = await res.json()
  if(!res.ok) throw new Error(data?.detail || 'Invalid email or password')
  localStorage.setItem('rsbc-access', data.access)
  localStorage.setItem('rsbc-refresh', data.refresh)
  return data.user
}

export async function googleLogin(credential, accepted_terms=false){
  const res = await fetch(`${API_URL}/auth/google/`, {
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({credential, accepted_terms})
  })
  const data = await res.json()
  if(!res.ok) throw new Error(data?.detail || 'Google sign-in failed')
  localStorage.setItem('rsbc-access', data.access)
  localStorage.setItem('rsbc-refresh', data.refresh)
  return data.user
}

export function logout(){
  localStorage.removeItem('rsbc-access')
  localStorage.removeItem('rsbc-refresh')
}

export { API_URL, BACKEND_URL }
