import { createContext, useContext, useState, useEffect } from 'react'
const Ctx = createContext(null)
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(null)
  useEffect(() => {
    const t = localStorage.getItem('de_token'), u = localStorage.getItem('de_user')
    if (t && u) { setToken(t); setUser(JSON.parse(u)) }
  }, [])
  const login = (u, t) => { setUser(u); setToken(t); localStorage.setItem('de_token', t); localStorage.setItem('de_user', JSON.stringify(u)) }
  const logout = () => { setUser(null); setToken(null); localStorage.removeItem('de_token'); localStorage.removeItem('de_user') }
  return <Ctx.Provider value={{ user, token, login, logout }}>{children}</Ctx.Provider>
}
export const useAuth = () => useContext(Ctx)
