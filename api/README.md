# Booking API

Backend for the GitHub Pages booking form.

Required environment variables:
- WHATSAPP_TOKEN (secret)
- WHATSAPP_PHONE_NUMBER_ID
- WHATSAPP_RECIPIENT=9647723774412
- WHATSAPP_TEMPLATE_NAME (recommended for reliable business-initiated notifications)
- WHATSAPP_TEMPLATE_LANG=ar
- GRAPH_API_VERSION=v25.0
- ALLOWED_ORIGIN=https://husseinalkhfaji.github.io

Endpoints:
- GET /health
- POST /submit-booking

Do not commit Meta access tokens to GitHub.
