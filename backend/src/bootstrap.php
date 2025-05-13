<?php
// Bootstrap file for DI and routing

require_once __DIR__ . '/../vendor/autoload.php';

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;
use App\Controllers\TestController;
use App\Services\TestService;

// Set up DI container
$container = new ContainerBuilder();
// Example: $container->register('some_service', SomeService::class);

// Register services in the DI container
$container->register(TestService::class, TestService::class);
$container->register(TestController::class, TestController::class)
    ->addArgument(new Reference(TestService::class));

// Simple routing mechanism
$routes = [
    '/test' => function () use ($container) {
        /** @var TestController $controller */
        $controller = $container->get(TestController::class);
        return $controller->testAction();
    },
];

// Get the current path
$path = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

header('Content-Type: application/json');
if (isset($routes[$path])) {
    echo $routes[$path]();
} else {
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} 