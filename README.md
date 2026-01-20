# Google Cloud Pub/Sub QA Consumer

This repository contains simple Node.js scripts to **consume and validate connectivity** to Google Cloud Pub/Sub subscriptions in the QA environment using a **consumer-only service account**.

## Prerequisites

- Node.js 18+
- Access to the service account key file (`gsa-pubsub-qa.json`)
- Access to the configured Pub/Sub subscriptions

## Install dependencies

```bash
npm install
```
## Run
### Test
```bash
node .\test_connection.js
```
<img width="656" height="180" alt="image" src="https://github.com/user-attachments/assets/f78cf196-f3c1-41f0-bfdc-45758dba4601" />


### Subscriber
```bash
node .\subscriber.js
```
<img width="546" height="137" alt="image" src="https://github.com/user-attachments/assets/cd083b7b-ab15-410b-941e-35542876a3fd" />
