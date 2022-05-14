---
title: PHPExcel笔记
tags:
  - PHPExcel
  - 笔记
categories: PHP
abbrlink: e9763d3
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