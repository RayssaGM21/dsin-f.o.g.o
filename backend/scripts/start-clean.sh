#!/usr/bin/env sh
set -eu

project_dir=$(CDPATH= cd "$(dirname "$0")/.." && pwd)
port=${1:-8778}
case "$port" in
    *[!0-9]*|'') echo 'Informe uma porta numérica entre 1 e 65535.' >&2; exit 1 ;;
esac
if [ "$port" -lt 1 ] || [ "$port" -gt 65535 ]; then
    echo 'Informe uma porta entre 1 e 65535.' >&2
    exit 1
fi

php_bin=${PHP_BIN:-php}
version_id=$("$php_bin" -r 'echo PHP_VERSION_ID;')
if [ "$version_id" -lt 80512 ] || [ "$version_id" -ge 80600 ]; then
    echo 'Este projeto requer PHP 8.5.12 ou superior da série 8.5.' >&2
    exit 1
fi
if [ -f "$project_dir/bootstrap/cache/config.php" ]; then
    echo 'Limpe o cache de configuração com php artisan config:clear antes de usar bancos separados.' >&2
    exit 1
fi

database_path="$project_dir/database/clean.sqlite"
if [ ! -e "$database_path" ]; then
    : > "$database_path"
fi
export DB_CONNECTION=sqlite DB_DATABASE="$database_path" FOGO_MODE=clean
export APP_URL="http://127.0.0.1:$port" SESSION_COOKIE=fogo_clean_session CACHE_PREFIX=fogo_clean

cd "$project_dir"
"$php_bin" artisan migrate --force
echo "Ambiente de teste: $APP_URL"
echo "Banco isolado: $database_path"
"$php_bin" artisan serve --host=127.0.0.1 --port="$port"
