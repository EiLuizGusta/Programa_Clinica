/**
 * Hook simples para detectar posição de clique em imagem (X% e Y%)
 */
export function useDetectImagePosition() {
  const detectPosition = (event) => {
    const img = event.currentTarget;
    const rect = img.getBoundingClientRect();

    // Posição do clique relativa à imagem
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;

    // Garantir limites 0-100%
    const xPercent = Math.max(0, Math.min(100, x));
    const yPercent = Math.max(0, Math.min(100, y));

    console.log(`📍 Posição detectada: X: ${xPercent.toFixed(2)}% | Y: ${yPercent.toFixed(2)}%`);

    return { x: xPercent, y: yPercent };
  };

  return { detectPosition };
}
