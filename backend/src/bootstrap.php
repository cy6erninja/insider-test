<?php
// Bootstrap file for DI and routing

session_start();

require_once __DIR__ . '/../vendor/autoload.php';

use Symfony\Component\DependencyInjection\ContainerBuilder;
use Symfony\Component\DependencyInjection\Reference;
use App\Controllers\LeagueController;
use App\Services\LeagueService;

use Symfony\Component\Routing\Route;
use Symfony\Component\Routing\RouteCollection;
use Symfony\Component\Routing\RequestContext;
use Symfony\Component\Routing\Matcher\UrlMatcher;
use Symfony\Component\Routing\Exception\ResourceNotFoundException;
use Symfony\Component\Routing\Exception\MethodNotAllowedException;
use App\Services\LeagueDataService;
use Symfony\Component\HttpFoundation\Response;

// OpenAPI info is now defined in the controller with attributes

// Set up DI container
$container = new ContainerBuilder();
$container->register(LeagueDataService::class, LeagueDataService::class);
$container->register(LeagueService::class, LeagueService::class)
    ->addArgument(new Reference(LeagueDataService::class));
$container->register(LeagueController::class, LeagueController::class)
    ->addArgument(new Reference(LeagueService::class));

// Define routes
$routes = new RouteCollection();
$routes->add('league_results', new Route('/league/results', [
    '_controller' => [LeagueController::class, 'getLeagueResults']
], [], [], '', [], ['GET']));
$routes->add('league_reset', new Route('/league/reset', [
    '_controller' => [LeagueController::class, 'reset']
], [], [], '', [], ['POST']));
$routes->add('league_week_results', new Route('/league/week/{week}', [
    '_controller' => [LeagueController::class, 'getWeekResults']
], [], [], '', [], ['GET']));
$routes->add('league_week_predictions', new Route('/league/week/{week}/predictions', [
    '_controller' => [LeagueController::class, 'getWeekPredictions']
], [], [], '', [], ['GET']));
$routes->add('league_play_all_weeks', new Route('/league/play-all-weeks', [
    '_controller' => [LeagueController::class, 'playAllWeeks']
], [], [], '', [], ['POST']));
$routes->add('league_play_week', new Route('/league/play-week/{week}', [
    '_controller' => [LeagueController::class, 'playWeek']
], [], [], '', [], ['POST']));

// Add Swagger route
$routes->add('swagger', new Route('/swagger', [
    '_controller' => function () {
        // Return Swagger UI HTML content from file
        return file_get_contents(__DIR__ . '/views/swagger-ui.html');
    }
], [], [], '', [], ['GET']));

// Add Swagger JSON route
$routes->add('swagger_json', new Route('/swagger-json', [
    '_controller' => function () {
        // Set Content-Type and CORS headers first
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        
        // Turn off error output to prevent warnings in JSON
        $oldErrorReporting = error_reporting(0);
        ob_start();
        
        try {
            // Generate OpenAPI documentation from attributes
            $openapi = \OpenApi\Generator::scan([
                __DIR__ . '/Controllers'
            ], [
                'validate' => false
            ]);
            
            // Clean the output buffer in case any warnings were printed
            ob_end_clean();
            
            // Restore error reporting level
            error_reporting($oldErrorReporting);
            
            // Manually create a minimal valid OpenAPI spec if the generator fails
            if (!$openapi || empty($openapi->paths)) {
                $openapi = new \OpenApi\Annotations\OpenApi([
                    'openapi' => '3.0.0',
                    'info' => new \OpenApi\Annotations\Info([
                        'title' => 'Insider Champion League API',
                        'version' => '1.0.0',
                        'description' => 'API for the Insider Champion League simulation'
                    ]),
                    'paths' => [
                        new \OpenApi\Annotations\PathItem([
                            'path' => '/league/results',
                            'get' => new \OpenApi\Annotations\Get([
                                'summary' => 'Get league results',
                                'tags' => ['League'],
                                'responses' => [
                                    new \OpenApi\Annotations\Response([
                                        'response' => 200,
                                        'description' => 'League table with current standings'
                                    ])
                                ]
                            ])
                        ])
                    ]
                ]);
            }
            
            // Return properly formatted JSON
            return $openapi->toJson();
        } catch (\Exception $e) {
            // Clean the output buffer
            ob_end_clean();
            
            // Restore error reporting level
            error_reporting($oldErrorReporting);
            
            // Return error information
            return json_encode([
                'openapi' => '3.0.0',
                'info' => [
                    'title' => 'API Documentation Error',
                    'version' => '1.0.0',
                    'description' => 'Error generating API documentation: ' . $e->getMessage()
                ]
            ]);
        }
    }
], [], [], '', [], ['GET']));

// Create request context
$context = new RequestContext();
$context->setPathInfo(parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH));
$context->setMethod($_SERVER['REQUEST_METHOD']);
$matcher = new UrlMatcher($routes, $context);

// Set CORS headers for all API responses
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Get allowed origins from environment or use defaults
$allowed_origins = getenv('ALLOWED_ORIGINS') ? 
    explode(',', getenv('ALLOWED_ORIGINS')) : 
    [
        'http://localhost:3000',                       // Local development
        'https://localhost:3000',                      // Local development with HTTPS
        'https://cy6erninja.github.io',                  // GitHub Pages
        'https://cy6erninja.github.io/insider-test',      // GitHub Pages with repo path
        '*'
    ];

// Loop through all the allowed origins to find a match
$origin_is_allowed = false;
foreach ($allowed_origins as $allowed_origin) {
    if ($origin === $allowed_origin || $allowed_origin === '*') {
        $origin_is_allowed = true;
        header("Access-Control-Allow-Origin: $origin");
        break;
    }
}

// If no specific origin matched but we want to allow any origin
if (!$origin_is_allowed && in_array('*', $allowed_origins)) {
    header('Access-Control-Allow-Origin: *');
} elseif ($origin_is_allowed) {
    // Additional CORS headers when origin is allowed
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization');
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

try {
    $parameters = $matcher->match($context->getPathInfo());
    $result = null;
    
    if (is_callable($parameters['_controller'])) {
        // Call anonymous function controller
        $result = $parameters['_controller']();
    } else {
        // Call class method controller
        [$controllerClass, $method] = $parameters['_controller'];
        $controller = $container->get($controllerClass);
        $result = $controller->$method(...array_filter($parameters, function($key) {
            return !str_starts_with($key, '_');
        }, ARRAY_FILTER_USE_KEY));
    }
    
    // If the controller returned a Symfony Response, send it
    if ($result instanceof Response) {
        $result->send();
    } else {
        // Only set JSON content type for API routes, not for Swagger UI
        if ($parameters['_route'] !== 'swagger' && $parameters['_route'] !== 'swagger_json') {
            header('Content-Type: application/json');
        }
        echo $result;
    }
} catch (ResourceNotFoundException $e) {
    header('Content-Type: application/json');
    http_response_code(404);
    echo json_encode(['error' => 'Not found']);
} catch (MethodNotAllowedException $e) {
    header('Content-Type: application/json');
    http_response_code(405);
    echo json_encode(['error' => 'Method Not Allowed']);
} catch (Exception $e) {
    header('Content-Type: application/json');
    http_response_code(500);
    echo json_encode(['error' => 'Internal Server Error', 'message' => $e->getMessage()]);
} 