import { normalizeReading } from '@/domain/reading'

export async function requestReading(endpoint: string, prompt: { system: string; user: string }) {
  if (!/^https:\/\//.test(endpoint)) throw new Error('尚未配置 HTTPS 解读接口')
  const response = await uni.request({
    url: endpoint, method: 'POST', header: { 'content-type': 'application/json' },
    data: prompt, timeout: 20000
  })
  if (response.statusCode < 200 || response.statusCode >= 300) throw new Error(`解读接口返回 ${response.statusCode}`)
  return normalizeReading(response.data)
}
