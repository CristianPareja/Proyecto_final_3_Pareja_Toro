#!/usr/bin/env bash
set -euo pipefail

# Backup automático EcoCanje

# Defaults
PGHOST="${PGHOST:-postgres}"
PGPORT="${PGPORT:-5432}"
PGDATABASE="${PGDATABASE:-ecocanje_db}"
PGUSER="${PGUSER:-postgres}"
PGPASSWORD="${PGPASSWORD:-postgres}"

export PGPASSWORD

DATE="$(date +"%Y%m%d_%H%M%S")"
BACKUP_DIR="/backups"
mkdir -p "$BACKUP_DIR"

echo "[$(date)] Iniciando backup de ${PGDATABASE} en ${PGHOST}:${PGPORT} con usuario ${PGUSER}"

pg_dump \
  -F p \
  -h "${PGHOST}" \
  -p "${PGPORT}" \
  -U "${PGUSER}" \
  "${PGDATABASE}" > "${BACKUP_DIR}/${PGDATABASE}_${DATE}.sql"

echo "[$(date)] Backup exitoso: ${PGDATABASE}_${DATE}.sql"

# borrar .sql mayores a 7 días
find "${BACKUP_DIR}" -type f -name "*.sql" -mtime +7 -delete || true
