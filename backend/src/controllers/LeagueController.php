<?php

namespace App\Controllers;

use App\Services\LeagueService;
use App\Services\LeagueDataService;
use OpenApi\Attributes as OA;
use Symfony\Component\HttpFoundation\Response;

#[OA\Info(
    title: 'Insider Champion League API',
    version: '1.0.0',
    description: 'API for managing the Insider Champion League simulation'
)]

#[OA\Server(
    url: '/',
    description: 'API Server'
)]

#[OA\Schema(
    schema: 'TeamStats',
    properties: [
        new OA\Property(property: 'team_id', type: 'integer', example: 1),
        new OA\Property(property: 'team', type: 'string', example: 'Chelsea'),
        new OA\Property(property: 'PTS', type: 'integer', example: 0),
        new OA\Property(property: 'P', type: 'integer', example: 0),
        new OA\Property(property: 'W', type: 'integer', example: 0),
        new OA\Property(property: 'D', type: 'integer', example: 0),
        new OA\Property(property: 'L', type: 'integer', example: 0),
        new OA\Property(property: 'GD', type: 'integer', example: 0)
    ]
)]

#[OA\Schema(
    schema: 'MatchResult',
    properties: [
        new OA\Property(property: 'home', type: 'string', example: 'Chelsea'),
        new OA\Property(property: 'away', type: 'string', example: 'Arsenal'),
        new OA\Property(property: 'score', type: 'string', example: '2-1'),
        new OA\Property(
            property: 'events', 
            type: 'array', 
            items: new OA\Items(type: 'string'),
            example: ['Red card: Arsenal']
        )
    ]
)]
#[OA\Tag(name: 'League', description: 'League operations')]
class LeagueController
{
    public function __construct(
        private LeagueService $leagueService
    ) {}
    
    #[OA\Get(
        path: '/league/results',
        summary: 'Get current league standings',
        tags: ['League'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'League table with current standings',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'table',
                            type: 'array',
                            items: new OA\Items(ref: '#/components/schemas/TeamStats')
                        )
                    ]
                )
            )
        ]
    )]
    public function getLeagueResults(): Response
    {
        $table = $this->leagueService->getLeagueResults();
        // Get total weeks from the League object
        $league = $this->leagueService->getLeagueDataService()->getLeagueData();
        $totalWeeks = $league->getTotalWeeks();
        return new Response(json_encode(['data' => $table, 'totalWeeks' => $totalWeeks]), 200, ['Content-Type' => 'application/json']);
    }

    #[OA\Get(
        path: '/league/week/{week}',
        summary: 'Get match results for a specific week',
        tags: ['League'],
        parameters: [
            new OA\Parameter(
                name: 'week',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Week results',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(
                            property: 'data',
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'week', type: 'integer', example: 1),
                                new OA\Property(
                                    property: 'results',
                                    type: 'array',
                                    items: new OA\Items(ref: '#/components/schemas/MatchResult')
                                )
                            ]
                        )
                    ]
                )
            )
        ]
    )]
    public function getWeekResults(int $week): Response
    {
        $games = $this->leagueService->getWeekResults($week);

        $results = array_map(function ($game) {
            return [
                'home' => $game->getHomeTeam()->getName(),
                'away' => $game->getAwayTeam()->getName(),
                'score' => ($game->getHomeGoals() !== null && $game->getAwayGoals() !== null)
                    ? $game->getHomeGoals() . '-' . $game->getAwayGoals() : null
            ];
        }, $games);
        return new Response(json_encode(['data' => $results]), 200, ['Content-Type' => 'application/json']);
    }

    #[OA\Get(
        path: '/league/week/{week}/predictions',
        summary: 'Get predictions for a specific week',
        tags: ['League'],
        parameters: [
            new OA\Parameter(
                name: 'week',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Week predictions',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Week 1 predictions retrieved.')
                    ]
                )
            )
        ]
    )]
    public function getWeekPredictions(int $week): Response
    {
        $predictions = $this->leagueService->getWeekPredictions($week);
        return new Response(json_encode(['data' => $predictions]), 200, ['Content-Type' => 'application/json']);
    }

    #[OA\Post(
        path: '/league/play-all-weeks',
        summary: 'Simulate all remaining weeks',
        tags: ['League'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'All weeks simulated',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'results', type: 'object'),
                        new OA\Property(property: 'table', type: 'array', items: new OA\Items(ref: '#/components/schemas/TeamStats'))
                    ]
                )
            )
        ]
    )]
    public function playAllWeeks(): Response
    {
        $result = $this->leagueService->playAllWeeks();
        
        // Check for validation errors
        if (isset($result['summary']) && $result['summary']['weeks_blocked'] > 0) {
            return new Response(json_encode([
                'message' => 'Some weeks could not be played due to sequential week validation.'
            ]), 400, ['Content-Type' => 'application/json']);
        }
        
        return new Response(json_encode(['data' => $result]), 200, ['Content-Type' => 'application/json']);
    }

    #[OA\Post(
        path: '/league/play-week/{week}',
        summary: 'Simulate games for a specific week',
        tags: ['League'],
        parameters: [
            new OA\Parameter(
                name: 'week',
                in: 'path',
                required: true,
                schema: new OA\Schema(type: 'integer')
            )
        ],
        responses: [
            new OA\Response(
                response: 200,
                description: 'Week games simulated',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'Week 1 played successfully'),
                        new OA\Property(
                            property: 'data',
                            type: 'object',
                            properties: [
                                new OA\Property(property: 'week', type: 'integer', example: 1),
                                new OA\Property(
                                    property: 'results',
                                    type: 'array',
                                    items: new OA\Items(ref: '#/components/schemas/MatchResult')
                                ),
                                new OA\Property(
                                    property: 'table',
                                    type: 'array',
                                    items: new OA\Items(ref: '#/components/schemas/TeamStats')
                                )
                            ]
                        )
                    ]
                )
            )
        ]
    )]
    public function playWeek(int $week): Response
    {
        try {
            $result = $this->leagueService->playWeek($week);
        } catch (\OutOfBoundsException $e) {
            return new Response(json_encode(['message' => $e->getMessage()]), 404, ['Content-Type' => 'application/json']);
        }
        
        // Check for error messages
        if (isset($result['message'])) {
            // Determine the appropriate status code
            $statusCode = 200; // Default success
            
            if (strpos($result['message'], 'Cannot play week') !== false) {
                // Sequential week validation error (client error)
                return new Response(json_encode([
                    'message' => $result['message']
                ]), 400, ['Content-Type' => 'application/json']);
            } else if (strpos($result['message'], 'already been played') !== false) {
                // Week already played (conflict)
                return new Response(json_encode([
                    'message' => $result['message']
                ]), 409, ['Content-Type' => 'application/json']);
            }
        }
        
        // Success case
        return new Response(json_encode(['data' => $result]), 200, ['Content-Type' => 'application/json']);
    }

    #[OA\Post(
        path: '/league/reset',
        operationId: 'resetLeague',
        summary: 'Reset the league to initial state',
        tags: ['League'],
        responses: [
            new OA\Response(
                response: 200,
                description: 'League has been reset to initial state',
                content: new OA\JsonContent(
                    properties: [
                        new OA\Property(property: 'status', type: 'string', example: 'success'),
                        new OA\Property(property: 'message', type: 'string', example: 'League has been reset to initial state.'),
                        new OA\Property(
                            property: 'table',
                            type: 'array',
                            items: new OA\Items(ref: '#/components/schemas/TeamStats')
                        )
                    ]
                )
            )
        ]
    )]
    public function reset(): Response
    {
        $leagueData = $this->leagueService->reset();

        return new Response(json_encode(['data' => $leagueData]), 200, ['Content-Type' => 'application/json']);
    }
} 