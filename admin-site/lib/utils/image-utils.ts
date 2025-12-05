export async function convertImageToBase64(file: File) {
  return new Promise<string>((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result))
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

export async function fileToBase64(file: File) {
  return convertImageToBase64(file)
}

export default { convertImageToBase64, fileToBase64 }
