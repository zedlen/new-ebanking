import * as ExcelJS from 'exceljs';
import { APPS } from '@middleware/infrastructure/constants/appsConfigurations';
import {
  Injectable,
  Logger,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  MOVEMENT_STATUS,
  MOVEMENT_TYPE,
} from '@middleware/infrastructure/constants/catalog';
import { launch } from 'puppeteer';
import { readFileSync } from 'fs';
import { compile } from 'handlebars';
import { ConfigService } from '@nestjs/config';
import {
  getNameFromAccount,
  formatDate,
  formatCurrency,
} from '@middleware/domain/utils';

@Injectable()
export class ReportsService {
  private readonly logger = new Logger(ReportsService.name);
  private serverUrl: string;
  private VALID_STATUS_FOR_REPORT = ['in_transit', 'applied', 'scattered'];
  private VALID_MOVEMENTS_TYPES = [1, 2, 3];
  private MOVEMENT_TYPE = [
    {
      id: '1',
      name: 'SPEI SALIDA',
      type: '1',
    },
    {
      id: '2',
      name: 'SPEI ENTRADA',
      type: '1',
    },
    {
      id: '3',
      name: 'Traspaso',
      type: '1',
    },
    {
      id: '4',
      name: 'Compra',
      type: '2',
    },
    {
      id: '5',
      name: 'Retiro',
      type: '2',
    },
    {
      id: '6',
      name: 'Comisión por consulta de saldo',
      type: '1',
    },
    {
      id: '7',
      name: 'Comisión por operación',
      type: '1',
    },
  ];
  constructor(private readonly configService: ConfigService) {
    this.serverUrl = this.configService.get('SERVER_URL') as string;
  }

  async generateMonthlyBalanceReport(
    appName: string,
    banks: any[],
    movements: any[],
    userData: any,
    accountId: string,
    clabe: string,
    firstDay: string,
    lastDay: string,
  ) {
    const appConfiguration = APPS.get(appName);
    if (!appConfiguration)
      throw new UnprocessableEntityException(
        `${appName.toUpperCase()} is not ready to create monthly reports`,
      );

    const reportData: Record<string, any> = {
      previousBalance: 0,
      currentBalance: '',
      depositsCount: 0,
      withdrawsCount: 0,
      depositsAmount: '',
      withdrawsAmount: '',
      startDate: firstDay,
      endDate: lastDay,
      totalDays: lastDay.split('/')[0],
      companyName: userData.company_name || userData.contact_name || '',
      taxId: userData.rfc || '',
      movements: [],
    };

    let depositsAmount = 0,
      withdrawsAmount = 0;
    movements.forEach((movement) => {
      let deposit = 0,
        withdraw = 0,
        balance = 0;
      const { amount, application_date, operation_date } = movement;
      if (amount > 0) {
        deposit = amount;
        reportData.depositsCount += 1;
        depositsAmount += amount;
      } else {
        withdraw = Math.abs(amount);
        reportData.withdrawsCount += 1;
        withdrawsAmount += withdraw;
      }
      const movDate = operation_date || application_date;
      const date = new Date(movDate?.replace?.(/[zZ]/, ''));
      const personLabel = amount > 0 ? 'ORDENANTE' : 'BENEFICIARIO';
      const movement_account =
        amount > 0 ? movement.payer_account : movement.beneficiary_account;
      reportData.movements.push({
        ...movement,
        movementType:
          this.MOVEMENT_TYPE.find((type) => type.id == movement.type)?.name ||
          '',
        needData: this.VALID_MOVEMENTS_TYPES.includes(movement.type),
        date: date.toLocaleDateString('es-MX', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        description: movement.payment_purpose,
        deposit: formatCurrency(deposit),
        withdraw: formatCurrency(withdraw),
        balance: formatCurrency(balance),
        traking: movement.tracking_key || movement.folio,
        movement_bank:
          amount > 0
            ? banks.find(
                (bank) =>
                  bank.legalCode == movement.origin_bank_id ||
                  bank.code == movement.origin_bank_id,
              )?.name || `${appConfiguration.transferName}`
            : banks.find(
                (bank) =>
                  bank.legalCode == movement.destination_bank_id ||
                  bank.code == movement.destination_bank_id,
              )?.name || `${appConfiguration.transferName}`,
        movement_account,
        reference: movement.reference,
        time: date.toLocaleTimeString('es-MX'),
        personLabel,
      });
    });

    reportData.depositsAmount = formatCurrency(depositsAmount);
    reportData.withdrawsAmount = formatCurrency(withdrawsAmount);
    reportData.currentBalance = formatCurrency(
      depositsAmount - withdrawsAmount,
    );
    this.logger.log({ movements: reportData.movements });
    const browser = await launch({
      headless: 'shell',
      ignoreDefaultArgs: ['--disable-extensions'],
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    const templeteUri =
      __dirname + '/../../../../assets/templetes/monthly-report-es.hbs';
    const html = readFileSync(templeteUri).toString();
    const content = compile(html.toString())({
      ...reportData,
      accountId,
      accountClabe: `**********${clabe.slice(-6)}`,
      ...appConfiguration,
      serverUrl: this.serverUrl,
    });
    await page.setContent(content);
    const buffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        left: '10mm',
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
          <div style="width: 100%; display:flex; flex-direction: row; font-size: 12px; padding-left: 48px; padding-right: 48px">
            <div style="display: flex; flex-direction:row; flex: 1; justify-content:flex-start;">
              ${appConfiguration.footerName}, ${appConfiguration.footerLeyend}.
            </div>
            <div style="display: flex; flex-direction:row; flex: 1; justify-content:flex-end;">
              Página&nbsp;<span class="pageNumber"></span>&nbsp;de&nbsp;<span class="totalPages"></span>
            </div>
          </div>`,
    });
    await browser.close();
    return buffer;
  }

  async generateMovementsReport(
    appName: string,
    banks: any[],
    movements: any[],
    userData: any,
    accountId: string,
  ) {
    const appConfiguration = APPS.get(appName);
    if (!appConfiguration)
      throw new UnprocessableEntityException(
        `${appName.toUpperCase()} is not ready to create monthly reports`,
      );
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Movimientos');

    // Initialize the row index
    const rowIndex = 2;

    const row = worksheet.getRow(rowIndex);
    row.values = [
      'Monto',
      'Estatus',
      'Fecha de Operación',
      'Fecha de Aplicación',
      'Tipo de Movimiento',
      'Concepto',
      'Institución Origen',
      'Cuenta Origen',
      'Institución Destino',
      'Cuenta Destino',
      'Nombre Beneficiario',
      'Seguimiento',
    ];
    row.font = { bold: true };

    const columnWidths = [10, 10, 20, 20, 10, 50, 20, 20, 20, 20, 30, 50];

    row.eachCell((cell, colNumber) => {
      const columnIndex = colNumber - 1;
      const columnWidth = columnWidths[columnIndex];
      worksheet.getColumn(colNumber).width = columnWidth;
    });

    movements.forEach((movement, index) => {
      const row = worksheet.getRow(rowIndex + index + 1);
      row.getCell('A').value = movement.amount;
      row.getCell('A').numFmt = '$#,##0.00';
      row.getCell('B').value =
        MOVEMENT_STATUS[movement.status] || movement.status;
      row.getCell('C').value = formatDate(movement.operation_date || '');
      row.getCell('D').value = formatDate(movement.application_date || '');
      row.getCell('E').value = MOVEMENT_TYPE[movement.type] || movement.type;
      row.getCell('F').value = movement.payment_purpose;
      row.getCell('G').value =
        banks.find(
          (bank) =>
            bank.legalCode === movement.origin_bank_id ||
            bank.legalCode == movement.origin_bank_id,
        )?.name || `${appConfiguration.transferName}`;
      row.getCell('H').value = movement.account_id;
      row.getCell('I').value =
        banks.find(
          (bank) =>
            bank.legalCode === movement.destination_bank_id ||
            bank.legalCode == movement.destination_bank_id,
        )?.name || `${appConfiguration.transferName}`;
      row.getCell('J').value = movement.beneficiary_account;
      row.getCell('K').value = movement.beneficiary_name;
      row.getCell('L').value = movement.tracking_key || movement.folio;
      row.getCell('L').alignment = { wrapText: true };
    });

    worksheet.mergeCells(`A1:F1`);

    worksheet.mergeCells(`G1:L1`);

    const header = worksheet.getRow(1);
    header.getCell('H').value =
      `Cuenta ${appConfiguration.appNameAllCaps}: ${userData?.account?.clabes?.[0]?.account_id || accountId}
RFC: ${userData.rfc || ''}
R. Social: ${userData.company_name || userData.contact_name || ''}`;

    const image = workbook.addImage({
      filename: __dirname + `/../../../../assets/imgs/logo/${appName}.png`,
      extension: 'png',
    });
    worksheet.addImage(image, {
      tl: { col: 0, row: 0 },
      ext: { width: 140, height: 40 },
    });

    worksheet.getRow(1).height = 50;

    // Loop through all cells and apply the border style
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: {
            style: 'thin',
            color: { argb: '00000000' },
          },
          bottom: {
            style: 'thin',
            color: { argb: '00000000' },
          },
        };
      });
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: rowNumber % 2 == 0 ? 'DADADA' : 'FFFFFF',
        },
      };
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async generateAccountsFile(accounts, appName) {
    const appConfiguration = APPS.get(appName);
    if (!appConfiguration)
      throw new UnprocessableEntityException(
        `${appName.toUpperCase()} is not ready to create monthly reports`,
      );
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Movimientos');

    worksheet.mergeCells(`A1:L1`);
    const image = workbook.addImage({
      filename: __dirname + `/../../../../assets/imgs/logo/${appName}.png`,
      extension: 'png',
    });
    worksheet.addImage(image, {
      tl: { col: 0, row: 0 },
      ext: { width: 140, height: 40 },
    });

    worksheet.getRow(1).height = 50;

    // Initialize the row index
    let rowIndex = 2;

    const row = worksheet.getRow(rowIndex);
    row.values = [
      'Nombre',
      `Cuenta ${appConfiguration.transferName}`,
      'Cuenta Clabe',
      'Teléfono',
      'Corréo Electronico',
      'Tipo',
      'Fecha Alta',
      'Monto en cuenta',
    ];
    row.font = { bold: true };

    const columnWidths = [50, 30, 30, 20, 30, 10, 20, 20];

    row.eachCell((cell, colNumber) => {
      const columnIndex = colNumber - 1;
      const columnWidth = columnWidths[columnIndex];
      worksheet.getColumn(colNumber).width = columnWidth;
    });

    accounts?.accounts?.forEach?.((account) => {
      account.accounts?.forEach?.((acc) => {
        rowIndex++;
        const row = worksheet.getRow(rowIndex);
        row.getCell('A').value = getNameFromAccount(account);
        row.getCell('B').value = acc?.clabes?.[0]?.account_id;
        row.getCell('C').value =
          `**********${acc?.clabes?.[0]?.clabe?.slice?.(-6)}`;
        row.getCell('D').value = account?.contact_tel;
        row.getCell('E').value = account?.contact_email;
        row.getCell('F').value = 'Cuenta';
        row.getCell('G').value = formatDate(account.creation_date);
        row.getCell('H').value = acc?.amount;
        row.getCell('H').numFmt = '$#,##0.00';
      });
      account?.nestedAccounts?.forEach?.((nestedAccount) => {
        nestedAccount.accounts?.forEach?.((acc) => {
          rowIndex++;
          const row = worksheet.getRow(rowIndex);
          row.getCell('A').value = getNameFromAccount(nestedAccount);
          row.getCell('B').value = acc?.clabes?.[0]?.account_id;
          row.getCell('C').value = acc?.clabes?.[0]?.clabe;
          row.getCell('D').value = nestedAccount?.contact_tel;
          row.getCell('E').value = nestedAccount?.contact_email;
          row.getCell('F').value = 'Subcuenta';
          row.getCell('G').value = formatDate(nestedAccount.creation_date);
          row.getCell('H').value = acc?.amount;
          row.getCell('H').numFmt = '$#,##0.00';
        });
      });
    });

    // Loop through all cells and apply the border style
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: {
            style: 'thin',
            color: { argb: '00000000' },
          },
          bottom: {
            style: 'thin',
            color: { argb: '00000000' },
          },
        };
      });
      row.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
          argb: rowNumber % 2 == 0 ? 'DADADA' : 'FFFFFF',
        },
      };
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }

  async generateBoucher(
    appName: string,
    banks: any[],
    movement: any,
    userData: any,
    accountId: string,
  ) {
    if (!movement) throw new UnprocessableEntityException(`Movement not found`);
    const appConfiguration = APPS.get(appName);
    if (!appConfiguration)
      throw new UnprocessableEntityException(
        `${appName.toUpperCase()} is not ready to create monthly reports`,
      );
    let hideData = {};
    if (movement.type == 1)
      hideData = {
        payer_account: `***${movement.payer_account?.slice?.(-6)}`,
        payerBank: `${appConfiguration.transferName}`,
      };
    if (movement.type == 2)
      hideData = {
        beneficiary_account: `***${movement.beneficiary_account?.slice?.(-6)}`,
        beneficiaryBank: `${appConfiguration.transferName}`,
      };
    const boucherData = {
      movementType: MOVEMENT_TYPE[movement.type],
      movementTypeLabel: movement.amount < 0 ? 'Decremento' : 'Incremento',
      operationDate: formatDate(movement.operation_date),
      movementStatus: MOVEMENT_STATUS[movement.status] || '-',
      trackingKey: movement.tracking_key || movement.folio,
      payerBank:
        banks.find((bank) => bank.legalCode === movement.origin_bank_id)
          ?.name || `${appConfiguration.transferName}`,
      beneficiaryBank:
        banks.find((bank) => bank.legalCode === movement.destination_bank_id)
          ?.name || `${appConfiguration.transferName}`,
      ...movement,
      ...hideData,
      amount: formatCurrency(movement.amount),
    };
    const browser = await launch({
      headless: 'shell',
      ignoreDefaultArgs: ['--disable-extensions'],
      args: ['--no-sandbox'],
    });
    const page = await browser.newPage();
    const templeteUri =
      __dirname + '/../../../../assets/templetes/boucher-es.hbs';
    const html = readFileSync(templeteUri).toString();
    const content = compile(html.toString())({
      ...boucherData,
      userData,
      accountId,
      ...appConfiguration,
      serverUrl: this.serverUrl,
    });
    await page.setContent(content);
    const buffer = await page.pdf({
      format: 'LEGAL',
      printBackground: true,
      margin: {
        left: '10mm',
        top: '10mm',
        right: '10mm',
        bottom: '10mm',
      },
    });
    await browser.close();
    return buffer;
  }

  async generateCardMovementsReport(data) {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Movimientos');

    // Initialize the row index
    let rowIndex = 1;

    const row = worksheet.getRow(rowIndex);
    const columns = [
      'ts',
      'ts-cst',
      'request_headers.Uuid',
      'request.body.authorization_code',
      'customer',
      'request_headers.Client-Id',
      'request_headers.Legacy-Id',
      'request.body.card_id',
      'request.body.card_number',
      'request.body.card_status',
      'request.body.product_id',
      'request.body.external_account_id',
      'request.url',
      'request.body.processing.type',
      'request.body.values.billing_value',
      'request.body.values.billing_currency_code',
      'request.body.values.billing_conversion_rate',
      'request.body.establishment',
      'response.status_code',
      'response.body.response',
      'response.body.reason',
    ];

    const { ignoredRecords, ...dayGrouping } = data;
    let total = '0';

    for (const day in dayGrouping) {
      const records = dayGrouping[day].records;
      // fill same days with same color
      //const color = getRandomPastelColor();
      records.forEach((record) => {
        rowIndex++;
        const row = worksheet.getRow(rowIndex);
        row.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: {
            //argb: color,
          },
        };
        columns.forEach((column, index) => {
          const value = column
            .split('.')
            .reduce((obj, key) => (obj ? obj[key] : undefined), record);
          row.getCell(index + 1).value = value;
          if (column === 'request.body.values.billing_value') {
            row.getCell(index + 1).value = Number.parseFloat(value);
            row.getCell(index + 1).numFmt = '$#,##0.00';
          }
        });
      });
      const row = worksheet.getRow(rowIndex);
      row.getCell(columns.length + 2).value = day;
      row.getCell(columns.length + 3).value = Number.parseFloat(
        dayGrouping[day].total,
      );
      row.getCell(columns.length + 3).numFmt = '$#,##0.00';
      total = (
        Number.parseFloat(dayGrouping[day].total) + Number.parseFloat(total)
      ).toFixed(2);
    }

    const newRow = worksheet.getRow(rowIndex + 1);
    newRow.getCell(columns.length + 2).value = 'TOTAL';
    newRow.getCell(columns.length + 3).value = Number.parseFloat(total);
    newRow.getCell(columns.length + 3).numFmt = '$#,##0.00';

    // Loop through all cells and apply the border style
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: {
            style: 'thin',
            color: { argb: '00000000' },
          },
          bottom: {
            style: 'thin',
            color: { argb: '00000000' },
          },
        };
      });
    });

    const columnWidths = [
      20, 20, 40, 15, 15, 20, 15, 20, 20, 20, 20, 15, 25, 20, 20, 10, 10, 20,
      15, 10, 10, 10, 10, 20,
    ];

    row.values = [...columns, '', 'Dia', 'Total del dia'];
    row.font = { bold: true };

    row.eachCell((cell, colNumber) => {
      const columnIndex = colNumber - 1;
      const columnWidth = columnWidths[columnIndex];
      worksheet.getColumn(colNumber).width = columnWidth;
    });

    const worksheet2 = workbook.addWorksheet('Movimientos no contabilizados');
    rowIndex = 1;
    const row2 = worksheet2.getRow(rowIndex);
    row2.values = columns;
    row2.font = { bold: true };

    const columnWidths2 = [
      20, 20, 40, 15, 15, 20, 15, 20, 20, 20, 20, 15, 25, 20, 20, 10, 10, 20,
      15, 10, 20, 30,
    ];

    row2.eachCell((cell, colNumber) => {
      const columnIndex = colNumber - 1;
      const columnWidth = columnWidths2[columnIndex];
      worksheet2.getColumn(colNumber).width = columnWidth;
    });

    ignoredRecords.forEach((record) => {
      rowIndex++;
      const row = worksheet2.getRow(rowIndex);
      columns.forEach((column, index) => {
        const value = column
          .split('.')
          .reduce((obj, key) => (obj ? obj[key] : undefined), record);
        row.getCell(index + 1).value = value;
        if (column === 'request.body.values.billing_value') {
          row.getCell(index + 1).numFmt = '$#,##0.00';
        }
      });
    });

    // Loop through all cells and apply the border style
    worksheet2.eachRow((row, rowNumber) => {
      row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
        cell.border = {
          top: {
            style: 'thin',
            color: { argb: '00000000' },
          },
          bottom: {
            style: 'thin',
            color: { argb: '00000000' },
          },
        };
      });
    });
    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  }
}
