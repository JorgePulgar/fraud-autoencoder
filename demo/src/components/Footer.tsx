const GITHUB_USER = 'jpulgar111'
const REPO = `https://github.com/${GITHUB_USER}/fraud-autoencoder`

export default function Footer() {
  return (
    <footer className="mt-12 border-t border-border bg-card px-6 py-8">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Spanish blurb */}
        <p className="font-mono text-xs text-muted-foreground leading-relaxed max-w-2xl">
          Este proyecto es una demostración de detección de fraude bancario mediante un autoencoder
          no supervisado, entrenado sobre datos públicos de Kaggle. El modelo corre íntegramente
          en el navegador, sin enviar ningún dato a servidores externos. Desarrollado como proyecto
          de portafolio por Jorge Pulgar, Ingeniero de IA — Madrid.
        </p>

        {/* Links */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs">
          <a
            href={`${REPO}#readme`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            v1 README ↗
          </a>
          <a
            href={`${REPO}/blob/main/DEVLOG.md`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            DEVLOG ↗
          </a>
          <a
            href={`${REPO}/blob/main/LICENSE`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            MIT License ↗
          </a>
          <a
            href={`https://github.com/${GITHUB_USER}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            GitHub ↗
          </a>
          <a
            href="mailto:jpulgar111@gmail.com"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            jpulgar111@gmail.com
          </a>
        </div>
      </div>
    </footer>
  )
}
