// Setup input and range synchronization
function setupInputRangeSync(inputSelector, rangeSelector, minValue, maxValue, initialValue) {
    const input = document.querySelector(inputSelector);
    const range = document.querySelector(rangeSelector);

    // Set initial values
    input.min = minValue;
    input.max = maxValue;
    input.value = Math.max(minValue, Math.min(initialValue, maxValue));
    range.min = minValue;
    range.max = maxValue;
    range.value = Math.max(minValue, Math.min(initialValue, maxValue));

    function updateValues() {
        let value = Number(input.value);
        value = Math.max(minValue, Math.min(value, maxValue)); // Ensure value is within range
        input.value = value;
        range.value = value;
    }

    input.addEventListener('change', () => {
        updateValues();
        calculate();
        updateCharts();
    });
    range.addEventListener('input', () => {
        input.value = range.value;
        calculate();
        updateCharts();
    });
}

// Format number as Indian currency
function formatIndianCurrency(amount) {
    let amountString = parseFloat(amount).toFixed(2);
    let [integerPart, decimalPart] = amountString.split('.');
    let lastThree = integerPart.slice(-3);
    let otherNumbers = integerPart.slice(0, -3);
    if (otherNumbers !== '') {
        lastThree = ',' + lastThree;
    }
    integerPart = otherNumbers.replace(/\B(?=(\d{2})+(?!\d))/g, ',') + lastThree;
    return `₹${integerPart}`;
}

// Calculate and populate table data
function calculate() {
    const tbody = document.querySelector('tbody');
    tbody.innerHTML = "";
    
    let interestRate = (Number(document.querySelector('#interest-input').value) / 12) / 100;
    let premium = Number(document.querySelector('#premium-input').value);
    let duration = Number(document.querySelector('#duration-input').value);
    let inflationRate = Number(document.querySelector('#inflation-input').value) / 100;
    let expectedReturn = Number(document.querySelector('#expected-return-input').value);

    for (let i = 0; i < duration; i++) {
        const tr = document.createElement('tr');
        const td = [];

        for (let j = 0; j < 8; j++) {
            td[j] = document.createElement('td');
        }

        td[0].innerHTML = `${i + 1}`;
        tr.appendChild(td[0]);

        let annualPremium = premium * 12;
        td[1].innerHTML = formatIndianCurrency(annualPremium);
        tr.appendChild(td[1]);

        let maturity = Math.round((premium * ((Math.pow((1 + interestRate), (12 * (i + 1))) - 1) / interestRate) * (1 + interestRate)));
        let interest = maturity - (annualPremium * (i + 1));

        td[2].innerHTML = formatIndianCurrency(annualPremium * (i + 1));
        tr.appendChild(td[2]);

        td[3].innerHTML = formatIndianCurrency(interest);
        tr.appendChild(td[3]);

        td[4].innerHTML = formatIndianCurrency(maturity);
        tr.appendChild(td[4]);

        let inflationAdjustedMaturity = maturity / Math.pow(1 + inflationRate, i + 1);
        td[5].innerHTML = formatIndianCurrency(inflationAdjustedMaturity);
        tr.appendChild(td[5]);

        
        td[6].innerHTML = formatIndianCurrency(expectedReturn);
        tr.appendChild(td[6]);

        let inflationAdjustedReturn = expectedReturn / Math.pow(1 + inflationRate, i + 1)
        td[7].innerHTML = formatIndianCurrency(inflationAdjustedReturn);
        tr.appendChild(td[7]);

        tbody.appendChild(tr);
    }
}

function updateCharts() {
    const premium = Number(document.querySelector('#premium-input').value);
    const duration = Number(document.querySelector('#duration-input').value);
    const interestRate = (Number(document.querySelector('#interest-input').value) / 12) / 100;
    const investmentDataDounut = Math.round(premium * 12 * duration); // Total investment over years
    const returnDataDounut = Math.round((premium * ((Math.pow((1 + interestRate), (12 * (duration))) - 1) / interestRate) * (1 + interestRate)) - investmentDataDounut);
    const expectedReturnIinput = document.querySelector('#expected-return-input');
    const years = Array.from({ length: duration + 1 }, (_, i) => i);

    // Arrays to store data for each year
    let investmentData = [];
    let returnData = [];
    let expectedReturn = [];
    let totalValue = [];
    
    for (let i = 0; i <= duration; i++) {
        
        // Total investment made till year i
        let cumulativeInvestment = premium * 12 * i;
        investmentData.push(cumulativeInvestment);

        // Calculate maturity amount at the end of year i
        let maturity = Math.round(
            (premium * ((Math.pow((1 + interestRate), (12 * i)) - 1) / interestRate) * (1 + interestRate))
        );

        // Calculate returns for year i
        let returns = maturity - cumulativeInvestment;
        totalValue.push(maturity)
        returnData.push(returns);
        expectedReturn.push(Number(expectedReturnIinput.value))
    }
    // Update Line Chart
    if (lineChart) {
        lineChart.data.labels = years;
        lineChart.data.datasets[0].data = totalValue;
        lineChart.data.datasets[1].data = investmentData;
        lineChart.data.datasets[2].data = returnData;
        lineChart.data.datasets[3].data = expectedReturn;
        lineChart.update();
    } else {
        lineChart = new Chart(ctxLine, {
            type: 'line',
            data: {
                labels: years,
                datasets: [
                    {
                        label: 'Total Value',
                        data: totalValue,
                        borderColor: '#1B5E20', // Medium Green
                        backgroundColor: 'rgba(76, 175, 80, 0.2)',
                        fill: true,
                    },
                    {
                        label: 'Investment Over Time',
                        data: investmentData,
                        borderColor: '#4CAF50', // Light Green
                        backgroundColor: 'rgba(129, 199, 132, 0.2)',
                        fill: true,
                    },
                    {
                        label: 'Intrest Over Time',
                        data: returnData,
                        borderColor: '#66BB6A', // Darker Green
                        backgroundColor: 'rgba(56, 142, 60, 0.2)',
                        fill: true,
                    },
                    {
                        label: 'Expected Return',
                        data: expectedReturn,
                        borderColor: '#388E3C', // Very Light Green
                        backgroundColor: 'rgba(197, 225, 165, 0.2)',
                        fill: true,
                    }                                       
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.dataset.label}: ${formatIndianCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }

    // Update Doughnut Chart
    if (doughnutChart) {
        doughnutChart.data.datasets[0].data = [investmentDataDounut, returnDataDounut];
        doughnutChart.update();
    } else {
        doughnutChart = new Chart(ctxDoughnut, {
            type: 'doughnut',
            data: {
                labels: ['Investment', 'Returns'],
                datasets: [{
                    label: 'Investment vs Returns',
                    data: [
                        investmentDataDounut,
                        returnDataDounut
                    ],
                    backgroundColor: ['#2e7d32', '#1b5e20'],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: true
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                return `${context.label}:  ${formatIndianCurrency(context.raw)}`;
                            }
                        }
                    }
                }
            }
        });
    }
}


// Initialize the charts
let lineChart, doughnutChart;
const ctxLine = document.getElementById('line-chart').getContext('2d');
const ctxDoughnut = document.getElementById('doughnut-chart').getContext('2d');

document.addEventListener('DOMContentLoaded', () => {
    setupInputRangeSync('#premium-input', '#premium-range', 0, 1000000, 25000);
    setupInputRangeSync('#duration-input', '#duration-range', 1, 100, 10);
    setupInputRangeSync('#interest-input', '#interest-range', 1, 100, 12);
    setupInputRangeSync('#inflation-input', '#inflation-range', 0, 100, 0);
    setupInputRangeSync('#expected-return-input', '#expected-return-range', 0, 100000000, 10000);

    calculate(); // Run initial calculation to populate the table
    updateCharts(); // Initialize charts with example data
});
