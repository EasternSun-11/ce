/** 环境变量（Vite 注入，见项目根目录 .env.*） */
export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || ''

export const useMock =
  import.meta.env.VITE_USE_MOCK === 'true' ||
  import.meta.env.VITE_USE_MOCK === '1'

export const isDev = import.meta.env.DEV
