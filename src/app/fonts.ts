import { JetBrains_Mono, Outfit } from 'next/font/google'

// Variable font (single wght axis): one file covers every weight used.
export const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  preload: false,
})

export const fontVariables = `${outfit.variable} ${jetbrains.variable}`
