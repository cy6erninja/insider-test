<?php

namespace App\Services;

use App\Models\League;
use OutOfBoundsException;

class LeagueService
{
    private LeagueDataService $leagueDataService;
    
    /**
     * Constructor with dependency injection for LeagueDataService
     */
    public function __construct(LeagueDataService $leagueDataService)
    {
        $this->leagueDataService = $leagueDataService;
    }
    
    /**
     * Get current league table
     */
    public function getLeagueResults(): array
    {
        $league = $this->leagueDataService->getLeagueData();
        return $this->generateLeagueTable($league);
    }

    /**
     * Generate league table from League object
     * @param League $league The league object to generate the table for
     * @return array The formatted league table
     */
    private function generateLeagueTable(League $league): array
    {
        $table = [];
        
        foreach ($league->getTeams() as $team) {
            $table[] = [
                'team_id' => $team->getId(),
                'team' => $team->getName(),
                'PTS' => 0,
                'P' => 0,
                'W' => 0,
                'D' => 0,
                'L' => 0,
                'GD' => 0
            ];
        }
        
        // Process games to update stats
        foreach ($league->getGames() as $game) {
            if ($game->getHomeGoals() !== null && $game->getAwayGoals() !== null) {
                $homeTeamId = $game->getHomeTeam()->getId();
                $awayTeamId = $game->getAwayTeam()->getId();
                
                $homeTeamIndex = $this->findTeamIndexInTableById($table, $homeTeamId);
                $awayTeamIndex = $this->findTeamIndexInTableById($table, $awayTeamId);
                
                if ($homeTeamIndex !== false && $awayTeamIndex !== false) {
                    $this->updateTeamStats(
                        $table[$homeTeamIndex],
                        $table[$awayTeamIndex],
                        $game->getHomeGoals(),
                        $game->getAwayGoals()
                    );
                }
            }
        }
        
        // Sort table by points (descending)
        usort($table, function($a, $b) {
            // First sort by points
            if ($a['PTS'] !== $b['PTS']) {
                return $b['PTS'] - $a['PTS'];
            }
            // Then by goal difference
            return $b['GD'] - $a['GD'];
        });
        
        return $table;
    }

    /**
     * Get match results for a specific week
     * @param int $week The week number
     * @return array The match results for the week
     */
    public function getWeekResults(int $week): array
    {
        $league = $this->leagueDataService->getLeagueData();
        $games = [];
        foreach ($league->getGames() as $game) {
            if ($game->getWeek() === $week) {
                $games[] = $game;
            }
        }
        return $games;
    }

    /**
     * Predict each team's chance to win the championship (in percent) using Monte Carlo simulation
     * @param int $week The current week (unused, but kept for API compatibility)
     * @return array Each team's win probability in percent
     */
    public function getWeekPredictions(int $week): array
    {
        $league = $this->leagueDataService->getLeagueData();
        $teams = $league->getTeams();
        $teamIds = array_map(fn($t) => $t->getId(), $teams);
        $teamNames = array_map(fn($t) => $t->getName(), $teams);
        $winCounts = array_fill_keys($teamIds, 0);
        $simulations = 1000;

        for ($sim = 0; $sim < $simulations; $sim++) {
            // Deep clone the league and games for this simulation
            $simLeague = unserialize(serialize($league));
            $simGames = $simLeague->getGames();

            // Simulate all remaining games
            foreach ($simGames as $game) {
                if ($game->getHomeGoals() === null || $game->getAwayGoals() === null) {
                    // Simulate this match
                    $homeStrength = $game->getHomeTeam()->getStrength();
                    $awayStrength = $game->getAwayTeam()->getStrength();
                    $homeAdvantage = 5;
                    $homeForm = rand(-10, 10);
                    $awayForm = rand(-10, 10);
                    $tacticalAdvantage = rand(-5, 5);
                    $conditions = rand(-3, 3);
                    $strengthDifference = abs($homeStrength - $awayStrength);
                    $upsetFactor = 0;
                    if ($strengthDifference > 10) {
                        $upsetChance = min(30, $strengthDifference * 2);
                        if (rand(1, 100) <= $upsetChance) {
                            $upsetFactor = rand(5, 15);
                            if ($homeStrength < $awayStrength) {
                                $homeForm += $upsetFactor;
                            } else {
                                $awayForm += $upsetFactor;
                            }
                        }
                    }
                    $keyEvents = rand(0, 100);
                    $redCardHome = false;
                    $redCardAway = false;
                    if ($keyEvents < 8) {
                        if ($keyEvents < 4) {
                            $redCardHome = true;
                            $homeForm -= rand(8, 15);
                        } else {
                            $redCardAway = true;
                            $awayForm -= rand(8, 15);
                        }
                    }
                    $homeGoalFactor = $homeStrength + $homeAdvantage + $homeForm + $tacticalAdvantage + $conditions;
                    $awayGoalFactor = $awayStrength + $awayForm - $tacticalAdvantage - $conditions;
                    $homeGoalFactor = max(10, $homeGoalFactor);
                    $awayGoalFactor = max(10, $awayGoalFactor);
                    $homeExpectedGoals = $homeGoalFactor / 15;
                    $awayExpectedGoals = $awayGoalFactor / 16;
                    $homeGoals = 0;
                    $awayGoals = 0;
                    $homeBase = min(0.9, $homeExpectedGoals / 5);
                    for ($i = 0; $i < 6; $i++) {
                        if (mt_rand(0, 100) / 100 < $homeBase) {
                            $homeGoals++;
                            $homeBase *= 0.7;
                        }
                    }
                    $awayBase = min(0.85, $awayExpectedGoals / 5);
                    for ($i = 0; $i < 6; $i++) {
                        if (mt_rand(0, 100) / 100 < $awayBase) {
                            $awayGoals++;
                            $awayBase *= 0.75;
                        }
                    }
                    if ($redCardHome && $homeGoals > 0 && mt_rand(0, 100) < 70) {
                        $homeGoals = max(0, $homeGoals - 1);
                    }
                    if ($redCardAway && $awayGoals > 0 && mt_rand(0, 100) < 70) {
                        $awayGoals = max(0, $awayGoals - 1);
                    }
                    $game->setHomeGoals($homeGoals);
                    $game->setAwayGoals($awayGoals);
                }
            }

            // Calculate final league table for this simulation
            $table = $this->generateLeagueTable($simLeague);
            // The winner is the first team in the sorted table
            $winnerId = $table[0]['team_id'];
            $winCounts[$winnerId]++;
        }

        // Calculate percentages
        $results = [];
        foreach ($teams as $team) {
            $id = $team->getId();
            $results[] = [
                'team' => $team->getName(),
                'chance' => round($winCounts[$id] / $simulations * 100, 1)
            ];
        }
        // Sort by chance descending
        usort($results, fn($a, $b) => $b['chance'] <=> $a['chance']);
        return $results;
    }

    /**
     * Simulate all weeks and update league data
     */
    public function playAllWeeks(): array
    {
        $league = $this->leagueDataService->getLeagueData();
        // If all games are already played, return the results for each week
        $allPlayed = true;
        foreach ($league->getGames() as $game) {
            if ($game->getHomeGoals() === null || $game->getAwayGoals() === null) {
                $allPlayed = false;
                break;
            }
        }
        if ($allPlayed) {
            $allResults = [];
            foreach ($league->getWeeks() as $week) {
                $weekGames = [];
                foreach ($league->getGames() as $game) {
                    if ($game->getWeek() === $week) {
                        $weekGames[] = [
                            'home' => $game->getHomeTeam()->getName(),
                            'away' => $game->getAwayTeam()->getName(),
                            'score' => $game->getHomeGoals() . '-' . $game->getAwayGoals(),
                            'events' => []
                        ];
                    }
                }
                $allResults[$week] = $weekGames;
            }
            return $allResults;
        }
        
        $allResults = [];
        $playedCount = 0;
        $alreadyPlayedCount = 0;
        $sequentialBlockCount = 0;
        $lastPlayedWeek = 0;
        
        // Play weeks in sequential order
        foreach ($league->getWeeks() as $week) {
            $weekResult = $this->playWeek($week);
            
            // Check result status
            if (isset($weekResult['message'])) {
                if (strpos($weekResult['message'], 'already been played') !== false) {
                    $alreadyPlayedCount++;
                    $lastPlayedWeek = $week;
                } else if (strpos($weekResult['message'], 'Cannot play week') !== false) {
                    $sequentialBlockCount++;
                    // Don't continue trying to play more weeks if we hit a sequential block
                    break;
                }
            } else {
                $playedCount++;
                $lastPlayedWeek = $week;
            }
            
            $allResults[$week] = $weekResult['results'] ?? [];
        }
        
        return $allResults;
    }

    /**
     * Simulate games for a specific week and update table
     */
    public function playWeek(int $week): array
    {
        $league = $this->leagueDataService->getLeagueData();
        $validWeeks = $league->getWeeks();
        if (!in_array($week, $validWeeks, true)) {
            throw new OutOfBoundsException('Week does not exist');
        }
        
        // If all games have been played, return error
        $allPlayed = true;
        foreach ($league->getGames() as $game) {
            if ($game->getHomeGoals() === null || $game->getAwayGoals() === null) {
                $allPlayed = false;
                break;
            }
        }
        if ($allPlayed) {
            return [
                'results' => [],
                'message' => 'The league has already been fully played. No more games can be played.'
            ];
        }
        
        // Check if all previous weeks have been fully played
        if ($week > 1) {
            // Check each previous week
            for ($prevWeek = 1; $prevWeek < $week; $prevWeek++) {
                $prevWeekGames = [];
                foreach ($league->getGames() as $game) {
                    if ($game->getWeek() === $prevWeek) {
                        $prevWeekGames[] = $game;
                    }
                }
                
                // If there are no games for this week, continue to the next
                if (empty($prevWeekGames)) {
                    continue;
                }
                
                // Check if all games in the previous week have been played
                foreach ($prevWeekGames as $game) {
                    if ($game->getHomeGoals() === null || $game->getAwayGoals() === null) {
                        // Found an unplayed game in a previous week
                        return [
                            'results' => [],
                            'message' => "Cannot play week $week until week $prevWeek is completed."
                        ];
                    }
                }
            }
        }
        
        $gamesForWeek = [];
        
        // Find games for the specified week
        foreach ($league->getGames() as $game) {
            if ($game->getWeek() === $week) {
                $gamesForWeek[] = $game;
            }
        }
        
        if (empty($gamesForWeek)) {
            return [
                'results' => $gamesForWeek,
            ];
        }
        
        // Check if this week has already been fully played
        $allGamesPlayed = true;
        foreach ($gamesForWeek as $game) {
            if ($game->getHomeGoals() === null || $game->getAwayGoals() === null) {
                $allGamesPlayed = false;
                break;
            }
        }
        
        // If all games are already played, return existing results with a message
        if ($allGamesPlayed) {
            $results = [];
            foreach ($gamesForWeek as $game) {
                $results[] = [
                    'home' => $game->getHomeTeam()->getName(),
                    'away' => $game->getAwayTeam()->getName(),
                    'score' => $game->getHomeGoals() . '-' . $game->getAwayGoals(),
                    'events' => []
                ];
            }
            
            return [
                'results' => $results,
                'message' => 'This week has already been played. Reset the league to play again.'
            ];
        }
        
        // Simulate matches and record results
        $results = [];
        
        foreach ($gamesForWeek as $game) {
            // Skip already played matches
            if ($game->getHomeGoals() !== null && $game->getAwayGoals() !== null) {
                $results[] = [
                    'home' => $game->getHomeTeam()->getName(),
                    'away' => $game->getAwayTeam()->getName(),
                    'score' => $game->getHomeGoals() . '-' . $game->getAwayGoals(),
                    'events' => []
                ];
                continue;
            }
            
            // Get team strengths
            $homeTeamStrength = $game->getHomeTeam()->getStrength();
            $awayTeamStrength = $game->getAwayTeam()->getStrength();
            
            // 1. Home advantage (consistent advantage for home team)
            $homeAdvantage = 5;
            
            // 2. Match day form (random factor that represents current form)
            $homeForm = rand(-10, 10);
            $awayForm = rand(-10, 10);
            
            // 3. Tactical advantage (random advantage to either team)
            $tacticalAdvantage = rand(-5, 5);
            
            // 4. Weather/pitch conditions (affects both teams, but can favor one style)
            $conditions = rand(-3, 3);
            
            // 5. Upset factor (gives underdogs a chance)
            $strengthDifference = abs($homeTeamStrength - $awayTeamStrength);
            $upsetFactor = 0;
            
            if ($strengthDifference > 10) {  // Only for significant differences
                $upsetChance = min(30, $strengthDifference * 2);
                if (rand(1, 100) <= $upsetChance) {
                    $upsetFactor = rand(5, 15);
                    if ($homeTeamStrength < $awayTeamStrength) {
                        $homeForm += $upsetFactor;
                    } else {
                        $awayForm += $upsetFactor;
                    }
                }
            }
            
            // 6. Key events (red cards, injuries during match)
            $keyEvents = rand(0, 100);
            $redCardHome = false;
            $redCardAway = false;
            
            if ($keyEvents < 8) {  // 8% chance of red card
                if ($keyEvents < 4) {
                    // Home team red card
                    $redCardHome = true;
                    $homeForm -= rand(8, 15);
                } else {
                    // Away team red card
                    $redCardAway = true;
                    $awayForm -= rand(8, 15);
                }
            }
            
            // Calculate final goal chances
            $homeGoalFactor = $homeTeamStrength + $homeAdvantage + $homeForm + $tacticalAdvantage + $conditions;
            $awayGoalFactor = $awayTeamStrength + $awayForm - $tacticalAdvantage - $conditions;
            
            // Normalize to avoid negative values
            $homeGoalFactor = max(10, $homeGoalFactor);
            $awayGoalFactor = max(10, $awayGoalFactor);
            
            // Calculate base expected goals (with a lower divisor to keep scores reasonable)
            $homeExpectedGoals = $homeGoalFactor / 15;
            $awayExpectedGoals = $awayGoalFactor / 16; // Away teams score slightly less
            
            // Calculate actual goals using probability-based approach
            // Use Poisson-inspired distribution (simplified)
            $homeGoals = 0;
            $awayGoals = 0;
            
            // For home team goals
            $homeBase = min(0.9, $homeExpectedGoals / 5); // Cap at 90% chance per goal
            for ($i = 0; $i < 6; $i++) { // Max 5 goals (0-5)
                if (mt_rand(0, 100) / 100 < $homeBase) {
                    $homeGoals++;
                    $homeBase *= 0.7; // Decreasing probability for each additional goal
                }
            }
            
            // For away team goals
            $awayBase = min(0.85, $awayExpectedGoals / 5); // Cap at 85% chance per goal (away disadvantage)
            for ($i = 0; $i < 6; $i++) { // Max 5 goals (0-5)
                if (mt_rand(0, 100) / 100 < $awayBase) {
                    $awayGoals++;
                    $awayBase *= 0.75; // Decreasing probability for each additional goal
                }
            }
            
            // Apply red card penalty directly to goals (if they happened)
            if ($redCardHome && $homeGoals > 0 && mt_rand(0, 100) < 70) {
                $homeGoals = max(0, $homeGoals - 1);
            }
            if ($redCardAway && $awayGoals > 0 && mt_rand(0, 100) < 70) {
                $awayGoals = max(0, $awayGoals - 1);
            }
            
            // Record match events for more detailed results
            $matchEvents = [];
            if ($redCardHome) {
                $matchEvents[] = 'Red card: ' . $game->getHomeTeam()->getName();
            }
            if ($redCardAway) {
                $matchEvents[] = 'Red card: ' . $game->getAwayTeam()->getName();
            }
            if ($upsetFactor > 0) {
                $matchEvents[] = 'Upset: Underdog overperformed';
            }
            
            // Update game with result
            $game->setHomeGoals($homeGoals);
            $game->setAwayGoals($awayGoals);
            
            // Record the result
            $results[] = [
                'home' => $game->getHomeTeam()->getName(),
                'away' => $game->getAwayTeam()->getName(),
                'score' => "$homeGoals-$awayGoals",
                'events' => $matchEvents
            ];
        }
        
        // Save the updated league
        $_SESSION[LeagueDataService::getLeagueKey()] = serialize($league);
        
        return [
            'results' => $results,
        ];
    }
    
    /**
     * Reset the league to initial state
     */
    public function reset(): array
    {
        $league = $this->leagueDataService->resetLeague();
        return $this->generateLeagueTable($league);
    }
    
    /**
     * Find a team's index in the table by ID
     */
    private function findTeamIndexInTableById(array $table, int $teamId): int|false
    {
        foreach ($table as $index => $team) {
            if ($team['team_id'] === $teamId) {
                return $index;
            }
        }
        return false;
    }
    
    /**
     * Update team statistics based on match result
     */
    private function updateTeamStats(array &$homeTeam, array &$awayTeam, int $homeGoals, int $awayGoals): void
    {
        // Update home team stats
        $homeTeam['P']++;
        $homeTeam['GD'] += ($homeGoals - $awayGoals);
        
        // Update away team stats
        $awayTeam['P']++;
        $awayTeam['GD'] += ($awayGoals - $homeGoals);
        
        if ($homeGoals > $awayGoals) {
            // Home win
            $homeTeam['W']++;
            $homeTeam['PTS'] += 3;
            $awayTeam['L']++;
        } elseif ($homeGoals < $awayGoals) {
            // Away win
            $homeTeam['L']++;
            $awayTeam['W']++;
            $awayTeam['PTS'] += 3;
        } else {
            // Draw
            $homeTeam['D']++;
            $homeTeam['PTS'] += 1;
            $awayTeam['D']++;
            $awayTeam['PTS'] += 1;
        }
    }

    public function getLeagueDataService(): LeagueDataService
    {
        return $this->leagueDataService;
    }
} 