"use strict";

//Разметка страницы
const container = document.createElement('div');
container.className = "container";
document.body.prepend(container);

const title = document.createElement('h1');
title.className = "title";
title.textContent = 'Курсы валют ЦБ';
document.body.prepend(title);

const unsortedList = document.createElement('ul');
unsortedList.className = "list";
container.append(unsortedList);

//========================================================================================================================================================
// Делегирование

document.querySelector('.list').addEventListener('click' , e => {
   e.preventDefault();
   const targetParent = e.target.closest('.item');
   if(!targetParent.classList.contains('active')) {
      targetParent.classList.add('active');
      const targetCurrency = targetParent.dataset.value;
      getUrls(prevDatesUrls,targetCurrency,targetParent);
   } else {
      targetParent.classList.remove('active');
      targetParent.querySelector('.sub-list').remove();
   }
});
//========================================================================================================================================================
// Получение и вывод курсов валют на сегодня
const getCurrencies = async  () => {
   const response = await fetch('https://www.cbr-xml-daily.ru/daily_json.js');
   const data = await response.json();
   const result = await data;
   
   const currencies = result.Valute;
   const keys = Object.keys(currencies);

   keys.map((key) => {
      const currencyKey = currencies[key];
      const currencyCode = currencyKey.CharCode;
      const currencyValue = currencyKey.Value;
      const currencyPrevValue = currencyKey.Previous;
      const currencyName = currencyKey.Name;
      const currencyTrend = (currencyValue - currencyPrevValue)/currencyValue * 100;

      const newElement = document.createElement('li');
      newElement.className = "item";
      newElement.dataset.value = `${currencyCode}`;
      newElement.innerHTML = `<a href="#"><span>${currencyCode}</span> <span>${currencyValue.toFixed(2)} руб.</span> 
      <span>${currencyTrend.toFixed(1)} %</span></a>`;
      document.querySelector('.list').append(newElement);
      const newSpan = document.createElement('span');
      newSpan.className = "item-text";
      newSpan.textContent = `${currencyName}`;
      newElement.append(newSpan);
   });
}

getCurrencies();

//========================================================================================================================================================

// Преобразование формата вывода даты к yyyy/mm/dd
Date.prototype.format = function(format = 'yyyy-mm-dd') {
   const replaces = {
       yyyy: this.getFullYear(),
       mm: ('0'+(this.getMonth() + 1)).slice(-2),
       dd: ('0'+this.getDate()).slice(-2),
   };
   let result = format;
   for(const replace in replaces){
       result = result.replace(replace,replaces[replace]);
   }
   return result;
};
       
// Установка даты на days дней раньше сегодняшней, возвращает дату в формате yyyy/mm/dd
function dtime_nums(days) {
   const n = new Date;
   n.setDate(n.getDate() + days);
   return n.format('yyyy/mm/dd');
 }
 
// Вычисление массива  с URL с данными по валютам за последние 10 дней 
let prevDatesUrls = [];
for(let i = 0; i < 10; i++) {
prevDatesUrls[i] =  `https://www.cbr-xml-daily.ru/archive/${dtime_nums(-i-1)}/daily_json.js`;
} 

//========================================================================================================================================================
// Получение и вывод исторических курсов валют за последние 10 дней
async function getUrls(urls,key,targetParent) {
   let jobs = [];
 
   for(let url of urls) {
     let job = fetch(`${url}`).then(
       successResponse => {
         if (successResponse.status != 200) {
           return null;
         } else {
           return successResponse.json();
         }
       },
       failResponse => {
         return null;
       }
     );
     jobs.push(job);
   }
 
   let results = await Promise.all(jobs);

   // Вывод данных
   const subList = document.createElement('ul');
   subList.className = "sub-list";
   targetParent.append(subList);

   results.map((result) => {
   const newEl = document.createElement('li');
   newEl.className = 'item item-sub';
   subList.append(newEl);
   if(result != null) {
      const currentRates = result.Valute[`${key}`].Value;
      const prevRates = result.Valute[`${key}`].Previous;
      const change = (currentRates - prevRates)/currentRates * 100;
      newEl.innerHTML = `<span>${currentRates.toFixed(2)} руб.</span> <span>${change.toFixed(1)} %</span>`;
      return currentRates
   } else {
      newEl.innerHTML = 'нет данных';
   }
});
}

 