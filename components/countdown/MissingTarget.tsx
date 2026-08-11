/**
 * Estado exibido quando a URL não traz uma data válida.
 *
 * Um embed em branco seria indistinguível de um bug do Notion; a mensagem
 * aponta exatamente o parâmetro que falta.
 */
export function MissingTarget() {
  return (
    <div className="flex flex-col items-center gap-1 text-center opacity-70">
      <p className="font-medium" style={{ fontSize: 'var(--cd-title-size)' }}>
        Nenhuma data definida
      </p>
      <p className="cd-subtitle">
        Adicione <code>?target=2027-05-15T16:00:00</code> à URL
      </p>
    </div>
  );
}
