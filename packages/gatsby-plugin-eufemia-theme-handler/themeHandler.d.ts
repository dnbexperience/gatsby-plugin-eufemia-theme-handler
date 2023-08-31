type PropMapping = string
export type ThemesItem = {
  name: string
  file: string
  hide?: boolean
  isDev?: boolean
  propMapping: PropMapping
}
export type Themes = Array<ThemesItem>
export const getThemes = (): Themes => null
export const isValidTheme = (): boolean => null
export const getTheme = (): ThemesItem => null
export const useTheme = (): ThemesItem => null
const callback = () => null
export const setTheme = (
  props: { name?: string; propMapping?: PropMapping },
  callback = null
): void => null
