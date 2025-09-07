<?php
declare(strict_types=1);

/* --- Incluye PHPMailer manualmente --- */
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';
require __DIR__ . '/phpmailer/Exception.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

/* --- Sanitiza los datos del formulario --- */
function clean_text(string $s, int $max): string {
  $s = trim(strip_tags($s));
  $s = preg_replace("/[\r\n]/", "", $s);
  return mb_substr($s, 0, $max, 'UTF-8');
}

$name    = clean_text($_POST['name']    ?? '', 80);
$email   = clean_text($_POST['email']   ?? '', 120);
$phone   = clean_text($_POST['phone']   ?? '', 30);
$message = trim($_POST['message'] ?? '');
$privacy = ($_POST['privacy'] ?? '') === 'on';

if (!$name || !$email || !$message || !$privacy) {
  http_response_code(400); exit('Campos inválidos');
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
  http_response_code(400); exit('Email inválido');
}

/* --- Configura el envío SMTP --- */
$mail = new PHPMailer(true);

try {
  $mail->CharSet = 'UTF-8';
  $mail->isSMTP();
  $mail->Host = 'smtp.hostinger.com'; // verifica en tu panel si es este host exacto
  $mail->SMTPAuth = true;
  $mail->Username = 'info@shamrockenglishsolutions.es'; 
  $mail->Password = 'P1ckledonion25!';                 
  $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
  $mail->Port = 587;

  $mail->setFrom('info@shamrockenglishsolutions.es', 'Shamrock Web');
  $mail->addReplyTo($email, $name);
  $mail->addAddress('info@shamrockenglishsolutions.es');

  $mail->isHTML(true);
  $mail->Subject = 'Nuevo mensaje desde la web Shamrock';
  $mail->Body = "
    <p><strong>Nombre:</strong> {$name}</p>
    <p><strong>Email:</strong> {$email}</p>
    <p><strong>Teléfono:</strong> {$phone}</p>
    <hr>
    <p>".nl2br(htmlspecialchars($message))."</p>
  ";
  $mail->AltBody = "Nuevo contacto:\n\nNombre: $name\nEmail: $email\nTeléfono: $phone\n\nMensaje:\n$message";

  $mail->send();
  echo "OK";
} catch (Exception $e) {
  error_log("Mailer error: " . $mail->ErrorInfo);
  http_response_code(500);
  echo "Error al enviar el mensaje";
}
