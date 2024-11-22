async function fetchCSVFile() {
    try {
        const response = await fetch('food_orders_new_delhi.csv');
        const csvText = await response.text();
        const data = parseCSV(csvText);
        processAndRenderChart(data);
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

function processAndRenderChart(data) {
    // Aggregate data by date (daily totals for Order Value and Delivery Fee)
    const dailyAggregates = {};
    data.forEach(order => {
        // Extract the date from "Order Date and Time"
        const date = order["Order Date and Time"].split(" ")[0];
        const orderValue = parseFloat(order["Order Value"]);
        const deliveryFee = parseFloat(order["Delivery Fee"]);

        if (!dailyAggregates[date]) {
            dailyAggregates[date] = { orderValue: 0, deliveryFee: 0 };
        }
        
        dailyAggregates[date].orderValue += orderValue;
        dailyAggregates[date].deliveryFee += deliveryFee;
    });

    // Prepare data for the line chart
    const labels = Object.keys(dailyAggregates); // Dates as labels
    const orderValues = labels.map(date => dailyAggregates[date].orderValue);
    const deliveryFees = labels.map(date => dailyAggregates[date].deliveryFee);

    renderLineChart(labels, orderValues, deliveryFees);
}

function renderLineChart(labels, orderValues, deliveryFees) {
    const ctxLine = document.getElementById("orderLineChart").getContext("2d");

    // Adding chart options for smoother transitions, tooltips, and interactivity
    new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: labels, // Dates as x-axis labels
            datasets: [
                {
                    label: "Order Value",
                    data: orderValues,
                    fill: true,
                    backgroundColor: "rgba(54, 162, 235, 0.3)", // Light blue fill
                    borderColor: "rgba(54, 162, 235, 1)",  // Blue line
                    borderWidth: 2,  // Thicker line for emphasis
                    tension: 0.2,  // Slight curve to the line (small tension for smoothness)
                    pointRadius: 4,  // Larger points
                    pointBackgroundColor: "rgba(54, 162, 235, 1)", // Same as line color
                },
                {
                    label: "Delivery Fee",
                    data: deliveryFees,
                    fill: true,
                    backgroundColor: "rgba(255, 99, 132, 0.3)", // Light red fill
                    borderColor: "rgba(255, 99, 132, 1)",  // Red line
                    borderWidth: 2,  // Thicker line for emphasis
                    tension: 0.2,  // Slight curve to the line
                    pointRadius: 4,  // Larger points
                    pointBackgroundColor: "rgba(255, 99, 132, 1)", // Same as line color
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Allow resizing freely
            aspectRatio: 1.5, // Adjust the aspect ratio (height / width) of the chart
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        usePointStyle: true,  // Use point style for the legend (circle)
                        font: {
                            size: 12,  // Smaller font for legend labels (can be adjusted)
                            family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif", // Cleaner font
                        }
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0, 0, 0, 0.7)',
                    titleFont: { size: 12, weight: 'bold' },
                    bodyFont: { size: 10 },
                    callbacks: {
                        label: function(tooltipItem) {
                            return `${tooltipItem.dataset.label}: $${tooltipItem.raw.toFixed(2)}`;
                        }
                    }
                },
                title: {
                    display: true,
                    text: 'Daily Trends: Order Value and Delivery Fee',
                    font: { size: 14, weight: 'bold' },
                    padding: { bottom: 10 },
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Amount ($)',
                        font: { size: 12 },  // Smaller font for the y-axis title
                    },
                    grid: {
                        borderColor: '#E0E0E0', // Light grey grid lines
                        color: 'rgba(0, 0, 0, 0.1)', // Subtle grid lines
                    },
                    ticks: {
                        font: { size: 10 }, // Smaller font for y-axis ticks
                    }
                },
                x: {
                    title: {
                        display: true,
                        text: 'Date',
                        font: { size: 12 },  // Smaller font for the x-axis title
                    },
                    grid: {
                        borderColor: '#E0E0E0', // Light grey grid lines
                        color: 'rgba(0, 0, 0, 0.1)', // Subtle grid lines
                    },
                    ticks: {
                        font: { size: 10 }, // Smaller font for x-axis ticks
                        autoSkip: true,
                        maxRotation: 45, // Rotate labels to avoid overlap
                        minRotation: 45,
                    }
                }
            }
        }
    });
}



fetchCSVFile();
