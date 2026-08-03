'use client';

import { useCallback, useEffect, useLayoutEffect, useState } from 'react';

export type TourStep = {
  id: string;
  titulo: string;
  descricao: string;
  /** Valor do atributo data-tour="..." do elemento a destacar. Ausente = passo centralizado (ex: boas-vindas). */
  target?: string;
  /** Onde o tooltip aparece em relação ao alvo. Padrão: 'bottom'. */
  posicao?: 'bottom' | 'top' | 'left' | 'right';
};

type Rect = { top: number; left: number; width: number; height: number };

const PADDING = 8;
const LARGURA_TOOLTIP = 320;

export default function Tour({ steps, storageKey }: { steps: TourStep[]; storageKey: string }) {
  const [ativo, setAtivo] = useState(false);
  const [indice, setIndice] = useState(0);
  const [rect, setRect] = useState<Rect | null>(null);

  useEffect(() => {
    if (!localStorage.getItem(storageKey)) setAtivo(true);
  }, [storageKey]);

  const passo = steps[indice];

  const atualizarRect = useCallback(() => {
    if (!passo?.target) { setRect(null); return; }
    const el = document.querySelector(`[data-tour="${passo.target}"]`);
    if (!el) { setRect(null); return; }
    const r = el.getBoundingClientRect();
    setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
  }, [passo]);

  useLayoutEffect(() => {
    if (!ativo) return;
    atualizarRect();
    window.addEventListener('resize', atualizarRect);
    window.addEventListener('scroll', atualizarRect, true);
    return () => {
      window.removeEventListener('resize', atualizarRect);
      window.removeEventListener('scroll', atualizarRect, true);
    };
  }, [ativo, atualizarRect]);

  // Se o alvo do passo atual não existir na tela (ex: componente ainda não
  // construído), pula esse passo sozinho em vez de travar o tour.
  useEffect(() => {
    if (!ativo || !passo) return;
    if (passo.target && !document.querySelector(`[data-tour="${passo.target}"]`)) {
      if (indice < steps.length - 1) setIndice((i) => i + 1);
      else finalizar();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ativo, indice]);

  function finalizar() {
    localStorage.setItem(storageKey, '1');
    setAtivo(false);
  }
  function proximo() {
    if (indice >= steps.length - 1) finalizar();
    else setIndice((i) => i + 1);
  }
  function voltar() {
    setIndice((i) => Math.max(0, i - 1));
  }

  if (!ativo || !passo) return null;

  const posicao = passo.posicao ?? 'bottom';
  let tooltipStyle: React.CSSProperties = { position: 'fixed', zIndex: 10001, width: LARGURA_TOOLTIP };

  if (!rect) {
    tooltipStyle = { ...tooltipStyle, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' };
  } else {
    const topBase = rect.top + rect.height + PADDING + 8;
    const bottomBase = window.innerHeight - (rect.top - PADDING - 8);
    const leftBase = posicao === 'right' ? rect.left + rect.width + PADDING + 8
      : posicao === 'left' ? rect.left - PADDING - 8 - LARGURA_TOOLTIP
      : rect.left;

    tooltipStyle = {
      ...tooltipStyle,
      top: posicao === 'top' ? undefined : topBase,
      bottom: posicao === 'top' ? bottomBase : undefined,
      left: Math.min(Math.max(leftBase, 16), window.innerWidth - LARGURA_TOOLTIP - 16),
    };
  }

  return (
    <>
      {/* Overlay escuro com "furo" no elemento destacado (box-shadow gigante) */}
      <div style={{ position: 'fixed', inset: 0, zIndex: 10000, pointerEvents: 'none' }}>
        {rect ? (
          <div
            style={{
              position: 'fixed',
              top: rect.top - PADDING,
              left: rect.left - PADDING,
              width: rect.width + PADDING * 2,
              height: rect.height + PADDING * 2,
              borderRadius: 10,
              boxShadow: '0 0 0 9999px rgba(6,9,30,0.8)',
              border: '2px solid var(--accent2)',
              transition: 'top .2s ease, left .2s ease, width .2s ease, height .2s ease',
            }}
          />
        ) : (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(6,9,30,0.8)' }} />
        )}
      </div>

      <div
        style={{
          ...tooltipStyle,
          background: 'var(--bg-card)',
          border: '1px solid var(--border)',
          borderRadius: 14,
          padding: 20,
          boxShadow: '0 20px 50px rgba(0,0,0,.5)',
          pointerEvents: 'auto',
        }}
      >
        <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--accent2)', letterSpacing: '.06em', textTransform: 'uppercase', marginBottom: 8 }}>
          Passo {indice + 1} de {steps.length}
        </div>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{passo.titulo}</div>
        <div style={{ fontSize: 13, color: 'var(--text2)', lineHeight: 1.5, marginBottom: 18 }}>{passo.descricao}</div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {steps.map((_, i) => (
              <span
                key={i}
                style={{
                  width: i === indice ? 20 : 6,
                  height: 6,
                  borderRadius: 3,
                  background: i === indice ? 'var(--accent2)' : 'rgba(255,255,255,.15)',
                  transition: 'width .2s',
                }}
              />
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button onClick={finalizar} style={{ background: 'none', border: 'none', color: 'var(--text2)', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
              Pular
            </button>
            {indice > 0 && (
              <button className="btn btn-ghost btn-sm" onClick={voltar}>← Voltar</button>
            )}
            <button className="btn btn-primary btn-sm" onClick={proximo}>
              {indice === steps.length - 1 ? 'Concluir ✓' : 'Próximo →'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}