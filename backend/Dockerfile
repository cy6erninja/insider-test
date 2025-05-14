FROM php:8.4-cli

# Install system dependencies
RUN apt-get update && \
    apt-get install -y git unzip zip && \
    rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

# Allow Composer plugins as root (needed for Swagger annotations)
ENV COMPOSER_ALLOW_SUPERUSER=1

# Install dependencies and optimize autoloader
RUN composer install --no-dev --optimize-autoloader

# Fix directory casing for PSR-4 autoloading compliance in case-sensitive environments
RUN mv /app/src/Services /app/src/services && \
    mv /app/src/Controllers /app/src/controllers && \
    mv /app/src/Models /app/src/models

# Regenerate autoloader after directory renaming
RUN composer dump-autoload --optimize

ARG PORT=8080
ENV PORT=${PORT}

# Add CORS configuration support
ARG ALLOWED_ORIGINS="*"
ENV ALLOWED_ORIGINS=${ALLOWED_ORIGINS}

EXPOSE ${PORT}

CMD ["sh", "-c", "php -S 0.0.0.0:$PORT -t public"] 