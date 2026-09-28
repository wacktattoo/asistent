<?php
declare(strict_types=1);

/* =========================================================================
   Uložení polohy boxů z editoru (…/vaia-tron/?upravit) do data/hero-layout.js.
   Z bezpečnostních důvodů funguje JEN na lokálním počítači (php -S localhost),
   na veřejném webu vrací 403 — tam soubor nahraj ručně (tlačítko „Stáhnout“).
   ========================================================================= */

header('Content-Type: application/json; charset=utf-8');

function out(array $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}

$ip = $_SERVER['REMOTE_ADDR'] ?? '';
if (!in_array($ip, ['127.0.0.1', '::1'], true)) {
    out(['ok' => false, 'error' => 'Ukládání je povolené jen na localhostu.'], 403);
}
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    out(['ok' => false, 'error' => 'Jen POST.'], 405);
}

$data = json_decode((string) file_get_contents('php://input'), true);
if (!is_array($data) || count($data) > 12) {
    out(['ok' => false, 'error' => 'Neplatná data.'], 400);
}

// propustí jen známé klíče a čísla v rozumném rozsahu
$keys = ['x', 'y', 'w', 'h', 'rotate', 'skewX', 'skewY', 'size'];
$clean = [];
foreach ($data as $box) {
    if (!is_array($box)) out(['ok' => false, 'error' => 'Neplatná data.'], 400);
    $row = [];
    foreach ($keys as $k) {
        $v = $box[$k] ?? null;
        if (!is_int($v) && !is_float($v)) continue;
        $row[$k] = round(max(-200, min(200, (float) $v)), 2);
    }
    $clean[] = $row;
}

$js = "/* Poloha boxů v úvodu — zapisuje editor (otevři web s ?upravit za adresou).\n"
    . "   Prázdné pole = platí hodnoty z data/content.js → heroBoxes. */\n"
    . 'window.VAIA_HERO_LAYOUT = ' . json_encode($clean, JSON_PRETTY_PRINT) . ";\n";

if (file_put_contents(__DIR__ . '/data/hero-layout.js', $js) === false) {
    out(['ok' => false, 'error' => 'Soubor nejde zapsat.'], 500);
}
out(['ok' => true]);
