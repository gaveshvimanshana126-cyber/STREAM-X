// Canvas-based dominant color extraction utility matching index (45).html
export const extractDominantColor = (imgUrl, callback) => {
  if (!imgUrl) {
    callback(null);
    return;
  }

  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.onload = () => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 16;
      canvas.height = 16;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, 16, 16);
      const data = ctx.getImageData(0, 0, 16, 16).data;

      let r = 0, g = 0, b = 0, count = 0;
      for (let i = 0; i < data.length; i += 4) {
        const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
        if (brightness < 15 || brightness > 240) continue;
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
        count++;
      }

      if (count === 0) {
        callback(null);
        return;
      }

      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);

      // Boost saturation
      const avg = (r + g + b) / 3;
      const sat = 1.8;
      r = Math.min(255, Math.round(avg + (r - avg) * sat));
      g = Math.min(255, Math.round(avg + (g - avg) * sat));
      b = Math.min(255, Math.round(avg + (b - avg) * sat));

      // Darken to cinematic level
      r = Math.round(r * 0.38);
      g = Math.round(g * 0.38);
      b = Math.round(b * 0.38);

      callback(`${r},${g},${b}`);
    } catch (e) {
      callback(null);
    }
  };

  img.onerror = () => callback(null);
  img.src = imgUrl;
};
