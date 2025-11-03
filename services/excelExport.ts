import { HistoryEntryWithStatus } from '../types';

declare const XLSX: any;

export const exportToExcel = (history: HistoryEntryWithStatus[], fileName: string = 'LichSuBaoTri'): void => {
  const worksheetData = history.map(entry => ({
    'Xưởng': entry.workshopName,
    'Tên thiết bị': entry.equipmentName,
    'Hạng mục': entry.taskName,
    'Ngày bảo trì': new Date(entry.maintenanceDate).toLocaleString('vi-VN'),
    'Tình trạng': entry.status === 'Quá hạn' ? `Quá hạn ${entry.overdueDays} ngày` : 'Đúng hạn',
    'Ghi chú': entry.notes || '',
  }));

  const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Lịch sử');

  // Set column widths
  const colWidths = [
    { wch: 25 }, // Xưởng
    { wch: 25 }, // Tên thiết bị
    { wch: 25 }, // Hạng mục
    { wch: 20 }, // Ngày bảo trì
    { wch: 20 }, // Tình trạng
    { wch: 40 }, // Ghi chú
  ];
  worksheet['!cols'] = colWidths;

  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};