export default function SchoolTopbar() {
  return (
    <div style={{
      background: '#111',
      borderBottom: '1px solid rgba(212,175,55,.2)',
      padding: '7px 0',
      fontSize: '.78rem',
      fontWeight: 600,
      color: 'rgba(255,255,255,.6)',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 99999,
    }}>
      <div style={{
        maxWidth: 1200,
        margin: '0 auto',
        padding: '0 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <a href="tel:+34914719959" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>
            📞 91 471 99 59
          </a>
          <a href="mailto:secretaria@colegionsdolores.es" style={{ color: 'rgba(255,255,255,.5)', textDecoration: 'none' }}>
            ✉️ secretaria@colegionsdolores.es
          </a>
        </div>
        <span style={{
          background: 'rgba(212,175,55,.12)',
          border: '1px solid rgba(212,175,55,.25)',
          color: '#D4AF37',
          fontSize: '.72rem',
          fontWeight: 700,
          letterSpacing: '.08em',
          textTransform: 'uppercase',
          padding: '3px 12px',
          borderRadius: 99,
        }}>
          🏫 Parte del{' '}
          <a
            href="https://www.colegionsdolores.es/"
            style={{ color: '#D4AF37', textDecoration: 'none', fontWeight: 800 }}
          >
            Colegio NSD
          </a>
        </span>
      </div>
    </div>
  );
}
