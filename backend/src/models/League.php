<?php

namespace App\Models;

use App\Models\Team;
use App\Models\Game;

class League
{
    private int $id;
    private string $name;
    /** @var Team[] */
    private array $teams;
    /** @var Game[] */
    private array $games;
    private int $totalWeeks;
    private array $gamesByWeek = [];

    public function __construct(int $id, string $name, array $teams = [], array $games = [])
    {
        $this->id = $id;
        $this->name = $name;
        $this->teams = $teams;
        $this->games = $games;

        // Build gamesByWeek map and find max week
        $maxWeek = 0;
        foreach ($games as $game) {
            $week = $game->getWeek();
            $this->gamesByWeek[$week][] = $game;
            if ($week > $maxWeek) {
                $maxWeek = $week;
            }
        }
        $this->totalWeeks = $maxWeek;
    }

    public function getId(): int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getTeams(): array { return $this->teams; }
    public function getGames(): array { return $this->games; }

    public function getTotalWeeks(): int
    {
        return $this->totalWeeks;
    }

    public function getWeeks(): array
    {
        return range(1, $this->totalWeeks);
    }

    public function getGamesForWeek(int $week): array
    {
        return $this->gamesByWeek[$week] ?? [];
    }
} 