/**
 * Perguntas frequentes.
 *
 * Vivem fora do componente porque servem a dois consumidores: a seção visível e
 * o `FAQPage` em JSON-LD. Duplicar o texto nos dois lugares seria, além de
 * trabalho repetido, uma violação de dados estruturados — o Google exige que a
 * marcação descreva exatamente o que está na página.
 */
export interface FaqEntry {
  question: string;
  answer: string;
}

export const FAQ: readonly FaqEntry[] = [
  {
    question: 'Como colocar uma contagem regressiva no Notion?',
    answer:
      'Monte a contagem no gerador desta página, copie a URL que aparece na aba Notion, digite /embed em uma página do Notion e cole. O bloco de embed aceita apenas uma URL: colar o código <iframe> ali vira texto literal, e um arquivo enviado vira anexo.',
  },
  {
    question: 'Precisa criar conta ou pagar?',
    answer:
      'Não. Não há cadastro, login, plano pago nem limite de contagens. Toda a configuração viaja na própria URL, então não existe conta a criar nem dado a guardar — o site não usa cookies, não rastreia e não faz chamadas a serviços externos.',
  },
  {
    question: 'Por que o widget aparece claro no Notion escuro?',
    answer:
      'Dentro de um iframe de outra origem não há como saber o tema da página que hospeda: o Notion não envia esse dado, e a preferência de cor do sistema responde pelo aparelho de quem lê, não pelo Notion. Use theme=neutral, cuja paleta foi calibrada para ficar legível tanto sobre fundo claro quanto sobre fundo escuro.',
  },
  {
    question: 'Dá para contar meses, e não só dias?',
    answer:
      'Sim, com o parâmetro months=true. A contagem usa meses de calendário de verdade, não blocos de 30 dias: de 1º de fevereiro a 1º de março é um mês, e de 1º de março a 1º de abril também, ainda que tenham três dias de diferença. Os dias restantes vão para a caixa seguinte.',
  },
  {
    question: 'Funciona fora do Notion?',
    answer:
      'Sim. A aba "Outros sites" entrega um código <iframe> para colar em qualquer página HTML, e também um arquivo .html pronto. A mesma URL ainda pode ser instalada como aplicativo na tela de início do iPhone ou no Dock do macOS.',
  },
  {
    question: 'A contagem fica certa em qualquer fuso horário?',
    answer:
      'Fica. Escolha o fuso no gerador e a data passa a ser interpretada sempre naquele fuso, para qualquer pessoa que abrir o link. Sem fuso escolhido, a data vale no fuso de quem estiver vendo — útil para eventos locais como a virada do ano.',
  },
] as const;
