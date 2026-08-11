interface EndedMessageProps {
  emoji: string;
  text: string;
}

/**
 * Mensagem exibida quando o alvo é atingido.
 *
 * `aria-live="assertive"` é seguro aqui porque a mensagem aparece uma única vez
 * — ao contrário dos dígitos, que mudam a cada segundo e por isso não são
 * anunciados.
 */
export function EndedMessage({ emoji, text }: EndedMessageProps) {
  return (
    <div className="flex flex-col items-center gap-2 text-center" aria-live="assertive">
      {emoji ? (
        <span
          role="img"
          aria-hidden="true"
          className="leading-none"
          style={{ fontSize: 'calc(var(--cd-title-size) * 1.6)' }}
        >
          {emoji}
        </span>
      ) : null}
      {/*
        A mensagem escala com o título, não com os dígitos: um texto livre no
        tamanho do contador estouraria a altura de qualquer bloco pequeno.
      */}
      <p
        className="font-medium tracking-tight text-balance"
        style={{ fontSize: 'calc(var(--cd-title-size) * 1.2)' }}
      >
        {text}
      </p>
    </div>
  );
}
