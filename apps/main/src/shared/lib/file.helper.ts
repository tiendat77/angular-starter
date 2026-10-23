export class FileHelper {
  static rename(original: File, name: string) {
    const extension = original.name.split('.').pop();
    return new File([original], `${name}.${extension}`, {
      type: original.type,
      lastModified: original.lastModified,
    });
  }

  static fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader?.result as string);
      reader.onerror = (error) => reject(error);
    });
  }

  static dataURLtoFile(dataUrl: string, filename: string) {
    const arr = dataUrl.split(',');
    const mime = arr[0]?.match(/:(.*?);/)?.[1];
    const bstr = atob(arr[arr.length - 1]);
    const uint8Array = new Uint8Array(bstr.length);

    let n = bstr.length;
    while (n--) {
      uint8Array[n] = bstr.charCodeAt(n);
    }

    return new File([uint8Array], filename, { type: mime });
  }

  /** Saves the blob as a file through a temporary link. */
  static download(blob: Blob, fileName: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = fileName;
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, view: window }));

    setTimeout(() => {
      URL.revokeObjectURL(url);
      link.remove();
    }, 100);
  }
}
