<?php

namespace App\Models;

use App\Models\Team;

class Game
{
    private int $id;
    private Team $homeTeam;
    private Team $awayTeam;
    private ?int $homeGoals;
    private ?int $awayGoals;
    private int $week;

    public function __construct(int $id, Team $homeTeam, Team $awayTeam, int $week, ?int $homeGoals = null, ?int $awayGoals = null)
    {
        $this->id = $id;
        $this->homeTeam = $homeTeam;
        $this->awayTeam = $awayTeam;
        $this->week = $week;
        $this->homeGoals = $homeGoals;
        $this->awayGoals = $awayGoals;
    }

    public function getId(): int { return $this->id; }
    public function getHomeTeam(): Team { return $this->homeTeam; }
    public function getAwayTeam(): Team { return $this->awayTeam; }
    public function getHomeGoals(): ?int { return $this->homeGoals; }
    public function getAwayGoals(): ?int { return $this->awayGoals; }
    public function getWeek(): int { return $this->week; }

    public function setHomeGoals(?int $goals): void { $this->homeGoals = $goals; }
    public function setAwayGoals(?int $goals): void { $this->awayGoals = $goals; }
} 