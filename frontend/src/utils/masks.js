export const maskCPF = (v = '') => {
  v = v.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d)/, '$1.$2');
  v = v.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  return v;
};

export const maskCNPJ = (v = '') => {
  v = v.replace(/\D/g, '').slice(0, 14);
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})(\d)/, '.$1/$2');
  v = v.replace(/(\d{4})(\d)/, '$1-$2');
  return v;
};

export const maskRG = (v = '') => {
  // Permite letras apenas no último dígito (X)
  v = v.replace(/[^0-9Xx]/g, '').slice(0, 9);
  v = v.replace(/^(\d{2})(\d)/, '$1.$2');
  v = v.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  v = v.replace(/\.(\d{3})([0-9Xx])$/, '.$1-$2');
  return v;
};

export const maskCelular = (v = '') => {
  v = v.replace(/\D/g, '').slice(0, 11);
  v = v.replace(/^(\d{2})(\d)/, '($1) $2');
  v = v.replace(/(\d{5})(\d{1,4})$/, '$1-$2');
  return v;
};

export const maskTelefone = (v = '') => {
  v = v.replace(/\D/g, '').slice(0, 10);
  v = v.replace(/^(\d{2})(\d)/, '($1) $2');
  v = v.replace(/(\d{4})(\d{1,4})$/, '$1-$2');
  return v;
};

export const maskCEP = (v = '') => {
  v = v.replace(/\D/g, '').slice(0, 8);
  v = v.replace(/^(\d{5})(\d)/, '$1-$2');
  return v;
};

/**
 * Comprime uma imagem (dataURL) para JPEG com qualidade reduzida.
 * @param {string} dataUrl  - Imagem original em base64/dataURL
 * @param {number} quality  - 0 a 1 (padrão: 0.6)
 * @param {number} maxWidth - Largura máxima em px (padrão: 1200)
 * @returns {Promise<string>} dataURL comprimida
 */
export const compressImage = (dataUrl, quality = 0.6, maxWidth = 1200) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const ratio = Math.min(maxWidth / img.width, 1);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => resolve(dataUrl); // fallback sem compressão
    img.src = dataUrl;
  });
};

export const resizeLogoTo100 = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        canvas.width = 100;
        canvas.height = 100;
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, 100, 100);
        // centraliza crop quadrado
        const size = Math.min(img.width, img.height);
        const sx = (img.width - size) / 2;
        const sy = (img.height - size) / 2;
        ctx.drawImage(
          img,
          sx,
          sy,
          size,
          size,
          0,
          0,
          100,
          100
        );
        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.onerror = reject;
      img.src = reader.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};
