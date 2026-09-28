<?php
declare(strict_types=1);
require __DIR__ . '/_boot.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') fail('Jen POST.', 405);
$action = $_POST['action'] ?? '';

/* ---------- první nastavení hesla ---------- */
if ($action === 'setup') {
    if (is_setup_done()) fail('Heslo už je nastavené.');
    $p = (string) ($_POST['password'] ?? '');
    if (strlen($p) < 10) fail('Heslo musí mít aspoň 10 znaků.');
    $hash = password_hash($p, PASSWORD_DEFAULT);
    $php  = "<?php\n/* Heslo do editoru. Pro změnu smaž hodnotu níž na '' a projdi nastavením znovu. */\n\nconst ADMIN_PASS_HASH = '" . addslashes($hash) . "';\n";
    if (@file_put_contents(__DIR__ . '/config.php', $php, LOCK_EX) === false) {
        fail('Nejde zapsat admin/config.php — nastav souboru práva na zápis (644) a zkus znovu.');
    }
    $_SESSION['fv_admin'] = true;
    session_regenerate_id(true);
    json_out(['ok' => true, 'csrf' => csrf_token()]);
}

/* ---------- přihlášení / odhlášení ---------- */
if ($action === 'login') {
    if (!is_setup_done()) fail('Heslo ještě není nastavené.');
    usleep(400_000);                                   // zpomalí zkoušení hesel hrubou silou
    if (!password_verify((string) ($_POST['password'] ?? ''), ADMIN_PASS_HASH)) fail('Špatné heslo.', 401);
    session_regenerate_id(true);
    $_SESSION['fv_admin'] = true;
    json_out(['ok' => true, 'csrf' => csrf_token()]);
}
if ($action === 'logout') {
    $_SESSION = [];
    session_destroy();
    json_out(['ok' => true]);
}

/* ---------- dál už jen pro přihlášené ---------- */
require_auth();

if ($action === 'save') {
    $raw = (string) ($_POST['data'] ?? '');
    $data = json_decode($raw, true);
    if (!is_array($data)) fail('Neplatná data.');

    $js = build_content_js($data);

    // zápis přes dočasný soubor + přejmenování: kdyby zápis selhal uprostřed,
    // na webu zůstane platná původní verze místo půlky souboru
    $tmp = ROOT . '/data/.content.' . bin2hex(random_bytes(4)) . '.tmp';
    if (@file_put_contents($tmp, $js, LOCK_EX) === false) {
        fail('Nejde zapsat do složky data/ — nastav jí práva na zápis (755).');
    }
    if (!@rename($tmp, DATA_FILE)) {
        @unlink($tmp);
        fail('Nejde přepsat data/content.js — zkontroluj práva souboru (644).');
    }
    @chmod(DATA_FILE, 0644);
    json_out(['ok' => true, 'bytes' => strlen($js), 'saved' => date('H:i:s')]);
}

if ($action === 'upload-project') {
    $path = save_upload($_FILES['file'] ?? [], IMG_DIR, 'img', (string) ($_POST['name'] ?? 'projekt'), 1400);
    json_out(['ok' => true, 'path' => $path]);
}

if ($action === 'upload-logo') {
    $path = save_upload($_FILES['file'] ?? [], LOGO_DIR, 'img/logos', (string) ($_POST['name'] ?? 'logo'), 600);
    json_out(['ok' => true, 'path' => $path]);
}

fail('Neznámá akce.');
