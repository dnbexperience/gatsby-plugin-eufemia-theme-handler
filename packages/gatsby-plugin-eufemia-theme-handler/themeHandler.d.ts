import type { ThemeNames, ThemeProps } from '@dnb/eufemia/shared/Theme'
type PropMapping = string
export type ThemesItem = {
  file: string
  hide?: boolean
  isDev?: boolean
} & ThemeProps
export type Themes = Array<ThemesItem>
export const getThemes = (): Themes => null
export const isValidTheme = (): boolean => null
export const getTheme = (): ThemesItem => null
export const useThemeHandler = (): ThemesItem => null
const callback = () => null
export const setTheme = (
  props: { name?: string; propMapping?: PropMapping },
  callback = null
): void => null
