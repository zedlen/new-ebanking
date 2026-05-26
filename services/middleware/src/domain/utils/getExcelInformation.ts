import * as ExcelJs from 'exceljs';

export const getExcelContent = async (file: Express.Multer.File) => {
  const workbook = new ExcelJs.Workbook();
  if (!file?.buffer) return {};
  await workbook.xlsx.load(file.buffer as any);
  const worksheet = workbook.worksheets[0];
  const data = worksheet.getSheetValues();
  return data;
};
