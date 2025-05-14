<?php

namespace App\Models;

class Team
{
    private int $id;
    private string $name;
    private int $strength;

    public function __construct(int $id, string $name, int $strength)
    {
        $this->id = $id;
        $this->name = $name;
        $this->strength = $strength;
    }

    public function getId(): int
    {
        return $this->id;
    }

    public function getName(): string
    {
        return $this->name;
    }

    public function getStrength(): int
    {
        return $this->strength;
    }

    public function setStrength(int $strength): void
    {
        $this->strength = $strength;
    }
} 