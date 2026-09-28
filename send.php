<?php
declare(strict_types=1);

/* =========================================================================
   Odeslání poptávky z kontaktního formuláře → e-mail do studia.
   Statický web + PHP mail(). Bez třetí strany.
   ========================================================================= */

/* --- NASTAVENÍ (uprav dle potřeby) --------------------------------------- */
const MAIL_TO   = 'ahoj@foxyvision.cz';        // kam poptávky chodí
const MAIL_FROM = 'web@foxyvision.cz';         // odesílatel (adresa NA doméně kvůli SPF/doručitelnosti)
const SITE_NAME = 'Foxyvision';
/* ------------------------------------------------------------------------- */

header('Content-Type: application/json; charset=utf-8');

function out(array $data, int $code = 200): never {
    http_response_code($code);
    echo json_encode($data, JSON_UNESCAPED_UNICODE);
    exit;
}
function fail(string $msg, int $code = 400): never {
    out(['ok' => false, 'error' => $msg], $code);
}

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    fail('Jen POST.', 405);
}

/* honeypot: skryté pole „website" – roboti ho vyplní, lidé ne */
if (trim((string) ($_POST['website'] ?? '')) !== '') {
    out(['ok' => true]);            // tváříme se úspěšně, ale nic neodešleme
}

$name    = trim((string) ($_POST['name'] ?? ''));
$email   = trim((string) ($_POST['email'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($name === '' || $email === '' || $message === '') {
    fail('Vyplňte prosím jméno, e-mail i zprávu.');
}
if (mb_strlen($name) > 120 || mb_strlen($email) > 160 || mb_strlen($message) > 5000) {
    fail('Zpráva je příliš dlouhá.');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    fail('Neplatný e-mail.');
}

/* ochrana proti injektáži hlaviček – žádné konce řádků v adrese/jméně */
$clean = static fn (string $s): string => str_replace(["\r", "\n", "%0a", "%0d"], '', $s);
$name  = $clean($name);
$email = $clean($email);

$subject = 'Nová poptávka z webu – ' . $name;

$body =
    "Nová poptávka z webu " . SITE_NAME . "\n" .
    "----------------------------------------\n\n" .
    "Jméno:  " . $name . "\n" .
    "E-mail: " . $email . "\n\n" .
    "Zpráva:\n" . $message . "\n\n" .
    "----------------------------------------\n" .
    "Odesláno: " . date('j. n. Y H:i') . "\n" .
    "IP: " . ($_SERVER['REMOTE_ADDR'] ?? '?') . "\n";

$headers = [
    'From: ' . SITE_NAME . ' <' . MAIL_FROM . '>',
    'Reply-To: ' . $name . ' <' . $email . '>',   // odpověď jde rovnou tazateli
    'Content-Type: text/plain; charset=utf-8',
    'MIME-Version: 1.0',
    'X-Mailer: PHP/' . PHP_VERSION,
];

/* zakódovaný předmět (diakritika) */
$subjectEnc = '=?UTF-8?B?' . base64_encode($subject) . '?=';

$sent = @mail(MAIL_TO, $subjectEnc, $body, implode("\r\n", $headers), '-f' . MAIL_FROM);

if (!$sent) {
    fail('E-mail se nepodařilo odeslat. Zkuste to prosím znovu, nebo napište na ' . MAIL_TO . '.', 500);
}

out(['ok' => true]);
