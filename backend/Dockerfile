FROM php:8.4-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \
    nginx \
    supervisor \
    curl \
    libpng-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    oniguruma-dev \
    libzip-dev \
    postgresql-dev \
    sqlite-dev

# Install PHP extensions
RUN docker-php-ext-install pdo_mysql pdo_pgsql pdo_sqlite bcmath gd mbstring zip opcache

# Set working directory
WORKDIR /var/www/html

# Copy codebase
COPY . /var/www/html

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer
RUN composer install --no-dev --optimize-autoloader --no-interaction --no-progress

# Configure Nginx & Supervisor
COPY nginx.conf /etc/nginx/nginx.conf
COPY supervisor.conf /etc/supervisor/conf.d/supervisord.conf

# Setup entrypoint script
RUN chmod +x /var/www/html/docker-entrypoint.sh
ENTRYPOINT ["/var/www/html/docker-entrypoint.sh"]

# Set permissions for Laravel storage and cache directories
RUN mkdir -p /var/www/html/storage /var/www/html/bootstrap/cache /var/log/supervisor \
    && chmod -R 777 /var/www/html/storage /var/www/html/bootstrap/cache /var/log/supervisor

# Start supervisor
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
