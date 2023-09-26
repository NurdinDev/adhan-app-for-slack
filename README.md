## Adhan app for Slack

<a href="https://kfuivjdryd.execute-api.us-east-1.amazonaws.com/slack/install"><img alt="Add to Slack" height="40" width="139" src="https://platform.slack-edge.com/img/add_to_slack.png" srcSet="https://platform.slack-edge.com/img/add_to_slack.png 1x, https://platform.slack-edge.com/img/add_to_slack@2x.png 2x" /></a>

The Adhan Slack App serves as a convenient Islamic prayer times reminder for Slack users. With its easy configuration and high precision, this app ensures you're reminded of prayer times with friendly notifications.

<img src="./assets/cover1.1.png" width="30%"></img>
<img src="./assets/cover2.2.png" width="30%"></img>
<img src="./assets/cover3.3.png" width="30%"></img>

## Features

### Timings

- High precision Islamic prayer time.
- Support for various calculation methods:
  - Muslim World League, Egyptian General Authority of Survey, University of Islamic Sciences, Karachi, and more...

### Customizations

- Support for Arabic and English for prayer time names and reminder messages.
- Option to disable/enable reminders for specific prayer times.

## Project Structure

### 1. Slack-handler function

Handles Slack events and sends responses back, catering to interactive buttons and authentication.

- Triggered by API Gateway for routes: `POST: /slack/events`, `GET: /slack/install`, and `GET: /slack/oauth`.

### 2. Slack-cron function

Schedules prayer times for each user daily.

- Runs every 30 minutes, looking up users starting a new day based on their timezone.
- For a deeper understanding of this approach, refer to [this article](https://nurdin.dev/schedule-a-job-at-the-same-time-in-different-timezones).

### 3. Slack-post-message function

Triggered by EventBridge with the necessary payload to send messages to users.

- Only sends the message if the user's presence is ACTIVE.

## Development

### Setup

1. Create a Slack app and use the template in [manifest.yml](manifest.yml). **Links will be replaced after running the code locally**.
2. Install the Slack application in your workspace.
3. Clone the repo: `git clone git@github.com:NurdinDev/adhan-app-for-slack.git` and navigate to the directory: `cd Adhan-Slack-App`.

### Configuration

1. Create a `.env` file: `mv env.example .env`.
2. Fill in the necessary environment variables.
3. Optionally, run MongoDB using Docker: `docker compose up -d mongodb`.
4. Install dependencies: `yarn install`.

### Running

1. Start the project using one of the following commands:
    - `yarn start:dev` - This will start an Express app on port 3000.
    - `yarn dev` - This will start an serverless offline app on port 3000.
2. Use `ngrok` to expose your local server to an HTTPS endpoint: `ngrok http 3000`.
3. Update your Slack application's URLs with the provided HTTPS link from `ngrok`.

## Deployment

The app is deployed using the serverless framework to AWS Lambda. It configures the API Gateway and CloudWatch scheduler for background functions.

## Contributing

This project began as a learning journey into the Slack API. Recognizing its potential benefits for many, it was made open source. Contributions, feature additions, and bug fixes are welcomed.

## Credits

Special thanks to the [Adhan-js](https://github.com/batoulapps/adhan-js) package for their well-documented library.

## License

[MIT License](LICENSE.md).
