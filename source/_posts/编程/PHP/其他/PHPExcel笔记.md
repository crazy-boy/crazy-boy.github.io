---
title: PHPExcel笔记
tags: [PHPExcel]
categories: [PHP]
abbrlink: 'php-excel'
date: 2018-11-06 11:55:00
updated: 2022-05-11 17:03:22
---

### 1. 设置字体和样式
``` bash
    $objPHPExcel->getActiveSheet()->getStyle('A1')->applyFromArray(['font'=>['bold'=>true]]);			//设置单元格A1字体加粗
    $objPHPExcel->getActiveSheet()->getStyle('A1:GL1')->applyFromArray(['font'=>['bold'=>true]]);		//设置单元格A1-GL1字体加粗
    $objPHPExcel->getActiveSheet()->getStyle('A1:B3')->getFont()->setBold(true);						//设置A1-B3之间的单元格字体加粗
``` 

### 2. 设置行高
``` bash
    $objPHPExcel->getActiveSheet()->getDefaultRowDimension()->setRowHeight(20);							//设置默认行高
    $objPHPExcel->getActiveSheet()->getRowDimension('1')->setRowHeight(30);								//设置第一行行高
``` 

### 3. 设置列宽
``` bash
    $objPHPExcel->getActiveSheet()->getColumnDimension('A')->setWidth(20);								//设置A列列宽
``` 

### 4. 单元格内容特定位置换行
``` bash
    $objPHPExcel->setActiveSheetIndex(0)->setCellValue('A3', "第三节\n11:00-12:00");   //注意双引号
    $objPHPExcel->getActiveSheet()->getStyle('A3')->getAlignment()->setWrapText(true);
``` 

### 5. PhpSpreadsheet日期格式问题
使用PhpSpreadsheet  进行导入处理时，如果单元格格式为：自定义的`yyyy/m/d`，导入后的数据格式会变为`m/d/yyyy`，即12/13/2021
![](/images/php_excel_note_1.png)
这是因为PhpSpreadsheet会把单元格转为数字，而校验出的单元格格式为`m/d/yyyy`。
解决办法：使用日期格式的`yyyy/m/d`
![](/images/php_excel_note_2.png)
程序校验出的日期格式为：`yyyy/m/d;@`
excel导入，获取数据：
```php
$allobjWorksheets = $objPHPExcel->getAllSheets();
$result = [];
foreach($allobjWorksheets as $objWorksheet) {
    $sheetname = $objWorksheet->getTitle();
    $highestRow = $objWorksheet->getHighestRow();
    $highestColumn = $objWorksheet->getHighestColumn();
    $highestColumnIndex = Coordinate::columnIndexFromString($highestColumn);
    for ($row = 1; $row <= $highestRow; ++$row) {
        for ($col = 0; $col <= $highestColumnIndex; ++$col) {
            $cell = $objWorksheet->getCellByColumnAndRow($col, $row);
            $value = $cell->getValue();
            if ($cell->getDataType() == DataType::TYPE_NUMERIC) {
                $formatcode = $cell->getStyle()->getNumberFormat()->getFormatCode();
                if (preg_match('/^(\[\$[A-Z]*-[0-9A-F]*\])*[hmsdy]/i', $formatcode)) {
                    $value = $cell->getFormattedValue();
                    //$value=gmdate("Y-m-d", PHPExcel_Shared_Date::ExcelToPHP($value));
                } else {
                    $value = NumberFormat::toFormattedString($value, $formatcode);
                }
            }
            $result[$sheetname][$row - 1][$col] = $value;
        }
    }
}
print_r($result);
die;
```