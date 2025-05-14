FROM php:8.4-cli

# Install minimal system dependencies for Composer
RUN apt-get update && \
    apt-get install -y unzip zip git && \
    rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

# Allow Composer plugins as root (needed for Swagger annotations)
ENV COMPOSER_ALLOW_SUPERUSER=1

# Install PHP dependencies (production only) and optimize autoloader
RUN composer install --no-dev --optimize-autoloader

# Runtime configuration
ARG PORT=8080
ENV PORT=${PORT}
ARG ALLOWED_ORIGINS="*"
ENV ALLOWED_ORIGINS=${ALLOWED_ORIGINS}

EXPOSE ${PORT}

CMD ["sh", "-c", "php -S 0.0.0.0:$PORT -t public"] 