export const filesGlobsFallback = [
  '**/style/dnb-ui-core.min.css',
  '**/style/themes/**/*-theme-{basis,components}.min.css',
]

export const includeFilesFallback = [
  '**/dnb-ui-core.*',
  '**/*-theme-components.*',
  '**/*-theme-basis.*',
]

export const themeMatchersFallback = [/\/themes\/[^/]*theme-([^/.]*)[/.]/]
