<?php

namespace Tests\Unit;

use App\Services\TemporalForecast;
use Illuminate\Support\Carbon;
use PHPUnit\Framework\TestCase;

class TemporalForecastTest extends TestCase
{
    public function test_sparse_telemetry_does_not_produce_a_numeric_forecast(): void
    {
        $now = Carbon::parse('2026-10-27 12:00:00');
        $service = new TemporalForecast;
        $history = $service->emptyHistory();
        $service->record($history, $this->event($now, 1, 'critical'), $now);
        $result = $service->analyze($history);

        $this->assertSame('insufficient_data', $result['signal']);
        $this->assertNull($result['expected_alerts_next_24h']);
        $this->assertNull($result['backtest_mae']);
        $this->assertSame(1, $result['observed_days_28d']);
    }

    public function test_detects_recent_increase_against_seven_day_baseline(): void
    {
        $now = Carbon::parse('2026-10-27 12:00:00');
        $service = new TemporalForecast;
        $history = $service->emptyHistory();
        for ($day = 1; $day <= 27; $day++) {
            $service->record($history, $this->event($now, $day, 'warning'), $now);
        }
        for ($index = 0; $index < 5; $index++) {
            $service->record($history, $this->event($now, 0, 'critical'), $now);
        }
        $service->record($history, $this->event($now, 29, 'critical'), $now);
        $service->record($history, $this->event($now, -1, 'critical'), $now);

        $result = $service->analyze($history);

        $this->assertSame('increase', $result['signal']);
        $this->assertSame(5, $result['alerts_24h']);
        $this->assertSame(1.0, $result['baseline_alerts_per_day']);
        $this->assertSame(3.0, $result['expected_alerts_next_24h']);
        $this->assertSame(0.0, $result['backtest_mae']);
        $this->assertSame(28, $result['observed_days_28d']);
    }

    private function event(Carbon $now, int $daysAgo, string $severity): object
    {
        return (object) [
            'occurred_at' => $now->copy()->subDays($daysAgo)->subMinutes(30),
            'severity' => $severity,
        ];
    }
}
