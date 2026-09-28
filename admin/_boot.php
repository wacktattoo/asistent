<?php
/* Společné jádro editoru: session, přihlášení, ochrana proti CSRF
   a bezpečné zpracování nahraných obrázků. */
declare(strict_types=1);

const ROOT       = __DIR__ . '/..';
const IMG_DIR    = ROOT . '/img';
const LOGO_DIR   = ROOT . '/img/logos';
const DATA_FILE  = ROOT . '/data/content.js';
const MAX_UPLOAD = 12 * 1024 * 1024;          // 12 MB na soubor

// obrázek se VŽDY překóduje přes GD do WebP — tím se zahodí cokoli,
// co by mohlo být schované uvnitř souboru
const ALLOWED_TYPES = [IMAGETYPE_JPEG, IMAGETYPE_PNG, IMAGETYPE_WEBP, IMAGETYPE_GIF];

session_start([
    'cookie_httponly' => true,
    'cookie_samesite' => 'Strict',
    'use_strict_mode' => true,
]);

require __DIR__ . '/config.php';

function is_setup_done(): bool { return ADMIN_PASS_HASH !== ''; }
function is_logged_in(): bool  { return !empty($_SESSION['fv_admin']); }

function csrf_token(): string {
    if (empty($_SESSION['fv_csrf'])) $_SESSION['fv_csrf'] = bin2hex(random_bytes(32));
    return $_SESSION['fv_csrf'];
}
function csrf_ok(?string $t): bool {
    return is_string($t) && !empty($_SESSION['fv_csrf']) && hash_equals($_SESSION['fv_csrf'], $t);
}

function json_out(array $d, int $code = 200): never {
    http_response_code($code);
    header('Content-Type: application/json; charset=utf-8');
    header('X-Content-Type-Options: nosniff');
    echo json_encode($d, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}
function fail(string $msg, int $code = 400): never { json_out(['ok' => false, 'error' => $msg], $code); }

function require_auth(): void {
    if (!is_logged_in()) fail('Nejsi přihlášený.', 401);
    $t = $_POST['csrf'] ?? ($_SERVER['HTTP_X_CSRF'] ?? null);
    if (!csrf_ok($t)) fail('Neplatný bezpečnostní token, načti stránku znovu.', 403);
}

/** Z názvu udělá bezpečný slug — název od uživatele NIKDY nepoužíváme přímo. */
function slug(string $s): string {
    $s = strtr($s, [
        'á'=>'a','č'=>'c','ď'=>'d','é'=>'e','ě'=>'e','í'=>'i','ň'=>'n','ó'=>'o','ř'=>'r',
        'š'=>'s','ť'=>'t','ú'=>'u','ů'=>'u','ý'=>'y','ž'=>'z',
        'Á'=>'a','Č'=>'c','Ď'=>'d','É'=>'e','Ě'=>'e','Í'=>'i','Ň'=>'n','Ó'=>'o','Ř'=>'r',
        'Š'=>'s','Ť'=>'t','Ú'=>'u','Ů'=>'u','Ý'=>'y','Ž'=>'z',
    ]);
    $s = strtolower($s);
    $s = preg_replace('/[^a-z0-9]+/', '-', $s) ?? '';
    $s = trim($s, '-');
    return $s === '' ? 'obrazek' : substr($s, 0, 40);
}

/**
 * Ověří nahraný soubor a překóduje ho do WebP.
 * Vrací cestu relativní k webu, např. "img/work-neco.webp".
 */
function save_upload(array $file, string $targetDir, string $webPrefix, string $baseName, int $maxW): string {
    if (!isset($file['error']) || is_array($file['error'])) fail('Neplatný upload.');
    switch ($file['error']) {
        case UPLOAD_ERR_OK: break;
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE: fail('Soubor je větší, než server povoluje (' . ini_get('upload_max_filesize') . ').');
        case UPLOAD_ERR_NO_FILE:   fail('Nevybral jsi žádný soubor.');
        default: fail('Upload se nezdařil (kód ' . $file['error'] . ').');
    }
    if ($file['size'] > MAX_UPLOAD) fail('Soubor je moc velký (limit 12 MB).');
    if (!is_uploaded_file($file['tmp_name'])) fail('Neplatný upload.');

    $info = @getimagesize($file['tmp_name']);
    if ($info === false) fail('Tohle není obrázek.');
    if (!in_array($info[2], ALLOWED_TYPES, true)) fail('Podporované formáty: JPG, PNG, WebP, GIF.');

    $src = match ($info[2]) {
        IMAGETYPE_JPEG => @imagecreatefromjpeg($file['tmp_name']),
        IMAGETYPE_PNG  => @imagecreatefrompng($file['tmp_name']),
        IMAGETYPE_WEBP => @imagecreatefromwebp($file['tmp_name']),
        IMAGETYPE_GIF  => @imagecreatefromgif($file['tmp_name']),
        default        => false,
    };
    if (!$src) fail('Obrázek se nepodařilo načíst.');

    [$w, $h] = [imagesx($src), imagesy($src)];
    if ($maxW > 0 && $w > $maxW) {                       // zmenšit na rozumnou velikost
        $nh = (int) round($h * ($maxW / $w));
        $dst = imagecreatetruecolor($maxW, $nh);
        imagealphablending($dst, false); imagesavealpha($dst, true);
        imagecopyresampled($dst, $src, 0, 0, 0, 0, $maxW, $nh, $w, $h);
        imagedestroy($src);
        $src = $dst;
    } else {
        imagealphablending($src, false); imagesavealpha($src, true);
    }

    if (!is_dir($targetDir) && !@mkdir($targetDir, 0755, true)) fail('Nejde vytvořit složku pro obrázky.');
    $name = slug($baseName) . '-' . bin2hex(random_bytes(3)) . '.webp';
    $path = $targetDir . '/' . $name;
    $ok = imagewebp($src, $path, 82);
    imagedestroy($src);
    if (!$ok) fail('Převod do WebP se nezdařil.');
    @chmod($path, 0644);

    return $webPrefix . '/' . $name;
}

/** Vygeneruje data/content.js ze zadaných dat. */
function build_content_js(array $data): string {
    // lomítka necháme čitelná (jinak by z cest bylo "img\/logos\/"), ale ukončovací
    // script tag rozbijeme — kdyby se text někdy vložil přímo do HTML
    $q = static fn($v) => str_replace('</', '<\/',
        json_encode((string) $v, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

    $logos = [];
    foreach ($data['logos'] ?? [] as $l) {
        if (is_array($l) && !empty($l['img'])) {
            $logos[] = '    { img: ' . $q($l['img']) . ', alt: ' . $q($l['alt'] ?? '') . ' }';
        } elseif (is_string($l) && $l !== '') {
            $logos[] = '    ' . $q($l);
        }
    }

    $projects = [];
    foreach ($data['projects'] ?? [] as $p) {
        $tags = array_map($q, array_values(array_filter((array) ($p['tags'] ?? []), 'strlen')));
        $projects[] = "    {\n"
            . '      index: '  . $q($p['index']  ?? '') . ",\n"
            . '      name: '   . $q($p['name']   ?? '') . ",\n"
            . '      type: '   . $q($p['type']   ?? '') . ",\n"
            . '      desc: '   . $q($p['desc']   ?? '') . ",\n"
            . '      result: ' . $q($p['result'] ?? '') . ",\n"
            . '      img: '    . $q($p['img']    ?? '') . ",\n"
            . '      tags: [' . implode(', ', $tags) . "]\n"
            . '    }';
    }

    return "/* =========================================================================\n"
         . "   OBSAH WEBU — generováno editorem v /admin/. Needituj ručně, přepíše se.\n"
         . '   Naposledy uloženo: ' . date('j. n. Y H:i') . "\n"
         . "   ========================================================================= */\n"
         . "window.FOXY_CONTENT = {\n\n"
         . "  logos: [\n" . implode(",\n", $logos) . "\n  ],\n\n"
         . "  projects: [\n" . implode(",\n", $projects) . "\n  ]\n"
         . "};\n";
}
