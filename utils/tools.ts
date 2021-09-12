/* eslint-disable no-useless-escape */
/* eslint-disable no-misleading-character-class */
// Convert Form Array To json
export const objectifyForm = (formArray: any[]) => {
  //serialize data function
  let returnArray: any = {};
  for (var i = 0; i < formArray.length; i++) {
    returnArray[formArray[i]["name"]] = formArray[i]["value"];
  }
  return returnArray;
};
// Remove Duplicate Object in Array
export const removeDuplicateObjects = (array: any[]) => {
  return [...new Set(array.map((s) => JSON.stringify(s)))].map((s) => JSON.parse(s));
};
// Check string is json or not
export const isJSON = (str: string) => {
  try {
    return JSON.parse(str) && !!str;
  } catch (e) {
    return false;
  }
};
// Add comma Separator to digit number
export const numberSeparator = (num: any, sep?: string) => {
  let number = fixNumbers(removeSeparator(num).toString()),
    separator = typeof sep === "undefined" ? "," : sep;
  return number.replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1" + separator);
};
// Remove comma separator From digit number
export const removeSeparator = (num: any, sep?: string) => {
  let separator = typeof sep === "undefined" ? "," : sep;
  var re = new RegExp(separator, "g");
  return num.toString().replace(re, "");
};
// Convert elemetn's value for remove all characters exept number, Just Allow Type Numbers
export const forceNumeric = (e: any) => {
  //let $input = e.replace(/[^\d]+/g, '');
  let $input = e.replace(/[^0-9۰-۹]+/g, "");
  return $input;
};
// Just Allow 4 number
export const forceNumeric4 = (e: any) => {
  let $input = e;
  //$input.replace(/[^\d]+/g, '');
  $input.replace(/[^0-9۰-۹]+/g, "");
  if ($input.length > 4) {
    $input = $input.substring(0, 4);
  }
  return $input;
};
// Just Allow 6 number
export const forceNumeric6 = (e: any) => {
  let $input = e;
  //$input.replace(/[^\d]+/g, '');
  $input.replace(/[^0-9۰-۹]+/g, "");
  if ($input.length > 6) {
    $input = $input.substring(0, 6);
  }
  return $input;
};
// Just Allow 10 number
export const forceNumeric10 = (e: any) => {
  var $input = e;
  $input.replace(/[^\d]+/g, "");
  if ($input.length > 10) {
    $input = $input.substring(0, 10);
  }
  return $input;
};
// Convert Persian & Arabic number to English
const persianNumbersExp = [/۰/g, /۱/g, /۲/g, /۳/g, /۴/g, /۵/g, /۶/g, /۷/g, /۸/g, /۹/g];
const arabicNumbersExp = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
const englishNumbersExp = [/0/g, /1/g, /2/g, /3/g, /4/g, /5/g, /6/g, /7/g, /8/g, /9/g];
const persianNumbers = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
export const fixNumbers = (str: any) => {
  str = str.toString();
  if (typeof str === "string") {
    for (let i = 0; i < 10; i++) {
      str = str.replace(persianNumbersExp[i], i).replace(arabicNumbersExp[i], i);
    }
  }
  return str;
};
// Convert  English number to Persian
export const convertNumber = (str: any) => {
  str = str.toString();
  if (typeof str === "string") {
    for (let i = 0; i < 10; i++) {
      str = str.replace(englishNumbersExp[i], persianNumbers[i]);
    }
  }
  return str;
};
// Check if value Start (^) with a Persian word
export const checkPersianWord = (string: string) => {
  if (!/^[پچجحخهعغفقثصضشسیبلاتنمکگوئدذرزطظژؤإأءًٌٍَُِّ\s\n\r\t\d\(\)\[\]\{\}.,،;\-؛]+$/.test(string)) {
    //console.log('با کلمه فارسی شروع نشده');
  } else {
    //console.log('با کلمه فارسی شروع شده');
  }
};
// Don't Allow Specials Characters and numbers to type and replace them with remove, Work Fine
export const forceLetter = (e: any) => {
  let $input = e;
  $input.replace(/\d/g, "");
  $input.replace(/[&\/\\#,@@|+=!-_()$~%.'":*؟،×÷?<>{}]/g, "");
  //$input.replace(/\s/g,'');       // space
  return $input;
};
// Convert Second to M:S
export const secondsToMs = (d: any) => {
  d = Number(d);
  var m = Math.floor((d % 3600) / 60);
  var s = Math.floor((d % 3600) % 60);
  var mDisplay = m > 0 ? m + ":" : "00:";
  var sDisplay = s > 0 ? s : "00";
  return mDisplay + sDisplay;
};
// Calculate distance between 2 GPS coordinates in kilometer
export const getDistance = (lat1: any, lon1: any, lat2: any, lon2: any) => {
  const degreesToRadians = (degrees: any) => (degrees * Math.PI) / 180;
  let earthRadiusKm = 6371;
  let dLat = degreesToRadians(lat2 - lat1);
  let dLon = degreesToRadians(lon2 - lon1);
  lat1 = degreesToRadians(lat1);
  lat2 = degreesToRadians(lat2);
  let a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  let c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};
// Email Validation Regex
export const EMAIL_RX = /[A-Z0-9a-z._%+-]+@[A-Za-z0-9-]+\.[A-Za-z]{2,64}/;
// Mobile Validation Regex
export const Mobile_RX = /(\+98|0|98|0098)?([ ]|-|[()]){0,2}9[0-9]([ ]|-|[()]){0,2}(?:[0-9]([ ]|-|[()]){0,2}){8}/;
export const isClient = typeof window !== "undefined" && window.document && window.document.createElement;
export default numberSeparator;