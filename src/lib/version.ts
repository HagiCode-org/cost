function resolveInjectedVersion(): string | undefined {
  if (typeof __APP_VERSION__ !== "undefined" && __APP_VERSION__) {
    return __APP_VERSION__
  }

  const envVersion = import.meta.env?.VITE_APP_VERSION
  if (envVersion) {
    return envVersion
  }

  return undefined
}

export function getAppVersion(): string {
  return resolveInjectedVersion() ?? "dev"
}

export function formatAppVersion(version: string): string {
  return version.startsWith("v") ? version : `v${version}`
}
