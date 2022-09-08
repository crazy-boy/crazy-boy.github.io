---
title: MySQL中decimal类型
tags: [MySQL]
categories: MySQL
abbrlink: 'mysql-decimal'
date: 2020-07-05 18:26:19
updated: 2020-07-05 18:26:19
---

在mysql中，经常会使用decimal数据类型来保存精度准确的数值，如工资、价格、金额等货币数据。
- 语法及其说明
`columName decimal(P,D);`
P表示有效数字的精度，范围为1~65；P的默认值为10，如`columName decimal;`表示不含小数数字最大长度为10。
D表示小数点后的位数，范围为0~30，D<=P；如果D为空(`columName decimal(P);`)或者0(`columName decimal(P,0);`)表示列不包含小数部分或小数点。
- 示例
`amount decimal(6,2);`表示amount列最多可以存储6位数字，小数点位数为2位；amount列的范围为-9999.99~9999.99。
