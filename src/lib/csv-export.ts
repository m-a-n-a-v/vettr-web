import type { Stock } from '@/types/api'

/**
 * Converts an array of stocks to CSV format
 */
export function convertStocksToCSV(stocks: Stock[]): string {
  // Define CSV headers
  const headers = [
    'Ticker',
    'Company',
    'Price',
    'Change %',
    'VETTR Score',
    'Sector',
    'Market Cap'
  ]

  // Create CSV rows
  const rows = stocks.map(stock => [
    stock.ticker,
    `"${stock.company_name.replace(/"/g, '""')}"`, // Escape quotes in company name
    stock.current_price?.toFixed(2) || 'N/A',
    stock.price_change_percent !== undefined && stock.price_change_percent !== null
      ? stock.price_change_percent.toFixed(2)
      : 'N/A',
    stock.vetr_score?.toString() || 'N/A',
    stock.sector || 'N/A',
    stock.market_cap
      ? (stock.market_cap / 1_000_000_000).toFixed(2)
      : 'N/A'
  ])

  // Combine headers and rows
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n')

  return csvContent
}

/**
 * Triggers a CSV file download in the browser
 */
export function downloadCSV(csvContent: string, filename: string): void {
  // Create a Blob from the CSV content
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })

  // Create a temporary download link
  const link = document.createElement('a')
  const url = URL.createObjectURL(blob)

  link.setAttribute('href', url)
  link.setAttribute('download', filename)
  link.style.visibility = 'hidden'

  // Append to body, click, and remove
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Clean up the URL object
  URL.revokeObjectURL(url)
}

/**
 * Generates a filename with the current date
 */
export function generateCSVFilename(prefix: string = 'vettr-stocks'): string {
  const date = new Date()
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')

  return `${prefix}-${year}-${month}-${day}.csv`
}
