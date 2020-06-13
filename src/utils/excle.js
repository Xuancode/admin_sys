import XLSX from 'xlsx'

/**
 * @param {rawFile} rawFile
 * @returns {Boolean}
 */
export function excleToJson(rawFile) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => {
      const data = e.target.result
      const workbook = XLSX.read(data, { type: 'array' })
      const firstSheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[firstSheetName]
      // const header = this.getHeaderRow(worksheet)
      const results = XLSX.utils.sheet_to_json(worksheet)
      // results.splice(0, 1)
      console.log(workbook)

      console.log(results)

      // this.generateData({ header, results })
      // this.loading = false
      resolve(results)
    }
    reader.readAsArrayBuffer(rawFile)
  })
  // const jsonData = ''
  // return jsonData
}
