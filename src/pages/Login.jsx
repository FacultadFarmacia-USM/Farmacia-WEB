import React, { useState } from "react";
import { supabase } from '../supabaseClient'; // Conectamos Supabase

const EyeIcon = ({ open }) => open ? (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const s = {
  page: {
    minHeight:"100vh", background:"#f8f9ff", display:"flex",
    alignItems:"center", justifyContent:"center",
    fontFamily:"'Inter',sans-serif", position:"relative", overflow:"hidden",
  },
  blobTR: {
    position:"absolute", top:"-80px", right:"-80px",
    width:"340px", height:"340px", borderRadius:"50%",
    background:"radial-gradient(circle,#d4e3ff55 0%,transparent 70%)",
    pointerEvents:"none",
  },
  blobBL: {
    position:"absolute", bottom:"-60px", left:"-60px",
    width:"260px", height:"260px", borderRadius:"50%",
    background:"radial-gradient(circle,#6bfe9c33 0%,transparent 70%)",
    pointerEvents:"none",
  },
  card: {
    width:"100%", maxWidth:"440px", margin:"0 16px", position:"relative", zIndex:1,
    background:"#ffffff", borderRadius:"20px",
    border:"1px solid #c4c6cf",
    boxShadow:"0 8px 40px rgba(13,28,46,0.10),0 2px 8px rgba(13,28,46,0.06)",
    overflow:"hidden",
  },
  header: {
    background:"linear-gradient(135deg,#001f3f 0%,#002d5a 60%,#003d7a 100%)",
    padding:"34px 40px 30px", position:"relative", overflow:"hidden",
  },
  headerGlow: {
    position:"absolute", inset:0,
    backgroundImage:"radial-gradient(circle at 80% 20%,rgba(175,200,240,0.15) 0%,transparent 50%)",
  },
  logoBox: {
    width:"52px", height:"52px", borderRadius:"14px",
    background:"rgba(255,255,255,0.12)", border:"1px solid rgba(255,255,255,0.2)",
    display:"flex", alignItems:"center", justifyContent:"center",
  },
  body: { padding:"30px 40px 34px" },
  errorBox: {
    background:"#ffdad6", border:"1px solid #f4a9a3",
    borderRadius:"10px", padding:"10px 14px",
    marginBottom:"18px", display:"flex", alignItems:"center", gap:"8px",
  },
  infoBox: {
    marginTop:"22px", padding:"12px 14px",
    background:"#eff4ff", borderRadius:"10px",
    border:"1px solid #d5e3fc",
    display:"flex", alignItems:"flex-start", gap:"8px",
  },
};

const fieldWrap = (focused) => ({
  position:"relative",
  border:`1.5px solid ${focused ? "#006d37" : "#c4c6cf"}`,
  borderRadius:"12px",
  background: focused ? "#f8fff9" : "#f8f9ff",
  transition:"all 0.18s ease",
  height:"58px",
  boxShadow: focused ? "0 0 0 3px rgba(0,109,55,0.08)" : "none",
});

const floatLabel = (focused, val) => ({
  position:"absolute", left:"44px",
  top: focused || val ? "8px" : "50%",
  transform: focused || val ? "none" : "translateY(-50%)",
  fontSize: focused || val ? "11px" : "14px",
  color: focused ? "#006d37" : "#74777f",
  fontWeight:"500", transition:"all 0.18s ease",
  pointerEvents:"none", lineHeight:1, letterSpacing:"0.01em",
});

const inputStyle = (shifted) => ({
  position:"absolute", inset:0, width:"100%", height:"100%",
  background:"transparent", border:"none", outline:"none",
  paddingLeft:"44px", paddingRight:"16px",
  paddingTop: shifted ? "20px" : "0",
  fontSize:"14px", color:"#0d1c2e",
  fontFamily:"Inter,sans-serif",
  transition:"padding 0.18s ease",
  boxSizing:"border-box",
});

export default function Login() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading]   = useState(false);
  const [error, setError]       = useState("");
  const [ef, setEf] = useState(false);
  const [pf, setPf] = useState(false);

  // --- LÓGICA DE SUPABASE INTEGRADA AQUÍ ---
  const handleLogin = async () => {
    setError("");
    
    // Validación de campos vacíos
    if (!email || !password) { 
      setError("Por favor completa todos los campos."); 
      return; 
    }
    
    setLoading(true);
    
    try {
      const { error: authError } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      if (authError) throw authError;
      
      // Si el login es exitoso, App.jsx detectará el cambio de sesión 
      // automáticamente y te llevará al Dashboard sin hacer nada más.
      
    } catch (err) {
      console.error(err);
      setError("Credenciales incorrectas. Verifica tu usuario y contraseña.");
    } finally {
      setLoading(false);
    }
  };

  const onKeyDown = (e) => { if (e.key === "Enter") handleLogin(); };

  return (
    <div style={s.page}>
      {/* grid bg */}
      <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.18}} xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="g" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#c7d8f8" strokeWidth="0.8"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#g)"/>
      </svg>
      <div style={s.blobTR}/><div style={s.blobBL}/>

      <div style={{position:"relative",zIndex:1,width:"100%",maxWidth:"440px",margin:"0 16px"}}>
        <div style={s.card}>

          {/* ── Header ── */}
          <div style={s.header}>
            <div style={s.headerGlow}/>
            <div style={{display:"flex",alignItems:"center",gap:"14px",marginBottom:"18px",position:"relative"}}>
              <div style={s.logoBox}>
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 3h6m-5 0v6l-4.5 7.5A2 2 0 0 0 7.2 21h9.6a2 2 0 0 0 1.7-3L14 9V3"/>
                  <line x1="6.8" y1="15" x2="17.2" y2="15"/>
                </svg>
              </div>
              <div>
                <div style={{color:"rgba(255,255,255,0.55)",fontSize:"11px",fontWeight:"500",letterSpacing:"0.08em",textTransform:"uppercase",marginBottom:"2px"}}>
                  Facultad de Farmacia
                </div>
                <div style={{color:"#fff",fontSize:"18px",fontWeight:"700",letterSpacing:"-0.01em",lineHeight:1.2}}>
                  Sistema de Pasantías
                </div>
              </div>
            </div>
            <div style={{position:"relative"}}>
              <h1 style={{color:"#fff",fontSize:"26px",fontWeight:"700",margin:"0 0 6px",letterSpacing:"-0.02em"}}>Bienvenido</h1>
              <p style={{color:"rgba(175,200,240,0.85)",fontSize:"14px",margin:0}}>
                Acceso exclusivo para docentes y coordinadores
              </p>
            </div>
            <div style={{display:"flex",gap:"8px",marginTop:"18px",position:"relative"}}>
              {["Profesor","Coordinador","Administrador"].map(r=>(
                <span key={r} style={{
                  fontSize:"11px",fontWeight:"500",padding:"3px 10px",borderRadius:"20px",
                  background:"rgba(255,255,255,0.10)",border:"1px solid rgba(255,255,255,0.18)",
                  color:"rgba(255,255,255,0.75)",letterSpacing:"0.01em",
                }}>{r}</span>
              ))}
            </div>
          </div>

          {/* ── Body ── */}
          <div style={s.body}>

            {error && (
              <div style={s.errorBox}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93000a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{fontSize:"13px",color:"#93000a",fontWeight:"500"}}>{error}</span>
              </div>
            )}

            {/* Email */}
            <div style={{marginBottom:"18px"}}>
              <div style={fieldWrap(ef)}>
                <div style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:ef?"#006d37":"#74777f",transition:"color 0.18s"}}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <label style={floatLabel(ef,email)}>Correo institucional</label>
                <input
                  type="email" value={email}
                  onChange={e=>setEmail(e.target.value)}
                  onFocus={()=>setEf(true)} onBlur={()=>setEf(false)}
                  onKeyDown={onKeyDown}
                  style={{...inputStyle(ef||email), paddingRight:"16px"}}
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password */}
            <div style={{marginBottom:"8px"}}>
              <div style={fieldWrap(pf)}>
                <div style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:pf?"#006d37":"#74777f",transition:"color 0.18s"}}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                </div>
                <label style={floatLabel(pf,password)}>Contraseña</label>
                <input
                  type={showPass?"text":"password"} value={password}
                  onChange={e=>setPassword(e.target.value)}
                  onFocus={()=>setPf(true)} onBlur={()=>setPf(false)}
                  onKeyDown={onKeyDown}
                  style={{...inputStyle(pf||password), paddingRight:"48px"}}
                  autoComplete="current-password"
                />
                <button type="button" onClick={()=>setShowPass(p=>!p)} style={{
                  position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",
                  color:"#74777f",padding:"4px",display:"flex",alignItems:"center",
                }}>
                  <EyeIcon open={showPass}/>
                </button>
              </div>
            </div>

            {/* Forgot */}
            <div style={{textAlign:"right",marginBottom:"22px"}}>
              <button type="button" style={{
                background:"none",border:"none",cursor:"pointer",
                fontSize:"13px",color:"#006d37",fontWeight:"500",
                fontFamily:"Inter,sans-serif",padding:0,
              }}>¿Olvidaste tu contraseña?</button>
            </div>

            {/* Submit */}
            <button
              type="button"
              onClick={handleLogin}
              disabled={loading}
              style={{
                width:"100%", height:"52px",
                background: loading ? "#4ae183" : "linear-gradient(135deg,#006d37 0%,#008a45 100%)",
                color:"#ffffff", border:"none", borderRadius:"12px",
                fontSize:"15px", fontWeight:"600", fontFamily:"Inter,sans-serif",
                cursor: loading ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                transition:"all 0.2s ease",
                boxShadow: loading ? "none" : "0 4px 14px rgba(0,109,55,0.30)",
                letterSpacing:"0.01em",
              }}
            >
              {loading ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                    </path>
                  </svg>
                  Verificando...
                </>
              ) : (
                <>
                  Iniciar Sesión
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </>
              )}
            </button>

            {/* Info note */}
            <div style={s.infoBox}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#476083" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:"1px",flexShrink:0}}>
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              <p style={{fontSize:"12px",color:"#43474e",margin:0,lineHeight:"1.55"}}>
                Este sistema es de <strong>uso exclusivo</strong> para personal docente y administrativo autorizado. Los estudiantes no requieren cuenta.
              </p>
            </div>
          </div>
        </div>

        <p style={{textAlign:"center",marginTop:"18px",fontSize:"12px",color:"#74777f"}}>
          © {new Date().getFullYear()} Facultad de Farmacia · Sistema de Gestión de Pasantías
        </p>
      </div>
    </div>
  );
}