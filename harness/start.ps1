[CmdletBinding()]
param(
    [string]$DshRoot,
    [ValidateRange(0, 65535)][int]$Port = 3086,
    [switch]$NoOpen,
    [switch]$DumpConfig
)

$ErrorActionPreference = 'Stop'
if (-not $DshRoot) {
    $DshRoot = Split-Path -Parent $PSScriptRoot
}
$cli = Join-Path $DshRoot 'apps\cli\lib\bin.js'
if (-not (Test-Path -LiteralPath $cli -PathType Leaf)) {
    throw "Missing built dsh CLI at $cli. Run pnpm install and pnpm run build in dsh-shell."
}
$cli = (Resolve-Path -LiteralPath $cli).Path
$previousHome = $env:DSH_HOME
$previousAgents = $env:DSH_AGENTS_HOME
Push-Location -LiteralPath $PSScriptRoot
try {
    $env:DSH_HOME = Join-Path $PSScriptRoot 'home'
    $env:DSH_AGENTS_HOME = Join-Path $PSScriptRoot 'home\agents'
    $options = @('--profile', 'marine-ecology')
    if ($DumpConfig) {
        $options += '--dump-config'
    } else {
        $options += @('--host', '127.0.0.1', '--port', "$Port")
        if ($NoOpen) { $options += '--no-open' }
    }
    & node $cli @options
    $result = $LASTEXITCODE
} finally {
    $env:DSH_HOME = $previousHome
    $env:DSH_AGENTS_HOME = $previousAgents
    Pop-Location
}
exit $result
