import { FAQ } from './faq-content';

/**
 * Perguntas frequentes.
 *
 * `<details>` nativo em vez de acordeão em JavaScript: abre sem hidratação, é
 * navegável por teclado de graça e — o que importa aqui — o conteúdo fechado
 * continua no HTML, então o buscador lê todas as respostas.
 */
export function Faq() {
  return (
    <section aria-labelledby="perguntas">
      <h2 id="perguntas" className="text-3xl font-semibold tracking-tight">
        Perguntas frequentes
      </h2>

      <div className="mt-8 flex flex-col">
        {FAQ.map((entry) => (
          <details key={entry.question} className="border-rule group border-t py-5">
            <summary className="text-ink flex cursor-pointer list-none items-start justify-between gap-6 text-base font-medium marker:content-none">
              <h3 className="text-balance">{entry.question}</h3>
              <span
                aria-hidden="true"
                className="text-ink-faint mt-1 shrink-0 transition-transform group-open:rotate-45"
              >
                +
              </span>
            </summary>
            <p className="text-ink-soft mt-3 max-w-3xl text-base leading-relaxed text-pretty">
              {entry.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
