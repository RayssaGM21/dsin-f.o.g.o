param(
    [ValidateRange(1, 65535)]
    [int]$Port = 8778,
    [switch]$InitializeOnly
)

$projectRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$databasePath = Join-Path $projectRoot 'database\clean.sqlite'
$bundledPhp = Join-Path (Split-Path $projectRoot -Parent) '.tools\php\php.exe'
$phpExecutable = if (Test-Path -LiteralPath $bundledPhp) { $bundledPhp } else { (Get-Command php -ErrorAction Stop).Source }
$versionId = [int](& $phpExecutable -r 'echo PHP_VERSION_ID;')
if ($versionId -lt 80512 -or $versionId -ge 80600) { throw 'Este projeto requer PHP 8.5.12 ou superior da série 8.5.' }
if (Test-Path -LiteralPath (Join-Path $projectRoot 'bootstrap\cache\config.php')) {
    throw 'Há um cache de configuração ativo. Remova-o com php artisan config:clear antes de usar bancos separados.'
}

$previous = @{}
foreach ($name in @('DB_CONNECTION', 'DB_DATABASE', 'FOGO_MODE', 'APP_URL', 'SESSION_COOKIE', 'CACHE_PREFIX')) {
    $previous[$name] = [Environment]::GetEnvironmentVariable($name, 'Process')
}

try {
    if (-not (Test-Path -LiteralPath $databasePath)) {
        New-Item -ItemType File -Path $databasePath | Out-Null
    }
    $env:DB_CONNECTION = 'sqlite'
    $env:DB_DATABASE = $databasePath
    $env:FOGO_MODE = 'clean'
    $env:APP_URL = "http://127.0.0.1:$Port"
    $env:SESSION_COOKIE = 'fogo_clean_session'
    $env:CACHE_PREFIX = 'fogo_clean'

    Push-Location $projectRoot
    try {
        & $phpExecutable artisan migrate --force
        if ($LASTEXITCODE -ne 0) { throw 'Não foi possível preparar o banco isolado.' }
        if (-not $InitializeOnly) {
            Write-Host "Ambiente de teste: http://127.0.0.1:$Port" -ForegroundColor Green
            Write-Host "Banco isolado: $databasePath"
            Write-Host 'A demonstração atual permanece no banco database.sqlite.'
            & $phpExecutable artisan serve --host=127.0.0.1 --port=$Port
        }
    }
    finally { Pop-Location }
}
finally {
    foreach ($name in $previous.Keys) {
        [Environment]::SetEnvironmentVariable($name, $previous[$name], 'Process')
    }
}
