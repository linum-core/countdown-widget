interface WidgetHeaderProps {
  emoji: string;
  title: string;
  subtitle: string;
  /** No layout horizontal o cabeçalho fica numa linha só, junto do contador. */
  inline?: boolean;
}

/** Emoji, título e subtítulo. Não renderiza nada quando os três estão vazios. */
export function WidgetHeader({ emoji, title, subtitle, inline = false }: WidgetHeaderProps) {
  if (!emoji && !title && !subtitle) return null;

  if (inline) {
    return (
      <div className="flex items-baseline justify-center gap-2">
        {emoji ? (
          <span role="img" aria-hidden="true" style={{ fontSize: 'var(--cd-title-size)' }}>
            {emoji}
          </span>
        ) : null}
        {title ? <span className="cd-title">{title}</span> : null}
        {subtitle ? <span className="cd-subtitle">{subtitle}</span> : null}
      </div>
    );
  }

  return (
    <header className="flex flex-col items-center gap-1 text-center">
      {emoji ? (
        <span
          role="img"
          aria-hidden="true"
          className="leading-none"
          style={{ fontSize: 'calc(var(--cd-title-size) * 1.35)' }}
        >
          {emoji}
        </span>
      ) : null}
      {title ? <h1 className="cd-title text-balance">{title}</h1> : null}
      {subtitle ? <p className="cd-subtitle text-balance">{subtitle}</p> : null}
    </header>
  );
}
