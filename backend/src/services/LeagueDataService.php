<?php

namespace App\Services;

use App\Models\Team;
use App\Models\Game;
use App\Models\League;

/**
 * Team position enum
 */
enum TeamPosition: string
{
    case HOME = 'home';
    case AWAY = 'away';
}

class LeagueDataService
{
    // Session keys
    private const LEAGUE_KEY = 'league_data';
    
    // Team names
    private const TEAM_NAMES = [
        'Chelsea',
        'Arsenal', 
        'Manchester City',
        'Liverpool'
    ];
    
    /**
     * Reset the league to initial state
     * @return League
     */
    public function resetLeague(): League
    {
        // Generate teams with initial stats using proper models
        $teams = $this->generateTeams();
        
        // Generate games across weeks
        $games = $this->generateGames($teams);
        
        // Create league object with teams, games (totalWeeks is now calculated internally)
        $league = new League(1, 'Insider Champion League', $teams, $games);
        
        // Serialize and store in session
        $_SESSION[self::LEAGUE_KEY] = serialize($league);
        
        // Return league object
        return $league;
    }
    
    /**
     * Generate a list of teams with initial attributes
     * @return Team[]
     */
    private function generateTeams(): array
    {
        $teams = [];
        
        foreach (self::TEAM_NAMES as $index => $name) {
            $teams[] = new Team($index + 1, $name, mt_rand(75, 95));
        }
        
        return $teams;
    }
    
    /**
     * Generate games across multiple weeks
     * @param Team[] $teams
     * @return Game[]
     */
    private function generateGames(array $teams): array
    {
        // First, generate all possible team pairings
        $teamPairs = [];
        for ($i = 0; $i < count($teams); $i++) {
            for ($j = $i + 1; $j < count($teams); $j++) {
                $teamPairs[] = [
                    TeamPosition::HOME->value => $teams[$i],
                    TeamPosition::AWAY->value => $teams[$j]
                ];
            }
        }
        
        // Shuffle the team pairings
        shuffle($teamPairs);
        
        // Distribute games across weeks
        $games = [];
        $gameId = 1;
        $totalWeeks = 5; // Fixed number of weeks
        
        foreach ($teamPairs as $index => $pair) {
            // Calculate week number (ensure even distribution across weeks)
            $weekNumber = ($index % $totalWeeks) + 1;
            
            // Create the game
            $game = new Game(
                $gameId,
                $pair[TeamPosition::HOME->value],
                $pair[TeamPosition::AWAY->value],
                $weekNumber
            );
            
            $games[] = $game;
            $gameId++;
        }
        
        return $games;
    }
    
    /**
     * Get the stored league data or reset if not exists
     * @return League
     */
    public function getLeagueData(): League
    {
        if (!isset($_SESSION[self::LEAGUE_KEY])) {
            return $this->resetLeague();
        }
        
        // Deserialize the stored league data
        $league = unserialize($_SESSION[self::LEAGUE_KEY]);
        
        // Return the League object
        return $league;
    }
    
    /**
     * Get the league key constant
     */
    public static function getLeagueKey(): string
    {
        return self::LEAGUE_KEY;
    }
} 