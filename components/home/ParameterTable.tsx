interface ParameterRow {
  name: string;
  values: string;
  description: string;
}

const PARAMETERS: readonly ParameterRow[] = [
  { name: 'target', values: '2027-05-15T16:00:00', description: 'Data-alvo. Único obrigatório.' },
  { name: 'timezone', values: 'America/Sao_Paulo', description: 'Fuso usado para ler a data.' },
  { name: 'title', values: 'texto', description: 'Título acima da contagem.' },
  { name: 'subtitle', values: 'texto', description: 'Linha de apoio.' },
  { name: 'emoji', values: '💍', description: 'Emoji exibido no topo.' },
  {
    name: 'layout',
    values: 'minimal · horizontal · cards · circular',
    description: 'Forma do widget.',
  },
  { name: 'theme', values: 'light · dark · auto', description: 'Auto segue o sistema.' },
  { name: 'size', values: 'small · medium · large', description: 'Escala tipográfica.' },
  {
    name: 'font',
    values: 'inter · poppins · manrope · geist · system',
    description: 'Família tipográfica.',
  },
  { name: 'skin', values: 'flat · glass · neon', description: 'Acabamento das caixas.' },
  {
    name: 'animation',
    values: 'fade · slide · flip · none',
    description: 'Transição a cada número.',
  },
  { name: 'color', values: 'ffffff', description: 'Cor base do texto, em hex.' },
  { name: 'numberColor · nc', values: 'ffffff', description: 'Cor só dos números.' },
  { name: 'titleColor · tc', values: 'ffffff', description: 'Cor só do título.' },
  { name: 'labelColor · lc', values: 'ffffff', description: 'Cor dos rótulos e do subtítulo.' },
  { name: 'background', values: 'transparent · 111111', description: 'Transparente por padrão.' },
  { name: 'radius', values: '0 a 48', description: 'Raio dos cantos, em px.' },
  {
    name: 'days · hours · minutes · seconds',
    values: 'true · false',
    description: 'Liga cada unidade.',
  },
  {
    name: 'labelDays · labelHours · labelMinutes · labelSeconds',
    values: 'texto',
    description: 'Rótulo de cada unidade.',
  },
  { name: 'endedText', values: 'texto', description: 'Mensagem ao chegar a data.' },
  { name: 'icons', values: 'true · false', description: 'Ícone junto de cada rótulo.' },
  {
    name: 'progress · from',
    values: 'true · data',
    description: 'Barra de progresso e sua origem.',
  },
];

/** Referência completa dos parâmetros aceitos pela URL. */
export function ParameterTable() {
  return (
    <section aria-labelledby="parametros">
      <h2 id="parametros" className="text-3xl font-semibold tracking-tight">
        Parâmetros
      </h2>
      <p className="text-ink-soft mt-3 max-w-xl text-sm leading-relaxed">
        Todos são opcionais, exceto <code className="font-mono">target</code>. Valores inválidos
        voltam ao padrão em vez de quebrar o embed.
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[42rem] border-collapse text-left text-sm">
          <thead>
            <tr className="border-rule text-ink-faint border-b text-xs tracking-wide uppercase">
              <th scope="col" className="py-3 pr-4 font-medium">
                Parâmetro
              </th>
              <th scope="col" className="py-3 pr-4 font-medium">
                Valores
              </th>
              <th scope="col" className="py-3 font-medium">
                Descrição
              </th>
            </tr>
          </thead>
          <tbody>
            {PARAMETERS.map((parameter) => (
              <tr key={parameter.name} className="border-rule/60 border-b align-top">
                <td className="text-ink py-3 pr-4 font-mono text-xs">{parameter.name}</td>
                <td className="text-ink-soft py-3 pr-4 font-mono text-xs">{parameter.values}</td>
                <td className="text-ink-soft py-3">{parameter.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
