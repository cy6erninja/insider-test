<?php

declare(strict_types=1);

namespace Tests;

use PHPUnit\Framework\TestCase;
use App\Services\LeagueService;
use App\Services\LeagueDataService;
use App\Models\League;
use App\Models\Team;
use App\Models\Game;

class LeagueServiceTest extends TestCase
{
    private LeagueService $leagueService;
    private LeagueDataService $leagueDataService;

    protected function setUp(): void
    {
        // Arrange: create a LeagueDataService and LeagueService
        if (session_status() === PHP_SESSION_NONE) {
            session_start();
        }
        $this->leagueDataService = new LeagueDataService();
        $this->leagueService = new LeagueService($this->leagueDataService);
    }

    /**
     * @runInSeparateProcess
     */
    public function testGenerateLeagueTableMultipleGames(): void
    {
        // Arrange: Chelsea beats Arsenal, then they draw
        $teams = [
            new Team(1, 'Chelsea', 90),
            new Team(2, 'Arsenal', 85),
        ];
        $games = [
            new Game(1, $teams[0], $teams[1], 1, 2, 1), // Chelsea 2-1 Arsenal
            new Game(2, $teams[1], $teams[0], 2, 0, 0), // Arsenal 0-0 Chelsea
        ];
        $league = new League(1, 'Test League', $teams, $games);
        // Act
        $table = (new \ReflectionClass($this->leagueService))
            ->getMethod('generateLeagueTable')
            ->invoke($this->leagueService, $league);
        // Assert
        $pointsByTeam = [];
        foreach ($table as $row) {
            $pointsByTeam[$row['team']] = $row;
        }
        $this->assertEquals([
            'PTS' => 4, 'W' => 1, 'D' => 1, 'L' => 0, 'GD' => 1, 'P' => 2
        ], array_intersect_key($pointsByTeam['Chelsea'], array_flip(['PTS','W','D','L','GD','P'])));
        $this->assertEquals([
            'PTS' => 1, 'W' => 0, 'D' => 1, 'L' => 1, 'GD' => -1, 'P' => 2
        ], array_intersect_key($pointsByTeam['Arsenal'], array_flip(['PTS','W','D','L','GD','P'])));
    }

    /**
     * @runInSeparateProcess
     */
    public function testPlayWeekSimulatesResults(): void
    {
        // Arrange
        $this->leagueDataService->resetLeague();
        $league = $this->leagueDataService->getLeagueData();
        $week = 1;
        // Act
        $result = $this->leagueService->playWeek($week);
        // Assert
        $this->assertArrayHasKey('results', $result);
        $this->assertNotEmpty($result['results']);
        foreach ($result['results'] as $match) {
            $this->assertArrayHasKey('home', $match);
            $this->assertArrayHasKey('away', $match);
            $this->assertMatchesRegularExpression('/^\d+-\d+$/', $match['score']);
        }
    }

    /**
     * @runInSeparateProcess
     */
    public function testGetWeekPredictionsReturnsProbabilities(): void
    {
        // Arrange
        $this->leagueDataService->resetLeague();
        $week = 1;
        // Act
        $predictions = $this->leagueService->getWeekPredictions($week);
        // Assert
        $this->assertIsArray($predictions);
        $this->assertNotEmpty($predictions);
        foreach ($predictions as $prediction) {
            $this->assertArrayHasKey('team', $prediction);
            $this->assertArrayHasKey('chance', $prediction);
            $this->assertIsNumeric($prediction['chance']);
        }
    }

    /**
     * @runInSeparateProcess
     */
    public function testGenerateLeagueTableHomeWin(): void
    {
        // Arrange: Chelsea beats Arsenal 2-1
        $teams = [
            new Team(1, 'Chelsea', 90),
            new Team(2, 'Arsenal', 85),
        ];
        $games = [
            new Game(1, $teams[0], $teams[1], 1, 2, 1), // Chelsea 2-1 Arsenal
        ];
        $league = new League(1, 'Test League', $teams, $games);
        // Act
        $table = (new \ReflectionClass($this->leagueService))
            ->getMethod('generateLeagueTable')
            ->invoke($this->leagueService, $league);
        // Assert
        $pointsByTeam = [];
        foreach ($table as $row) {
            $pointsByTeam[$row['team']] = $row;
        }
        $this->assertEquals([
            'PTS' => 3, 'W' => 1, 'D' => 0, 'L' => 0, 'GD' => 1, 'P' => 1
        ], array_intersect_key($pointsByTeam['Chelsea'], array_flip(['PTS','W','D','L','GD','P'])));
        $this->assertEquals([
            'PTS' => 0, 'W' => 0, 'D' => 0, 'L' => 1, 'GD' => -1, 'P' => 1
        ], array_intersect_key($pointsByTeam['Arsenal'], array_flip(['PTS','W','D','L','GD','P'])));
    }

    /**
     * @runInSeparateProcess
     */
    public function testGenerateLeagueTableAwayWin(): void
    {
        // Arrange: Arsenal beats Chelsea 3-2 away
        $teams = [
            new Team(1, 'Chelsea', 90),
            new Team(2, 'Arsenal', 85),
        ];
        $games = [
            new Game(1, $teams[0], $teams[1], 1, 2, 3), // Chelsea 2-3 Arsenal
        ];
        $league = new League(1, 'Test League', $teams, $games);
        // Act
        $table = (new \ReflectionClass($this->leagueService))
            ->getMethod('generateLeagueTable')
            ->invoke($this->leagueService, $league);
        // Assert
        $pointsByTeam = [];
        foreach ($table as $row) {
            $pointsByTeam[$row['team']] = $row;
        }
        $this->assertEquals([
            'PTS' => 0, 'W' => 0, 'D' => 0, 'L' => 1, 'GD' => -1, 'P' => 1
        ], array_intersect_key($pointsByTeam['Chelsea'], array_flip(['PTS','W','D','L','GD','P'])));
        $this->assertEquals([
            'PTS' => 3, 'W' => 1, 'D' => 0, 'L' => 0, 'GD' => 1, 'P' => 1
        ], array_intersect_key($pointsByTeam['Arsenal'], array_flip(['PTS','W','D','L','GD','P'])));
    }

    /**
     * @runInSeparateProcess
     */
    public function testGenerateLeagueTableDraw(): void
    {
        // Arrange: Chelsea and Arsenal draw 1-1
        $teams = [
            new Team(1, 'Chelsea', 90),
            new Team(2, 'Arsenal', 85),
        ];
        $games = [
            new Game(1, $teams[0], $teams[1], 1, 1, 1), // Chelsea 1-1 Arsenal
        ];
        $league = new League(1, 'Test League', $teams, $games);
        // Act
        $table = (new \ReflectionClass($this->leagueService))
            ->getMethod('generateLeagueTable')
            ->invoke($this->leagueService, $league);
        // Assert
        $pointsByTeam = [];
        foreach ($table as $row) {
            $pointsByTeam[$row['team']] = $row;
        }
        $this->assertEquals([
            'PTS' => 1, 'W' => 0, 'D' => 1, 'L' => 0, 'GD' => 0, 'P' => 1
        ], array_intersect_key($pointsByTeam['Chelsea'], array_flip(['PTS','W','D','L','GD','P'])));
        $this->assertEquals([
            'PTS' => 1, 'W' => 0, 'D' => 1, 'L' => 0, 'GD' => 0, 'P' => 1
        ], array_intersect_key($pointsByTeam['Arsenal'], array_flip(['PTS','W','D','L','GD','P'])));
    }
} 