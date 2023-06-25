# Birrita Project

This project is named Birrita. A Postman collection file has been provided for testing purposes. Additionally, Swagger has been integrated into the project, providing a means to interact with the API directly, which is available at the /api path.

A JWT login system has been developed, restricting the ability to create new beer dispensers to admin users only.

Authentication is not required for the rest of the endpoints.

A CRON job has been implemented to monitor tap opening times, and certain limits have been established for litres per person and maximum tap opening time in order to make the solution more closely resemble a real-world scenario.

Writes have been implemented with transactions for enhanced security.

## Setup and Run

To setup and run the project, use the following commands:

1. Install the necessary packages:

```sh
npm install
```

2. Run the project:

```sh
npm run start
```

## Testing with Postman

A Postman collection has been included in the repository for testing the API endpoints. Import the collection into Postman and execute the requests.

## Swagger API Documentation

The Swagger API documentation is available at `/api` path on the running server. You can interact with the API directly using Swagger.

## JWT Authentication

JWT authentication is used to restrict the ability to create new beer dispensers to admin users only. Use the login endpoint to authenticate.

## CRON Job

A CRON job runs regularly to monitor and enforce limits for litres per person and maximum tap opening time.

## Transactional Writes

Writes to the database are handled with transactions to ensure data integrity and consistency.