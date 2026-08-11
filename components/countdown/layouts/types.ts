import type { TimeParts, UnitKey, WidgetConfig } from '@/types/widget';

/**
 * Contrato comum dos layouts.
 *
 * Todo layout recebe exatamente os mesmos dados já calculados e resolvidos.
 * Nenhum deles lê a URL, calcula tempo ou decide unidades — isso mantém a
 * lógica em um lugar só e torna adicionar um novo layout uma tarefa puramente
 * visual.
 */
export interface LayoutProps {
  config: WidgetConfig;
  parts: TimeParts;
  units: UnitKey[];
}
