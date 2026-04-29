#!/usr/bin/env node
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  collectPlaceholderDifferences,
  collectPlaceholders,
  collectScalarPaths,
  difference,
  readYamlLocaleFile,
  resolveHagi18nConfig,
  walkYamlFiles,
} from "@hagicode/hagi18n"

const DEFAULT_GENERATED_ROOT = "src/i18n/generated-locales"

function parseArgs(argv) {
  const options = {
    check: false,
    configPath: "hagi18n.yaml",
    generatedRoot: DEFAULT_GENERATED_ROOT,
  }

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index]

    if (arg === "--check") {
      options.check = true
      continue
    }

    if (arg === "--config") {
      options.configPath = argv[index + 1]
      index += 1
      continue
    }

    if (arg === "--generated-root") {
      options.generatedRoot = argv[index + 1]
      index += 1
      continue
    }

    throw new Error(`Unknown argument: ${arg}`)
  }

  return options
}

function stripYamlExtension(relativePath) {
  return relativePath.replace(/\.(ya?ml)$/u, "")
}

function jsonFileForYaml(relativePath) {
  return `${stripYamlExtension(relativePath)}.json`
}

function stableSort(value) {
  if (Array.isArray(value)) {
    return value.map(stableSort)
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([left], [right]) => left.localeCompare(right))
        .map(([key, child]) => [key, stableSort(child)]),
    )
  }

  return value
}

function formatJson(value) {
  return `${JSON.stringify(stableSort(value), null, 2)}\n`
}

function assertNoIssues(issues) {
  if (issues.length === 0) {
    return
  }

  throw new Error(issues.join("\n"))
}

async function assertDirectoryExists(directory, label) {
  try {
    const stat = await fs.stat(directory)
    if (!stat.isDirectory()) {
      throw new Error(`${label} is not a directory: ${directory}`)
    }
  } catch (error) {
    if (error?.code === "ENOENT") {
      throw new Error(`${label} is missing: ${directory}`)
    }
    throw error
  }
}

function compareFileSet(baseFiles, localeFiles, locale) {
  const missingFiles = difference(baseFiles, localeFiles)
  const extraFiles = difference(localeFiles, baseFiles)
  const issues = []

  missingFiles.forEach((file) => {
    issues.push(`[${locale}] missing namespace file: ${file}`)
  })
  extraFiles.forEach((file) => {
    issues.push(`[${locale}] extra namespace file: ${file}`)
  })

  return issues
}

function compareDocumentShape(baseDocument, localeDocument, locale, relativeFilePath) {
  const basePaths = collectScalarPaths(baseDocument.data).sort((left, right) => left.localeCompare(right))
  const localePaths = collectScalarPaths(localeDocument.data).sort((left, right) => left.localeCompare(right))
  const issues = []

  difference(basePaths, localePaths).forEach((keyPath) => {
    issues.push(`[${locale}] ${relativeFilePath} missing key: ${keyPath}`)
  })
  difference(localePaths, basePaths).forEach((keyPath) => {
    issues.push(`[${locale}] ${relativeFilePath} extra key: ${keyPath}`)
  })

  const placeholderIssues = collectPlaceholderDifferences(
    collectPlaceholders(baseDocument.data),
    collectPlaceholders(localeDocument.data),
  )
  placeholderIssues.forEach((issue) => {
    issues.push(
      `[${locale}] ${relativeFilePath} placeholder mismatch at ${issue.path}: expected ${JSON.stringify(issue.expected)}, got ${JSON.stringify(issue.actual)}`,
    )
  })

  return issues
}

async function readLocaleDocuments(config, locale, relativeFilePaths) {
  const documents = new Map()
  for (const relativeFilePath of relativeFilePaths) {
    documents.set(
      relativeFilePath,
      await readYamlLocaleFile(config.localesRoot, locale, relativeFilePath),
    )
  }
  return documents
}

async function collectExpectedResources({ cwd, configPath, generatedRoot }) {
  const config = await resolveHagi18nConfig({ cwd, configPath })
  const locales = [config.baseLocale, ...config.targetLocales]
  const baseLocaleRoot = path.join(config.localesRoot, config.baseLocale)
  const generatedRootAbsolute = path.resolve(cwd, generatedRoot)

  await assertDirectoryExists(config.localesRoot, "Locale root")
  await assertDirectoryExists(baseLocaleRoot, "Base locale root")

  const baseFiles = await walkYamlFiles(baseLocaleRoot)
  if (baseFiles.length === 0) {
    throw new Error(`Base locale has no YAML namespace files: ${baseLocaleRoot}`)
  }

  const baseDocuments = await readLocaleDocuments(config, config.baseLocale, baseFiles)
  const resources = []
  const issues = []

  for (const locale of locales) {
    const localeRoot = path.join(config.localesRoot, locale)
    await assertDirectoryExists(localeRoot, `Locale root for ${locale}`)

    const localeFiles = await walkYamlFiles(localeRoot)
    issues.push(...compareFileSet(baseFiles, localeFiles, locale))

    if (issues.length > 0) {
      continue
    }

    const localeDocuments = await readLocaleDocuments(config, locale, baseFiles)
    for (const relativeFilePath of baseFiles) {
      const baseDocument = baseDocuments.get(relativeFilePath)
      const localeDocument = localeDocuments.get(relativeFilePath)
      issues.push(...compareDocumentShape(baseDocument, localeDocument, locale, relativeFilePath))
      resources.push({
        locale,
        relativeFilePath: jsonFileForYaml(relativeFilePath),
        content: formatJson(localeDocument.data),
      })
    }
  }

  assertNoIssues(issues)

  return {
    locales,
    namespaces: baseFiles.map(stripYamlExtension),
    generatedRoot: generatedRootAbsolute,
    resources,
  }
}

async function readExistingFile(filePath) {
  try {
    return await fs.readFile(filePath, "utf8")
  } catch (error) {
    if (error?.code === "ENOENT") {
      return null
    }
    throw error
  }
}

async function findGeneratedJsonFiles(directory, prefix = "") {
  let entries
  try {
    entries = await fs.readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error?.code === "ENOENT") {
      return []
    }
    throw error
  }

  const files = []
  for (const entry of entries.sort((left, right) => left.name.localeCompare(right.name))) {
    const relativePath = prefix ? path.posix.join(prefix, entry.name) : entry.name
    const absolutePath = path.join(directory, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await findGeneratedJsonFiles(absolutePath, relativePath)))
      continue
    }

    if (entry.isFile() && entry.name.endsWith(".json")) {
      files.push(relativePath)
    }
  }

  return files
}

async function checkResources(expected) {
  const expectedFiles = new Map(
    expected.resources.map((resource) => [
      path.posix.join(resource.locale, resource.relativeFilePath),
      resource.content,
    ]),
  )
  const existingFiles = await findGeneratedJsonFiles(expected.generatedRoot)
  const issues = []

  for (const [relativePath, content] of expectedFiles.entries()) {
    const existing = await readExistingFile(path.join(expected.generatedRoot, relativePath))
    if (existing === null) {
      issues.push(`Generated locale resource is missing: ${relativePath}`)
      continue
    }
    if (existing !== content) {
      issues.push(`Generated locale resource is stale: ${relativePath}`)
    }
  }

  difference(existingFiles, [...expectedFiles.keys()]).forEach((relativePath) => {
    issues.push(`Generated locale resource is extra: ${relativePath}`)
  })

  assertNoIssues(issues)
}

async function writeResources(expected) {
  await fs.rm(expected.generatedRoot, { force: true, recursive: true })

  for (const resource of expected.resources) {
    const outputPath = path.join(expected.generatedRoot, resource.locale, resource.relativeFilePath)
    await fs.mkdir(path.dirname(outputPath), { recursive: true })
    await fs.writeFile(outputPath, resource.content)
  }
}

export async function generateI18nResources(options = {}) {
  const cwd = path.resolve(options.cwd ?? process.cwd())
  const expected = await collectExpectedResources({
    cwd,
    configPath: options.configPath ?? "hagi18n.yaml",
    generatedRoot: options.generatedRoot ?? DEFAULT_GENERATED_ROOT,
  })

  if (options.check) {
    await checkResources(expected)
  } else {
    await writeResources(expected)
  }

  return {
    locales: expected.locales,
    namespaces: expected.namespaces,
    resourceCount: expected.resources.length,
    generatedRoot: expected.generatedRoot,
    checked: Boolean(options.check),
  }
}

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const result = await generateI18nResources(options)
  const action = result.checked ? "validated" : "generated"
  console.log(
    `i18n resources ${action}: ${result.resourceCount} files for ${result.locales.length} locales (${result.namespaces.join(", ")})`,
  )
}

const isDirectRun = process.argv[1]
  ? fileURLToPath(import.meta.url) === path.resolve(process.argv[1])
  : false

if (isDirectRun) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
