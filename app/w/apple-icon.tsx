import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Ícone do widget instalado na tela de início do iOS.
 *
 * O `icon.svg` da raiz não serve aqui: o iOS não aceita SVG como
 * `apple-touch-icon` e, sem PNG, cai num print da página. Gerado no build pelo
 * `next/og`, como a imagem social — nenhum binário no repositório.
 */
export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        /* Fundo opaco: o iOS mascara o ícone e não respeita transparência. */
        backgroundColor: '#16130f',
        color: '#faf8f5',
        fontFamily: 'serif',
      }}
    >
      {/* Relógio: o anel, o ponteiro das horas e o dos minutos, em acento. */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          width: 124,
          height: 124,
          borderRadius: 999,
          border: '9px solid #faf8f5',
        }}
      >
        <div
          style={{
            position: 'absolute',
            width: 9,
            height: 40,
            borderRadius: 999,
            backgroundColor: '#c2410c',
            transform: 'translateY(-20px)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            width: 9,
            height: 30,
            borderRadius: 999,
            backgroundColor: '#c2410c',
            transform: 'translateX(15px) rotate(90deg)',
          }}
        />
      </div>
    </div>,
    size,
  );
}
