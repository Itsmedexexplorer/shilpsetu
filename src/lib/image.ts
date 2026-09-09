/** Read an image file and return a square, downscaled data URL (keeps storage small). */
export function fileToAvatar(file: File, size = 256): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that image"));
    reader.onload = () => {
      const src = String(reader.result ?? "");
      const img = new Image();
      img.onerror = () => resolve(src);
      img.onload = () => {
        try {
          const canvas = document.createElement("canvas");
          canvas.width = size;
          canvas.height = size;
          const ctx = canvas.getContext("2d");
          if (!ctx) return resolve(src);
          const side = Math.min(img.width, img.height);
          ctx.drawImage(
            img,
            (img.width - side) / 2,
            (img.height - side) / 2,
            side,
            side,
            0,
            0,
            size,
            size,
          );
          resolve(canvas.toDataURL("image/jpeg", 0.82));
        } catch {
          resolve(src);
        }
      };
      img.src = src;
    };
    reader.readAsDataURL(file);
  });
}
