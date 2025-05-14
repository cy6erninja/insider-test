FROM php:8.4-cli

# Install system dependencies
RUN apt-get update && \
    apt-get install -y git unzip zip && \
    rm -rf /var/lib/apt/lists/*

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY . .

RUN composer install --no-dev --optimize-autoloader

ARG PORT=8080
ENV PORT=${PORT}
EXPOSE ${PORT}

CMD ["sh", "-c", "php -S 0.0.0.0:$PORT -t public"] 