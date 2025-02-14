const { exec } = require("child_process");

// Fetch real-time data for 'AAPL'
exec("python fetch_data.py AAPL", (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  // Parse the JSON data and use it
  const data = JSON.parse(stdout);
  console.log("Real-time data:", data);
});

// Fetch historical data for 'AAPL'
exec("python historical_data.py AAPL", (error, stdout, stderr) => {
  if (error) {
    console.error(`exec error: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  // Parse the JSON data and use it
  const data = JSON.parse(stdout);
  console.log("Historical data:", data);
});
