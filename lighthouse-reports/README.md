# Lighthouse

Gerado em 2026-10-08T03:12:43.642Z com `npm run audit:lighthouse`, build otimizado e cenário de mock `default`. Cada valor abaixo é a mediana de 3 execuções independentes.

## Metas

- Performance: 95
- Accessibility: 95
- Best Practices: 95
- SEO: 95

## Medianas

| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | Todas as metas |
| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| Home | Mobile | 95 | 100 | 100 | 100 | 2.79 s | 0.000 | 19 ms | Sim |
| Home | Desktop | 98 | 100 | 100 | 100 | 1.08 s | 0.000 | 0 ms | Sim |
| Detalhe do NFT | Mobile | 96 | 100 | 100 | 100 | 2.64 s | 0.000 | 2 ms | Sim |
| Detalhe do NFT | Desktop | 100 | 100 | 100 | 100 | 0.78 s | 0.000 | 0 ms | Sim |

## Ambiente

- Lighthouse: 13.5.0
- Node.js: v24.16.0
- Sistema: win32 10.0.26200
- CPU: AMD Ryzen 9 5900X 12-Core Processor
- Memória total: 47.9 GB
- Chrome: Mozilla/5.0 (Linux; Android 11; moto g power (2022)) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/154.0.0.0 Mobile Safari/537.36
- Benchmark index: 2811.5

## Condições

- Build de produção servido por `vite preview` em `http://127.0.0.1:4174`.
- Armazenamento limpo pelo Lighthouse entre as execuções.
- Perfil mobile padrão do Lighthouse e preset desktop oficial.
- Auditorias executadas sequencialmente, sem extensões do navegador.
- Relatórios HTML e JSON de cada execução estão nesta pasta.
