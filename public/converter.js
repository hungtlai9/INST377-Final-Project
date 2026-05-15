const fromCurrency = document.getElementById("fromCurrency");
const toCurrency = document.getElementById("toCurrency");
const currencyForm = document.getElementById("currencyForm");
const result = document.getElementById("result");
const historyList = document.getElementById("historyList");

let conversionChart;

function populateCurrencies(){
  fetch("https://api.frankfurter.dev/v2/currencies")
    .then(response => response.json())
    .then(currencies => {
      currencies.forEach(function(currency){
        const option1 = document.createElement("option");
        option1.value = currency.iso_code;
        option1.textContent = currency.iso_code + " - " + currency.name;

        const option2 = document.createElement("option");
        option2.value = currency.iso_code;
        option2.textContent = currency.iso_code + " - " + currency.name;

        fromCurrency.appendChild(option1);
        toCurrency.appendChild(option2);
      });

      fromCurrency.value = "USD";
      toCurrency.value = "EUR";
    });
}

function convertCurrency(event){
  event.preventDefault();

  const amount = document.getElementById("amount").value;
  const from = fromCurrency.value;
  const to = toCurrency.value;

  if(from === to){
    result.textContent = "Please select different currencies.";
    return;
  }

  fetch(`https://api.frankfurter.dev/v2/rates?base=${from}&quotes=${to}`)
    .then(response => response.json())
    .then(data => {
      const rate = data[0].rate;
      const convertedAmount = amount * rate;

      const message =
        amount + " " + from + " = " +
        convertedAmount.toFixed(2) + " " + to;

      result.textContent = message;

      saveHistory({
        label: from + " to " + to,
        amount: Number(amount),
        convertedAmount: Number(convertedAmount.toFixed(2)),
        message: message
      });

      displayHistory();
    });
}

function saveHistory(conversion){
  let history =
    JSON.parse(localStorage.getItem("conversionHistory")) || [];

  history.push(conversion);

  localStorage.setItem(
    "conversionHistory",
    JSON.stringify(history)
  );
}

function displayHistory(){
  let history =
    JSON.parse(localStorage.getItem("conversionHistory")) || [];

  historyList.innerHTML = "";

  history.forEach(function(item){
    const li = document.createElement("li");
    li.textContent = item.message;
    historyList.appendChild(li);
  });

  displayChart(history);
}

function displayChart(history){
  const ctx = document.getElementById("conversionChart");

  const labels = history.map(function(item, index){
    return item.label + " #" + (index + 1);
  });

  const values = history.map(function(item){
    return item.convertedAmount;
  });

  if(conversionChart){
    conversionChart.destroy();
  }

  conversionChart = new Chart(ctx, {
    type: "bar",
    data: {
      labels: labels,
      datasets: [{
        label: "Converted Amount",
        data: values
      }]
    }
  });
}

window.onload = function(){
  populateCurrencies();
  displayHistory();

  currencyForm.addEventListener(
    "submit",
    convertCurrency
  );
};