export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read audio file."));
        return;
      }
      const base64 = result.split(",")[1];
      if (!base64) {
        reject(new Error("Could not encode audio."));
        return;
      }
      resolve(base64);
    };
    reader.onerror = () => reject(new Error("Could not read audio file."));
    reader.readAsDataURL(blob);
  });
}
