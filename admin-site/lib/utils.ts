import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Standard shadcn contract: resolve conditional classes (clsx) and let later
// Tailwind utilities win over earlier conflicting ones (tailwind-merge) so
// component `className` overrides actually take effect.
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader()
    r.onload = () => res(String(r.result))
    r.onerror = rej
    r.readAsDataURL(file)
  })
}

export default { cn, fileToBase64 }
