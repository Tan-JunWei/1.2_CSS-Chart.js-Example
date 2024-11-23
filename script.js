async function fetchCSVFile() {
    try {
        const response = await fetch('food_orders_new_delhi.csv');
        const csvText = await response.text();
        const data = parseCSV(csvText);
        const sortedData = sortByOrderDate(data);
        processAndRenderChart(sortedData);
    } catch (error) {
        console.error("Error loading the CSV file:", error);
    }
}

function parseCSV(csvText) {
    const rows = csvText.trim().split('\n'); // Split the CSV text into an array of rows
    const headers = rows.shift().split(','); 
    return rows.map(row => {
        const values = row.split(',');
        return headers.reduce((accumulator, header, index) => {
            accumulator[header] = values[index];
            return accumulator;
        }, {});
    });
}

function sortByOrderDate(data) {
    return data.sort((a, b) => {
        const dateA = new Date(a['Order Date and Time']);
        const dateB = new Date(b['Order Date and Time']);
        return dateA - dateB; // Ascending order
    });
}

function processAndRenderChart(data) {
    // Aggregate data by date (daily totals for Order Value and Commission Fee)
    const dailyAggregates = {};
    data.forEach(order => {
        // Extract the date from "Order Date and Time"
        const date = order["Order Date and Time"].split(" ")[0];
        const orderValue = parseFloat(order["Order Value"]);
        const CommissionFee = parseFloat(order["Commission Fee"]);

        if (!dailyAggregates[date]) {
            dailyAggregates[date] = { orderValue: 0, CommissionFee: 0 };
        }
        
        dailyAggregates[date].orderValue += orderValue;
        dailyAggregates[date].CommissionFee += CommissionFee;
    });

    const labels = Object.keys(dailyAggregates); 
    const orderValues = labels.map(date => dailyAggregates[date].orderValue);
    const CommissionFees = labels.map(date => dailyAggregates[date].CommissionFee);

    renderLineChart(labels, orderValues, CommissionFees);
}

function renderLineChart(labels, orderValues, CommissionFees) {
    const ctxLine = document.getElementById("orderLineChart").getContext("2d");
    ctxLine.canvas.height = 500;
    ctxLine.canvas.width = 1300;

    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: labels, 
            datasets: [
                {
                    label: "Order Value",
                    data: orderValues,
                    fill: true,
                    backgroundColor: "rgba(54, 162, 235, 0.3)", 
                    borderColor: "rgba(54, 162, 235, 1)",  
                    borderWidth: 2, 
                    tension: 0.4,  
                    pointRadius: 4,  
                    pointBackgroundColor: "rgba(54, 162, 235, 1)",
                },
                {
                    label: "Commission Fee",
                    data: CommissionFees,
                    fill: true,
                    backgroundColor: "rgba(242, 10, 110, 0.3)",
                    borderColor: "rgba(242, 10, 110, 1)", 
                    borderWidth: 2, 
                    tension: 0.4, 
                    pointRadius: 4, 
                    pointBackgroundColor: "rgba(242, 10, 110, 1)", 
                }
            ]
        },
        options: {
            responsive: false,
            maintainAspectRatio: false, 
            aspectRatio: 1.5,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        usePointStyle: true, 
                        font: {
                            size: 15,  
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", 
                        },
                        padding: 20,  
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: { size: 15, weight: 'bold' },
                    bodyFont: { size: 15 },
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toFixed(2)}`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Daily Trends: Order Value and Commission Fee',
                    font: { size: 20, weight: 'bold' },
                    padding: { bottom: 10 },
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)',
                        font: { size: 15 },  
                    },
                    grid: {
                        borderColor: '#E0E0E0',
                        color: 'rgba(0, 0, 0, 0.1)', 
                    },
                    ticks: {
                        font: { size: 15 }, 
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        font: { size: 15 }, 
                    },
                    grid: {
                        borderColor: '#E0E0E0', 
                        color: 'rgba(0, 0, 0, 0.1)', 
                    },
                    ticks: {
                        font: { size: 12 },
                        autoSkip: true,
                        maxRotation: 45, 
                        minRotation: 45,
                    }
                }
            }
        }
    });
}



fetchCSVFile();
