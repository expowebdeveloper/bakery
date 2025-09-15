# your_app/middleware.py

import json
import logging
import time

from django.utils.deprecation import MiddlewareMixin

logger = logging.getLogger("api_logger")
SENSITIVE_FIELDS = ["password", "token", "authorization"]


def sanitize_data(data):
    if isinstance(data, dict):
        return {
            key: ("***" if key.lower() in SENSITIVE_FIELDS else sanitize_data(value))
            for key, value in data.items()
        }
    elif isinstance(data, list):
        return [sanitize_data(item) for item in data]
    else:
        return data


class APILoggingMiddleware(MiddlewareMixin):
    def process_request(self, request):
        request.start_time = time.time()
        try:
            body = request.body.decode("utf-8")
            if request.content_type == "application/json":
                body = json.loads(body)
        except Exception:
            body = "Unable to decode body"

        sanitized_body = sanitize_data(body) if isinstance(body, dict) else body
        sanitized_headers = self.sanitize_headers(request.headers)

        logger.info(
            f"Request: {request.method} {request.get_full_path()} "
            f"Headers: {sanitized_headers} Body: {sanitized_body}"
        )

    def process_response(self, request, response):
        duration = time.time() - getattr(request, "start_time", time.time())
        try:
            response_content = response.content.decode("utf-8")
            if response["Content-Type"] == "application/json":
                response_content = json.loads(response_content)
        except Exception:
            response_content = "Unable to decode response"

        sanitized_response = (
            sanitize_data(response_content)
            if isinstance(response_content, dict)
            else response_content
        )
        sanitized_headers = self.sanitize_headers(response.headers)

        logger.info(
            f"Response: {response.status_code} "
            f"Headers: {sanitized_headers} Body: {sanitized_response} "
            f"Duration: {duration:.2f}s"
        )
        return response

    def sanitize_headers(self, headers):
        sanitized = {}
        for key, value in headers.items():  # Correctly iterating over key-value pairs
            if key.lower() in SENSITIVE_FIELDS:
                sanitized[key] = "***"
            else:
                sanitized[key] = value
        return sanitized
