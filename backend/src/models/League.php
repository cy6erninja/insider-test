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

    public function __construct(int $id, string $name, array $teams = [], array $games = [])
    {
        $this->id = $id;
        $this->name = $name;
        $this->teams = $teams;
        $this->games = $games;
    }

    public function getId(): int { return $this->id; }
    public function getName(): string { return $this->name; }
    public function getTeams(): array { return $this->teams; }
    public function getGames(): array { return $this->games; }

    public function setTeams(array $teams): void { $this->teams = $teams; }
    public function setGames(array $games): void { $this->games = $games; }
    public function addTeam(Team $team): void { $this->teams[] = $team; }
    public function addGame(Game $game): void { $this->games[] = $game; }
} 