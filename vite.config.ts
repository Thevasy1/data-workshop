import { defineConfig } from 'vite'
import type { Plugin } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'
import { matchMockRule } from './src/mock/index'

// 自定义 Mock 中间件（替代 vite-plugin-mock，兼容 Vite 5）
function mockPlugin(): Plugin {
  return {
    name: 'vite-mock-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url || ''
        const method = req.method || 'GET'

        // 只拦截 /api/ 开头的请求，其余交给 Vite 处理
        if (!url.startsWith('/api/')) {
          return next()
        }

        const matched = matchMockRule(url.split('?')[0], method)
        if (!matched) {
          res.statusCode = 404
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ code: 404, data: null, message: `未找到 mock 匹配：${method} ${url}` }))
          return
        }

        try {
          // 解析 POST/PUT body
          let body: any = undefined
          if (method === 'POST' || method === 'PUT') {
            const chunks: Buffer[] = []
            for await (const chunk of req as any) {
              if (chunk instanceof Buffer) chunks.push(chunk)
            }
            const raw = Buffer.concat(chunks).toString('utf-8')
            if (raw) body = JSON.parse(raw)
          }

          // 解析 query
          const query: Record<string, string> = {}
          const qIdx = url.indexOf('?')
          if (qIdx > -1) {
            new URLSearchParams(url.slice(qIdx + 1)).forEach((val, key) => { query[key] = val })
          }

          const result = matched.rule.handler({ query, params: matched.params, body })
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify(result))
        } catch (e: any) {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ code: 500, data: null, message: e.message || 'Mock 内部错误' }))
        }
      })
    },
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), mockPlugin()],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
})
