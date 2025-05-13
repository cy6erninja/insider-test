<?php

namespace App\Controllers;

use App\Services\TestService;

class TestController
{
    private $service;

    public function __construct(TestService $service)
    {
        $this->service = $service;
    }

    public function testAction(): string
    {
        return json_encode(['message' => $this->service->getMessage()]);
    }
} 