<?php

namespace App\Services;

use Illuminate\Support\Carbon;

class TemporalForecast
{
    private const WINDOW_DAYS = 28;

    private const BASELINE_DAYS = 7;

    public function emptyHistory(): array
    {
        return [
            'alerts' => array_fill(0, self::WINDOW_DAYS, 0),
            'observed' => array_fill(0, self::WINDOW_DAYS, false),
        ];
    }

    /** Informational heartbeats prove activity without increasing alert counts. */
    public function record(array &$history, object $event, Carbon $asOf): void
    {
        $age = $asOf->getTimestamp() - $event->occurred_at->getTimestamp();
        if ($age < 0 || $age >= self::WINDOW_DAYS * 86400) {
            return;
        }

        $day = intdiv($age, 86400);
        $history['observed'][$day] = true;
        if ($event->severity !== 'info') {
            $history['alerts'][$day]++;
        }
    }

    /** Compare 24-hour windows ending at the same instant. */
    public function analyze(array $history): array
    {
        $alerts = $history['alerts'];
        $observed = $history['observed'];

        $coverage = count(array_filter($observed));
        $historyAlerts = array_sum(array_slice($alerts, 1));
        $baselineAlerts = array_sum(array_slice($alerts, 1, self::BASELINE_DAYS));
        $baseline = $baselineAlerts / self::BASELINE_DAYS;
        $baselineCoverage = count(array_filter(array_slice($observed, 1, self::BASELINE_DAYS)));
        $ready = $baselineCoverage >= 5 && $baselineAlerts >= 3;
        $recent = $alerts[0];
        $spike = $ready && $recent >= 3 && $recent >= max(1.8 * $baseline, $baseline + 2);

        $backtest = null;
        if ($coverage >= 21 && $historyAlerts >= 10) {
            $errors = [];
            for ($day = 1; $day <= 20; $day++) {
                $historicalBaseline = array_sum(array_slice($alerts, $day + 1, self::BASELINE_DAYS)) / self::BASELINE_DAYS;
                $predicted = .5 * $alerts[$day + 1] + .5 * $historicalBaseline;
                $errors[] = abs($predicted - $alerts[$day]);
            }
            $backtest = round(array_sum($errors) / count($errors), 2);
        }

        return [
            'alerts_24h' => $recent,
            'baseline_alerts_per_day' => $ready ? round($baseline, 2) : null,
            'expected_alerts_next_24h' => $ready ? round(.5 * $recent + .5 * $baseline, 2) : null,
            'signal' => $ready ? ($spike ? 'increase' : 'stable') : 'insufficient_data',
            'observed_days_28d' => $coverage,
            'backtest_mae' => $backtest,
        ];
    }
}
