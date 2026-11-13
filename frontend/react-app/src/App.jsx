import { useState } from 'react'
import './App.css'

function App() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  const cerrarMenu = () => setMenuAbierto(false)

  return (
    <>
      <header className="navbar">
        <a href="index.html" className="logo">
          <span className="logo-icon">N</span>
          <span>Nova<span className="logo-highlight">Fokus</span></span>
        </a>

        <nav className={`nav-links ${menuAbierto ? 'open' : ''}`} id="nav-links">
          <a href="#inicio" onClick={cerrarMenu}>Inicio</a>
          <a href="#nosotros" onClick={cerrarMenu}>Nosotros</a>
          <a href="#funciones" onClick={cerrarMenu}>Funciones</a>
        </nav>

        <div className="nav-actions">
          <a href="/login.html" className="btn-login">Iniciar sesión</a>
          <a href="/registro.html" className="btn-primary btn-small">Comenzar</a>
        </div>

        <button
          className="menu-toggle"
          id="menu-toggle"
          aria-label={menuAbierto ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={menuAbierto}
          onClick={() => setMenuAbierto(!menuAbierto)}
        >
          ☰
        </button>
      </header>

      <main>
        <section className="hero" id="inicio">
          <div className="hero-content">
            <span className="eyebrow">TU CAMINO COMIENZA AQUÍ</span>
            <h1>La grandeza no se encuentra.<span>Se construye.</span></h1>

            <p className="hero-description">
              Cada pequeño esfuerzo de hoy escribe la historia de quien
              serás mañana. Organiza tus objetivos, construye hábitos y
              descubre todo lo que puedes alcanzar.
            </p>

            <div className="hero-buttons">
              <a href="/registro.html" className="btn-primary">
                Comienza tu camino <span>→</span>
              </a>
              <a href="#nosotros" className="btn-secondary">
                Conoce NovaFokus
              </a>
            </div>

            <div className="hero-note">
              <span className="note-dot"></span>
              Tu crecimiento, a tu propio ritmo.
            </div>
          </div>

          <div className="hero-visual">
            <div className="visual-glow"></div>
            <div className="visual-card">
              <div className="visual-top">
                <div>
                  <span className="visual-label">TU PROGRESO</span>
                  <h3>Un día a la vez</h3>
                </div>
                <span className="visual-icon">✦</span>
              </div>

              <div className="progress-circle">
                <div className="progress-inner">
                  <strong>+</strong>
                  <span>Cada día cuenta</span>
                </div>
              </div>

              <div className="visual-bottom">
                <div><strong>Metas</strong><span>Define tu dirección</span></div>
                <div><strong>Hábitos</strong><span>Construye constancia</span></div>
                <div><strong>Enfoque</strong><span>Avanza con intención</span></div>
              </div>
            </div>

            <div className="floating-note note-one">
              <span>✦</span> Pequeños pasos, grandes cambios
            </div>
            <div className="floating-note note-two">
              Tu futuro empieza hoy.
            </div>
          </div>
        </section>

        <section className="about section" id="nosotros">
          <div className="section-heading">
            <span className="eyebrow">MÁS QUE PRODUCTIVIDAD</span>
            <h2>Un espacio para construir tu mejor versión.</h2>
            <p>
              NovaFokus reúne organización, productividad y crecimiento
              personal para ayudarte a transformar tus intenciones
              en acciones concretas.
            </p>
          </div>

          <div className="values-grid">
            <article className="value-card">
              <span className="card-number">01</span>
              <div className="value-icon">◎</div>
              <h3>Nuestra misión</h3>
              <p>
                Acompañarte en la construcción de tu mejor versión,
                transformando metas en acciones y hábitos en disciplina.
              </p>
            </article>

            <article className="value-card featured-card">
              <span className="card-number">02</span>
              <div className="value-icon">✧</div>
              <h3>Nuestra visión</h3>
              <p>
                Ser una plataforma que impulse el desarrollo personal
                y académico, ayudando a las personas a crecer con
                constancia y propósito.
              </p>
            </article>

            <article className="value-card">
              <span className="card-number">03</span>
              <div className="value-icon">↗</div>
              <h3>Nuestro propósito</h3>
              <p>
                Convertir cada pequeño esfuerzo diario en un paso
                significativo hacia la vida que deseas construir.
              </p>
            </article>
          </div>
        </section>

        <section className="features section" id="funciones">
          <div className="section-heading">
            <span className="eyebrow">TODO EN UN SOLO LUGAR</span>
            <h2>Herramientas para avanzar.</h2>
            <p>Organiza tu camino y trabaja en lo que realmente importa.</p>
          </div>

          <div className="features-grid">
            <article className="feature-card">
              <span className="feature-symbol">◎</span>
              <h3>Metas</h3>
              <p>Define objetivos y conviértelos en pasos alcanzables.</p>
            </article>
            <article className="feature-card">
              <span className="feature-symbol">✓</span>
              <h3>Hábitos</h3>
              <p>Construye constancia mediante pequeñas acciones.</p>
            </article>
            <article className="feature-card">
              <span className="feature-symbol">◷</span>
              <h3>Enfoque</h3>
              <p>Dedica tiempo a tus prioridades sin distracciones.</p>
            </article>
            <article className="feature-card">
              <span className="feature-symbol">↗</span>
              <h3>Progreso</h3>
              <p>Observa tus avances y reconoce lo que has conseguido.</p>
            </article>
            <article className="feature-card">
              <span className="feature-symbol">✧</span>
              <h3>Bienestar</h3>
              <p>Haz espacio para reconocer cómo te sientes.</p>
            </article>
            <article className="feature-card">
              <span className="feature-symbol">✳</span>
              <h3>NovaFokus AI</h3>
              <p>Un asistente para orientarte en tu proceso de crecimiento.</p>
            </article>
          </div>
        </section>

        <section className="final-cta">
          <span className="eyebrow">ES TU MOMENTO</span>
          <h2>No tienes que tenerlo todo resuelto.<br />Solo necesitas comenzar.</h2>
          <p>Construye tu camino, un pequeño paso a la vez.</p>
          <a href="/registro.html" className="btn-light">Crear mi cuenta →</a>
        </section>
      </main>

      <footer className="footer">
        <a href="index.html" className="logo">
          <span className="logo-icon">N</span>
          <span>Nova<span className="logo-highlight">Fokus</span></span>
        </a>
        <p>La grandeza se construye, un día a la vez.</p>
        <span>© 2026 NovaFokus. Todos los derechos reservados.</span>
      </footer>
    </>
  )
}

export default App

