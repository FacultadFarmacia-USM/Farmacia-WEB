import { useState } from "react";
import { supabase } from '../supabaseClient';

const EyeIcon = ({ open }) => open ? (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
) : (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);

const fieldWrap = (focused) => ({
  position: "relative",
  border: `1.5px solid ${focused ? "#006d37" : "#c4c6cf"}`,
  borderRadius: "12px",
  background: focused ? "#f8fff9" : "#f8f9ff",
  transition: "all 0.18s ease",
  height: "58px",
  boxShadow: focused ? "0 0 0 3px rgba(0,109,55,0.08)" : "none",
});

const floatLabel = (focused, val) => ({
  position: "absolute", left: "44px",
  top: focused || val ? "8px" : "50%",
  transform: focused || val ? "none" : "translateY(-50%)",
  fontSize: focused || val ? "11px" : "14px",
  color: focused ? "#006d37" : "#74777f",
  fontWeight: "500", transition: "all 0.18s ease",
  pointerEvents: "none", lineHeight: 1, letterSpacing: "0.01em",
});

const inputBase = (shifted, extraRight = "16px") => ({
  position: "absolute", inset: 0, width: "100%", height: "100%",
  background: "transparent", border: "none", outline: "none",
  paddingLeft: "44px", paddingRight: extraRight,
  paddingTop: shifted ? "20px" : "0",
  fontSize: "14px", color: "#0d1c2e",
  fontFamily: "Inter, sans-serif",
  transition: "padding 0.18s ease",
  boxSizing: "border-box",
});

const LockIcon = ({ color = "currentColor" }) => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
  </svg>
);

// ── Indicador de fortaleza ────────────────────────────────────────────────────
function StrengthBar({ password }) {
  const checks = [
    password.length >= 6,
    password.length >= 10,
    /[A-Z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password),
  ];
  const score = checks.filter(Boolean).length;
  const levels = [
    { label: "Muy débil", color: "#ba1a1a" },
    { label: "Débil",     color: "#e07b00" },
    { label: "Regular",   color: "#e0c000" },
    { label: "Buena",     color: "#4caf50" },
    { label: "Fuerte",    color: "#006d37" },
  ];
  const lvl = levels[Math.max(0, score - 1)];
  if (!password) return null;
  return (
    <div style={{ marginTop: "8px" }}>
      <div style={{ display: "flex", gap: "4px", marginBottom: "4px" }}>
        {levels.map((l, i) => (
          <div key={i} style={{
            flex: 1, height: "3px", borderRadius: "4px",
            background: i < score ? lvl.color : "#e6eeff",
            transition: "background 0.2s",
          }}/>
        ))}
      </div>
      <span style={{ fontSize: "11px", color: lvl.color, fontWeight: "500" }}>{lvl.label}</span>
    </div>
  );
}

export default function FormularioNuevaPassword({ alTerminar }) {
  const [nuevaPassword,     setNueva]     = useState("");
  const [confirmarPassword, setConfirmar] = useState("");
  const [showNew,  setShowNew]  = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);

  // focus states
  const [f1, setF1] = useState(false);
  const [f2, setF2] = useState(false);

  // ── Lógica original intacta ──────────────────────────────────────────────
  const actualizarPasswordDefinitiva = async () => {
    setError("");
    if (!nuevaPassword || !confirmarPassword) {
      setError("Por favor completa ambos campos.");
      return;
    }
    if (nuevaPassword !== confirmarPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }
    if (nuevaPassword.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    setCargando(true);
    try {
      const { error: authError } = await supabase.auth.updateUser({ password: nuevaPassword });
      if (authError) throw authError;
      setSuccess(true);
      await supabase.auth.signOut();
      setTimeout(() => alTerminar(), 2200);
    } catch (err) {
      setError(`Error al actualizar: ${err.message}`);
      console.error(err);
    } finally {
      setCargando(false);
    }
  };

  const onKeyDown = (e) => { if (e.key === "Enter") actualizarPasswordDefinitiva(); };

  return (
    <div style={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'Inter', sans-serif",
      background: "#f8f9ff", overflow: "hidden",
    }}>

      {/* ── Panel izquierdo — igual que el Login ── */}
      <div className="left-panel" style={{
        display: "none", width: "60%", position: "relative",
        background: "linear-gradient(135deg,#f8f9ff 0%,#e6eeff 100%)",
        borderRight: "1px solid #c4c6cf",
        alignItems: "center", justifyContent: "center", overflow: "hidden",
      }}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.25,pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="gL2" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#c7d8f8" strokeWidth="0.8"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#gL2)"/>
        </svg>
        <div style={{position:"absolute",top:"-100px",right:"-100px",width:"400px",height:"400px",borderRadius:"50%",background:"radial-gradient(circle,#d4e3ff66 0%,transparent 70%)"}}/>
        <div style={{position:"absolute",bottom:"-80px",left:"-80px",width:"300px",height:"300px",borderRadius:"50%",background:"radial-gradient(circle,#6bfe9c33 0%,transparent 70%)"}}/>
        <div style={{position:"relative",zIndex:1,textAlign:"center",padding:"40px"}}>
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBJN580ibPZiGkas8I8iu63TOS3WbjlskgvgIedsdDXM7AMMn5KRY569vjqvFYbEgHhYtXnifp0PfYzv-awHX_drBMPXBZMtkbIfO0lcwds8a52tHyo0b346vrh1qU0brL5ztxI1dkGf_SvfEgj-UgGJJOeblNTdKH4_y3VmZE2lFN3JysLGzbnsoZ_3qTBaPwoH10zFQSq3Vmgd3FDetBJJcBQm-xxxxCloaVAsbV3_Patv5RUxJiNRXl4uYfOGZhN2snsEmNGzlQ"
            alt="Ilustración Farmacia"
            style={{width:"100%",maxWidth:"420px",height:"auto",objectFit:"contain",filter:"drop-shadow(0 8px 32px rgba(0,31,63,0.12))"}}
          />
          <div style={{marginTop:"32px"}}>
            <h2 style={{fontSize:"22px",fontWeight:"700",color:"#001f3f",margin:"0 0 8px",letterSpacing:"-0.01em"}}>
              Gestión de Pasantías
            </h2>
            <p style={{fontSize:"14px",color:"#43474e",margin:0}}>
              Plataforma académica de la Facultad de Farmacia
            </p>
          </div>
        </div>
      </div>

      {/* ── Panel derecho (formulario) ── */}
      <div style={{
        flex: 1, display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        background: "#ffffff", padding: "40px 24px",
        position: "relative", overflowY: "auto",
      }}>
        <svg style={{position:"absolute",inset:0,width:"100%",height:"100%",opacity:0.15,pointerEvents:"none"}} xmlns="http://www.w3.org/2000/svg">
          <defs><pattern id="gR2" width="24" height="24" patternUnits="userSpaceOnUse">
            <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#c7d8f8" strokeWidth="0.8"/>
          </pattern></defs>
          <rect width="100%" height="100%" fill="url(#gR2)"/>
        </svg>

        <div style={{width:"100%",maxWidth:"400px",position:"relative",zIndex:1}}>

          {/* Logo + título */}
          <div style={{textAlign:"center",marginBottom:"32px"}}>
            <div style={{
              width:"64px",height:"64px",borderRadius:"18px",
              background:"linear-gradient(135deg,#001f3f 0%,#003d7a 100%)",
              display:"flex",alignItems:"center",justifyContent:"center",
              margin:"0 auto 16px",
              boxShadow:"0 6px 20px rgba(0,31,63,0.25)",
            }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
              </svg>
            </div>
            <h1 style={{fontSize:"26px",fontWeight:"700",color:"#0d1c2e",margin:"0 0 6px",letterSpacing:"-0.02em"}}>
              Restablecer Contraseña
            </h1>
            <p style={{fontSize:"14px",color:"#74777f",margin:0}}>Facultad de Farmacia</p>
          </div>

          {/* Tarjeta */}
          <div style={{
            background:"#ffffff",borderRadius:"16px",
            border:"1px solid #c4c6cf",
            boxShadow:"0 4px 24px rgba(13,28,46,0.08)",
            padding:"28px 28px 24px",
          }}>

            {/* Banner éxito */}
            {success && (
              <div style={{
                background:"#eaf3de",border:"1px solid #a8d08d",borderRadius:"10px",
                padding:"12px 14px",marginBottom:"18px",
                display:"flex",alignItems:"flex-start",gap:"10px",
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#27500a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{marginTop:"1px",flexShrink:0}}>
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <div>
                  <div style={{fontSize:"13px",color:"#27500a",fontWeight:"600",marginBottom:"2px"}}>¡Contraseña actualizada!</div>
                  <div style={{fontSize:"12px",color:"#27500a",opacity:0.8}}>Redirigiendo al login…</div>
                </div>
              </div>
            )}

            {/* Banner error */}
            {error && (
              <div style={{
                background:"#ffdad6",border:"1px solid #f4a9a3",borderRadius:"10px",
                padding:"10px 14px",marginBottom:"18px",
                display:"flex",alignItems:"center",gap:"8px",
              }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#93000a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                </svg>
                <span style={{fontSize:"13px",color:"#93000a",fontWeight:"500"}}>{error}</span>
              </div>
            )}

            {/* Nueva contraseña */}
            <div style={{marginBottom:"16px"}}>
              <div style={fieldWrap(f1)}>
                <div style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:f1?"#006d37":"#74777f",transition:"color 0.18s",display:"flex"}}>
                  <LockIcon color={f1?"#006d37":"#74777f"}/>
                </div>
                <label style={floatLabel(f1, nuevaPassword)}>Nueva contraseña</label>
                <input
                  type={showNew ? "text" : "password"}
                  value={nuevaPassword}
                  onChange={e => setNueva(e.target.value)}
                  onFocus={() => setF1(true)} onBlur={() => setF1(false)}
                  onKeyDown={onKeyDown}
                  style={inputBase(f1 || nuevaPassword, "48px")}
                  placeholder=""
                />
                <button type="button" onClick={() => setShowNew(p => !p)} style={{
                  position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",
                  color:"#74777f",padding:"4px",display:"flex",alignItems:"center",
                }}>
                  <EyeIcon open={showNew}/>
                </button>
              </div>
              <StrengthBar password={nuevaPassword}/>
            </div>

            {/* Confirmar contraseña */}
            <div style={{marginBottom:"22px"}}>
              <div style={{
                ...fieldWrap(f2),
                borderColor: confirmarPassword && nuevaPassword !== confirmarPassword
                  ? "#ba1a1a"
                  : confirmarPassword && nuevaPassword === confirmarPassword
                  ? "#006d37"
                  : f2 ? "#006d37" : "#c4c6cf",
              }}>
                <div style={{position:"absolute",left:"14px",top:"50%",transform:"translateY(-50%)",color:f2?"#006d37":"#74777f",transition:"color 0.18s",display:"flex"}}>
                  <LockIcon color={f2?"#006d37":"#74777f"}/>
                </div>
                <label style={floatLabel(f2, confirmarPassword)}>Confirmar contraseña</label>
                <input
                  type={showConf ? "text" : "password"}
                  value={confirmarPassword}
                  onChange={e => setConfirmar(e.target.value)}
                  onFocus={() => setF2(true)} onBlur={() => setF2(false)}
                  onKeyDown={onKeyDown}
                  style={inputBase(f2 || confirmarPassword, "48px")}
                  placeholder=""
                />
                <button type="button" onClick={() => setShowConf(p => !p)} style={{
                  position:"absolute",right:"14px",top:"50%",transform:"translateY(-50%)",
                  background:"none",border:"none",cursor:"pointer",
                  color:"#74777f",padding:"4px",display:"flex",alignItems:"center",
                }}>
                  <EyeIcon open={showConf}/>
                </button>
              </div>
              {/* Match indicator */}
              {confirmarPassword.length > 0 && (
                <div style={{display:"flex",alignItems:"center",gap:"5px",marginTop:"6px"}}>
                  {nuevaPassword === confirmarPassword ? (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#006d37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      <span style={{fontSize:"11px",color:"#006d37",fontWeight:"500"}}>Las contraseñas coinciden</span>
                    </>
                  ) : (
                    <>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#ba1a1a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                      </svg>
                      <span style={{fontSize:"11px",color:"#ba1a1a",fontWeight:"500"}}>No coinciden</span>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Botón */}
            <button
              type="button"
              onClick={actualizarPasswordDefinitiva}
              disabled={cargando || success}
              style={{
                width:"100%", height:"50px",
                background: (cargando||success) ? "#4ae183" : "linear-gradient(135deg,#006d37 0%,#008a45 100%)",
                color:"#ffffff", border:"none", borderRadius:"12px",
                fontSize:"15px", fontWeight:"600", fontFamily:"Inter,sans-serif",
                cursor: (cargando||success) ? "not-allowed" : "pointer",
                display:"flex", alignItems:"center", justifyContent:"center", gap:"8px",
                transition:"all 0.2s ease",
                boxShadow: (cargando||success) ? "none" : "0 4px 14px rgba(0,109,55,0.28)",
              }}
            >
              {cargando ? (
                <>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83">
                      <animateTransform attributeName="transform" type="rotate" from="0 12 12" to="360 12 12" dur="0.8s" repeatCount="indefinite"/>
                    </path>
                  </svg>
                  Guardando...
                </>
              ) : success ? (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  Contraseña actualizada
                </>
              ) : "Confirmar Nueva Contraseña"}
            </button>

            {/* Volver al login */}
            <button type="button" onClick={async () => { await supabase.auth.signOut(); alTerminar(); }} style={{
              width:"100%",marginTop:"12px",height:"40px",
              background:"none",border:"1.5px solid #c4c6cf",borderRadius:"12px",
              fontSize:"14px",fontWeight:"500",color:"#43474e",
              fontFamily:"Inter,sans-serif",cursor:"pointer",
              display:"flex",alignItems:"center",justifyContent:"center",gap:"6px",
              transition:"all 0.18s ease",
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#006d37"; e.currentTarget.style.color="#006d37"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#c4c6cf"; e.currentTarget.style.color="#43474e"; }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
              </svg>
              Volver al login
            </button>
          </div>

          <p style={{textAlign:"center",marginTop:"16px",fontSize:"12px",color:"#74777f"}}>
            © {new Date().getFullYear()} Facultad de Farmacia · Sistema de Gestión de Pasantías
          </p>
        </div>
      </div>

      <style>{`
        @media (min-width: 768px) { .left-panel { display: flex !important; } }
      `}</style>
    </div>
  );
}