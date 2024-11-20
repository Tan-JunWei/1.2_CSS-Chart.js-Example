async function fetchCSVFile() {
    try {
        const response = await fetch('food_orders_new_delhi.csv');
        const csvText = await response.text();
        const data = parseCSV(csvText);
        processAndRenderChart(data);
    } catch (error) {
        console.error("Error loading the CSV file:", error);
        document.getElementById('status').innerText = "Failed to load the CSV file.";
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
    const ctx = document.getElementById('deliveryChart').getContext('2d');
    const deliveryFees = data.slice(0, 1001).map(row => parseFloat(row["Delivery Fee"]));

    // Group the delivery fees (count how many times each delivery fee occurs)
    const feeGroups = deliveryFees.reduce((acc, fee) => {
        acc[fee] = (acc[fee] || 0) + 1; // If fee exists, increment; otherwise, initialize to 1
        return acc;
    }, {});

    // Prepare the data for the Doughnut chart
    const labels = Object.keys(feeGroups);  // Unique delivery fee values
    const dataValues = Object.values(feeGroups);  // Count of each delivery fee

    // Create Chart.js Doughnut chart
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,  // Unique delivery fee values as labels
            datasets: [{
                label: 'Delivery Fee Distribution',
                data: dataValues,  // Count of each delivery fee
                backgroundColor: ['rgba(255, 99, 132, 0.2)', 'rgba(54, 162, 235, 0.2)', 'rgba(255, 206, 86, 0.2)', 
                                   'rgba(75, 192, 192, 0.2)', 'rgba(153, 102, 255, 0.2)', 'rgba(255, 159, 64, 0.2)'],
                borderColor: ['rgba(255, 99, 132, 1)', 'rgba(54, 162, 235, 1)', 'rgba(255, 206, 86, 1)', 
                              'rgba(75, 192, 192, 1)', 'rgba(153, 102, 255, 1)', 'rgba(255, 159, 64, 1)'],
                borderWidth: 1,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                title: {
                    display: true,  
                    text: 'Delivery Fee Distribution',  
                    font: {
                        size: 20,  
                        weight: 'bold',  
                    },
                    padding: {
                        top: 10,
                        bottom: 15,
                    }
                },
                legend: {
                    position: 'bottom',
                },
                tooltip: {
                    callbacks: {
                        label: function(tooltipItem) {
                            const fee = tooltipItem.label;
                            const count = feeGroups[fee];
                            return `Delivery Fee: $${fee}, Count: ${count}`;
                        }
                    }
                }
            }
        }
    });
}

fetchCSVFile();


// const ctx = document.querySelector('#myChart');

// const myChart = new Chart(ctx, {
//     type: 'bar',
//     data: {
//         labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'], 
//         datasets: [{
//             label: '# of Votes',
//             data: [12, 19, 3, 5, 2, 3],
//             backgroundColor: [
//                 'rgba(255, 99, 132, 0.2)',
//                 'rgba(54, 162, 235, 0.2)',
//                 'rgba(255, 206, 86, 0.2)',
//                 'rgba(75, 192, 192, 0.2)',
//                 'rgba(153, 102, 255, 0.2)',
//                 'rgba(255, 159, 64, 0.2)'
//             ],
//             borderColor: [
//                 'rgba(255, 99, 132, 1)',
//                 'rgba(54, 162, 235, 1)',
//                 'rgba(255, 206, 86, 1)',
//                 'rgba(75, 192, 192, 1)',
//                 'rgba(153, 102, 255, 1)',
//                 'rgba(255, 159, 64, 1)'
//             ],
//             borderWidth: 1 // Border thickness
//         }]
//     },
//     options: {
//         scales: {
//             y: {
//                 beginAtZero: true // Ensure y-axis starts at 0
//             }
//         }
//     }
// });