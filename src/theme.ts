export type ThemeName = '爱情' | '事业' | '财富'
export const themes: ThemeName[] = ['爱情', '事业', '财富']
export const themeKey: Record<ThemeName, string> = { 爱情: 'love', 事业: 'career', 财富: 'wealth' }
export const themeCharacter: Record<ThemeName, { name: string; line: string; checkIcon: string }> = {
  爱情: { name: '阿绯', line: '把心事放在这里，慢慢说。', checkIcon: 'love-checkin-rose' },
  事业: { name: '阿衡', line: '下一步，我们一起想。', checkIcon: 'career-checkin-star' },
  财富: { name: '小金', line: '把想法理清，日子会更稳。', checkIcon: 'wealth-checkin-coin' }
}
export function safeTheme(value: string | undefined): ThemeName { return themes.includes(value as ThemeName) ? value as ThemeName : '爱情' }
export const ui = (path: string) => `/static/ui/${path}.webp`
// Vite serves source files under /src in H5 development. Uni-app copies subpackage
// static files to /subpages in production H5 and both WeChat build modes.
let subpageRoot = '/subpages'
// #ifdef H5
if (import.meta.env.DEV) subpageRoot = '/src/subpages'
// #endif
export const themeUi = (path: string) => `${subpageRoot}/theme/static/ui/${path}.webp`
export const cardImage = (id: string) => `${subpageRoot}/tarot/static/cards/${id}.webp`
