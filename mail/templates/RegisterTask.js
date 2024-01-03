exports.RegisterTask = (userName, taskName, description,hours) => {
    return `
        <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        background-color: #f2f2f2;
                        padding: 20px;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        background-color: #ffffff;
                        padding: 20px;
                        border-radius: 10px;
                        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                    }
                    h2 {
                        color: #333333;
                    }
                    p {
                        color: #666666;
                    }
                    .task-details {
                        margin-top: 20px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <h2>Hello ${userName}!</h2>
                    <p>We hope this message finds you well. This is a reminder that Task is Register so complete this:</p>
                    
                    <div class="task-details">
                        <h3>Task Details:</h3>
                        <p><strong>Task Name:</strong> ${taskName}</p>
                        <p><strong>Description:</strong> ${description}</p>
                        <p><strong>Completed in:</strong> ${hours} Hours</p>
                    </div>
                    
                    <p>Please take the necessary actions to complete your task in a timely manner.</p>
                    
                    <p>Thank you!</p>
                </div>
            </body>
        </html>
    `;
};
