import { ImageResponse } from 'next/og';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

export const alt = `${SITE_NAME} — contagem regressiva para o Notion`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Imagem social gerada no build pelo `next/og`.
 * Usa apenas fontes do sistema do runtime — nenhum arquivo extra a baixar.
 */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        backgroundColor: '#faf8f5',
        color: '#16130f',
        padding: 80,
        fontFamily: 'sans-serif',
      }}
    >
      <div style={{ display: 'flex', fontSize: 26, letterSpacing: 6, color: '#c2410c' }}>
        WIDGET PARA NOTION
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        <div style={{ display: 'flex', fontSize: 104, fontWeight: 700, letterSpacing: -3 }}>
          {SITE_NAME}
        </div>
        <div style={{ display: 'flex', fontSize: 30, color: '#5c554c', maxWidth: 880 }}>
          {SITE_DESCRIPTION}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 48, fontSize: 34, color: '#16130f' }}>
        {['458 Dias', '12 Horas', '35 Min', '41 Seg'].map((item) => (
          <div
            key={item}
            style={{
              display: 'flex',
              border: '1px solid #e2dbd1',
              borderRadius: 18,
              padding: '18px 28px',
            }}
          >
            {item}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
