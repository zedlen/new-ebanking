#!/usr/bin/env bash
# Genera PDF de la presentación (HTML → Chrome headless).
# Uso: ./docs/generar-pdf.sh

set -euo pipefail
DIR="$(cd "$(dirname "$0")" && pwd)"
HTML="${DIR}/arquitectura-aws-presentacion.html"
PDF="${DIR}/arquitectura-aws-presentacion.pdf"

CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
if [[ ! -x "$CHROME" ]]; then
  echo "No se encontró Google Chrome en: $CHROME" >&2
  exit 1
fi

"$CHROME" --headless=new --disable-gpu --no-pdf-header-footer \
  --print-to-pdf="$PDF" "file://${HTML}"

echo "PDF generado: $PDF"
