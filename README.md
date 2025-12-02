# Tumbi F1 Backend Deployment on Render

This document provides instructions for deploying the Tumbi F1 backend to Render.

## Prerequisites

- A Render account
- A Cloudflare account with a configured R2 bucket and a worker for handling file uploads
- A Neon account for the PostgreSQL database

## Deployment Steps

1. **Fork the repository** to your GitHub account.
2. **Create a new Blueprint instance** on Render and connect it to your forked repository.
3. **Define the services** in the `render.yaml` file. A pre-configured `render.yaml` file is included in this repository.
4. **Set the environment variables** for the backend service in the Render dashboard:
   - `DATABASE_URL`: The connection string for your Neon PostgreSQL database.
   - `CLOUDFLARE_WORKER_URL`: The URL for your Cloudflare worker.
5. **Deploy the application.** Render will automatically build and deploy the backend based on the `render.yaml` configuration.

## Post-Deployment

After the initial deployment, you can set up a custom domain and configure automatic deployments from your GitHub repository.
