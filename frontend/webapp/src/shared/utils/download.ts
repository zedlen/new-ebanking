export function downloadBlob(
  data: ArrayBuffer,
  filename: string,
  contentType?: string,
): void {
  const blob = new Blob([data], {
    type: contentType ?? 'application/octet-stream',
  })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
