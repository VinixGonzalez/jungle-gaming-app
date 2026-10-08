import { spawn } from "node:child_process"
import { cpus, freemem, platform, release, totalmem } from "node:os"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"
import { mkdir, readFile, rm, writeFile } from "node:fs/promises"

import config from "./config.mjs"

const scriptDirectory = dirname(fileURLToPath(import.meta.url))
const projectDirectory = resolve(scriptDirectory, "../..")
const reportsDirectory = resolve(projectDirectory, config.reportsDirectory)
const lighthouseCli = resolve(
  projectDirectory,
  "node_modules/lighthouse/cli/index.js",
)
const viteCli = resolve(projectDirectory, "node_modules/vite/bin/vite.js")

function delay(milliseconds) {
  return new Promise((resolveDelay) => setTimeout(resolveDelay, milliseconds))
}

function runCommand(command, args) {
  return new Promise((resolveCommand, rejectCommand) => {
    const child = spawn(command, args, {
      cwd: projectDirectory,
      stdio: "inherit",
    })

    child.once("error", rejectCommand)
    child.once("exit", (code) => {
      if (code === 0) {
        resolveCommand()
        return
      }

      rejectCommand(new Error(`Command exited with code ${code ?? "unknown"}.`))
    })
  })
}

async function waitForPreview(preview) {
  await delay(300)

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (preview.exitCode !== null) {
      throw new Error(
        `Vite preview exited before becoming ready (code ${preview.exitCode}).`,
      )
    }

    try {
      const response = await fetch(config.baseUrl)

      if (response.ok) return
    } catch {
      // The preview can refuse connections briefly while it starts.
    }

    await delay(250)
  }

  throw new Error(`Vite preview did not respond at ${config.baseUrl}.`)
}

function median(values) {
  const sortedValues = [...values].sort((left, right) => left - right)
  return sortedValues[Math.floor(sortedValues.length / 2)]
}

function getScores(report) {
  return Object.fromEntries(
    config.categories.map((category) => [
      category,
      report.categories[category].score,
    ]),
  )
}

function getMetrics(report) {
  return {
    cls: report.audits["cumulative-layout-shift"].numericValue,
    lcp: report.audits["largest-contentful-paint"].numericValue,
    tbt: report.audits["total-blocking-time"].numericValue,
  }
}

async function runAudit(page, profile, run) {
  const reportName = `${page.id}-${profile.id}-run-${run}`
  const outputPath = join(reportsDirectory, reportName)
  const args = [
    lighthouseCli,
    new URL(page.path, config.baseUrl).href,
    "--quiet",
    "--chrome-flags=--headless --no-sandbox",
    `--only-categories=${config.categories.join(",")}`,
    "--output=html",
    "--output=json",
    `--output-path=${outputPath}`,
  ]

  if (profile.preset) args.push(`--preset=${profile.preset}`)

  console.log(
    `Auditing ${page.label} / ${profile.label} (${run}/${config.runs})...`,
  )
  await runCommand(process.execPath, args)

  const jsonPath = `${outputPath}.report.json`
  const report = JSON.parse(await readFile(jsonPath, "utf8"))

  return {
    page: page.id,
    profile: profile.id,
    run,
    scores: getScores(report),
    metrics: getMetrics(report),
    reports: {
      html: relative(projectDirectory, `${outputPath}.report.html`).replaceAll(
        "\\",
        "/",
      ),
      json: relative(projectDirectory, jsonPath).replaceAll("\\", "/"),
    },
    runtime: {
      benchmarkIndex: report.environment.benchmarkIndex,
      hostUserAgent: report.environment.hostUserAgent,
      lighthouseVersion: report.lighthouseVersion,
      userAgent: report.environment.networkUserAgent,
    },
    settings: report.configSettings,
  }
}

function summarizeAudits(audits) {
  return config.pages.flatMap((page) =>
    config.profiles.map((profile) => {
      const matchingAudits = audits.filter(
        (audit) => audit.page === page.id && audit.profile === profile.id,
      )
      const scores = Object.fromEntries(
        config.categories.map((category) => [
          category,
          median(matchingAudits.map((audit) => audit.scores[category])),
        ]),
      )
      const metrics = Object.fromEntries(
        ["lcp", "cls", "tbt"].map((metric) => [
          metric,
          median(matchingAudits.map((audit) => audit.metrics[metric])),
        ]),
      )

      return {
        page: page.id,
        pageLabel: page.label,
        profile: profile.id,
        profileLabel: profile.label,
        scores,
        metrics,
        targetsMet: Object.entries(config.thresholds).every(
          ([category, threshold]) => scores[category] >= threshold,
        ),
      }
    }),
  )
}

function formatScore(score) {
  return Math.round(score * 100).toString()
}

function formatMarkdown(summary) {
  const rows = summary.medians
    .map(
      (result) =>
        `| ${result.pageLabel} | ${result.profileLabel} | ${formatScore(result.scores.performance)} | ${formatScore(result.scores.accessibility)} | ${formatScore(result.scores["best-practices"])} | ${formatScore(result.scores.seo)} | ${(result.metrics.lcp / 1_000).toFixed(2)} s | ${result.metrics.cls.toFixed(3)} | ${Math.round(result.metrics.tbt)} ms | ${result.targetsMet ? "Sim" : "Não"} |`,
    )
    .join("\n")
  const mobileBelowTarget = summary.medians.some(
    (result) =>
      result.profile === "mobile" &&
      result.scores.performance < config.thresholds.performance,
  )
  const limitation = mobileBelowTarget
    ? `\n## Resultado abaixo da meta\n\nAo menos uma mediana mobile ficou abaixo da meta de 95. Consulte os relatórios individuais para analisar LCP, CLS e TBT antes de considerar a auditoria aprovada.\n`
    : ""

  return `# Lighthouse\n\nGerado em ${summary.generatedAt} com \`npm run audit:lighthouse\`, build otimizado e cenário de mock \`default\`. Cada valor abaixo é a mediana de ${config.runs} execuções independentes.\n\n## Metas\n\n- Performance: 95\n- Accessibility: 95\n- Best Practices: 95\n- SEO: 95\n\n## Medianas\n\n| Página | Perfil | Performance | Accessibility | Best Practices | SEO | LCP | CLS | TBT | Todas as metas |\n| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |\n${rows}\n\n## Ambiente\n\n- Lighthouse: ${summary.environment.lighthouseVersion}\n- Node.js: ${summary.environment.node}\n- Sistema: ${summary.environment.system}\n- CPU: ${summary.environment.cpu}\n- Memória total: ${summary.environment.totalMemoryGb} GB\n- Chrome: ${summary.environment.userAgent}\n- Benchmark index: ${summary.environment.benchmarkIndex}\n\n## Condições\n\n- Build de produção servido por \`vite preview\` em \`${config.baseUrl}\`.\n- Armazenamento limpo pelo Lighthouse entre as execuções.\n- Perfil mobile padrão do Lighthouse e preset desktop oficial.\n- Auditorias executadas sequencialmente, sem extensões do navegador.\n- Relatórios HTML e JSON de cada execução estão nesta pasta.\n${limitation}`
}

async function main() {
  const expectedReportsDirectory = resolve(projectDirectory, "lighthouse-reports")

  if (reportsDirectory !== expectedReportsDirectory) {
    throw new Error("The Lighthouse reports directory is outside the expected path.")
  }

  await rm(reportsDirectory, { force: true, recursive: true })
  await mkdir(reportsDirectory, { recursive: true })

  const preview = spawn(
    process.execPath,
    [viteCli, "preview", "--host", "127.0.0.1", "--port", "4174", "--strictPort"],
    {
      cwd: projectDirectory,
      stdio: "inherit",
    },
  )

  try {
    await waitForPreview(preview)

    const audits = []

    for (const profile of config.profiles) {
      for (const page of config.pages) {
        for (let run = 1; run <= config.runs; run += 1) {
          audits.push(await runAudit(page, profile, run))
        }
      }
    }

    const firstAudit = audits[0]
    const totalMemoryGb = (totalmem() / 1024 ** 3).toFixed(1)
    const freeMemoryGb = (freemem() / 1024 ** 3).toFixed(1)
    const summary = {
      generatedAt: new Date().toISOString(),
      command: "npm run audit:lighthouse",
      runsPerCombination: config.runs,
      scenario: "default",
      thresholds: config.thresholds,
      environment: {
        benchmarkIndex: firstAudit.runtime.benchmarkIndex,
        cpu: cpus()[0]?.model ?? "unknown",
        freeMemoryGb,
        lighthouseVersion: firstAudit.runtime.lighthouseVersion,
        node: process.version,
        system: `${platform()} ${release()}`,
        totalMemoryGb,
        userAgent: firstAudit.runtime.userAgent,
      },
      profiles: Object.fromEntries(
        config.profiles.map((profile) => [
          profile.id,
          audits.find((audit) => audit.profile === profile.id)?.settings,
        ]),
      ),
      medians: summarizeAudits(audits),
      audits,
    }

    await writeFile(
      join(reportsDirectory, "summary.json"),
      `${JSON.stringify(summary, null, 2)}\n`,
    )
    await writeFile(
      join(reportsDirectory, "README.md"),
      formatMarkdown(summary),
    )

    console.table(
      summary.medians.map((result) => ({
        page: result.pageLabel,
        profile: result.profileLabel,
        performance: formatScore(result.scores.performance),
        accessibility: formatScore(result.scores.accessibility),
        bestPractices: formatScore(result.scores["best-practices"]),
        seo: formatScore(result.scores.seo),
        lcp: `${(result.metrics.lcp / 1_000).toFixed(2)} s`,
        cls: result.metrics.cls.toFixed(3),
        tbt: `${Math.round(result.metrics.tbt)} ms`,
      })),
    )
  } finally {
    preview.kill()
  }
}

await main()
