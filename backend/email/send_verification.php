<?php
// ─────────────────────────────────────────────────────────────────────────────
// send_verification.php
// Shared helper — generates a secure token and dispatches a verification email.
// Include this file in register.php and resend_verification.php.
// ─────────────────────────────────────────────────────────────────────────────

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require_once __DIR__ . '/../vendor/autoload.php';
require_once __DIR__ . '/../config.php';

/**
 * Generates a token, stores it, and sends the verification email.
 *
 * @param PDO    $pdo     Active database connection
 * @param int    $userId  ID of the newly registered user
 * @param string $email   Recipient email address
 *
 * @return true|string  Returns true on success, or an error message string on failure.
 */
function sendVerificationEmail(PDO $pdo, int $userId, string $email): true|string {
    // 1. Generate a cryptographically secure token (from Chapter 4 reference)
    $token      = bin2hex(random_bytes(32));
    $expires_at = date('Y-m-d H:i:s', strtotime('+24 hours'));

    // 2. Persist the token to the email_verifications table
    $stmt = $pdo->prepare(
        'INSERT INTO email_verifications (user_id, token, expires_at) VALUES (?, ?, ?)'
    );
    $stmt->execute([$userId, $token, $expires_at]);

    // 3. Build the verification URL
    $verifyLink = VERIFY_URL . '?token=' . $token;

    // 4. Send via PHPMailer (SMTP)
    $mail = new PHPMailer(true);

    try {
        // Server settings
        $mail->isSMTP();
        $mail->Host       = MAIL_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_USERNAME;
        $mail->Password   = MAIL_PASSWORD;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
        $mail->Port       = MAIL_PORT;

        // Sender & recipient
        $mail->setFrom(MAIL_FROM, MAIL_FROM_NAME);
        $mail->addAddress($email);

        // Content
        $mail->isHTML(true);
        $mail->Subject = 'Verify your Algorithm Complexity Analyzer account';
        $mail->Body    = '
            <div style="font-family: Inter, sans-serif; max-width: 520px; margin: auto; padding: 32px; border: 1px solid #e2e8f0; border-radius: 8px;">
                <h2 style="color: #1e40af;">Verify Your Email Address</h2>
                <p style="color: #475569;">Thank you for registering! Please click the button below to verify your email address. This link will expire in <strong>24 hours</strong>.</p>
                <a href="' . $verifyLink . '"
                   style="display: inline-block; margin: 20px 0; padding: 12px 24px;
                          background-color: #2563eb; color: #ffffff; text-decoration: none;
                          border-radius: 6px; font-weight: 600;">
                    Verify Email Address
                </a>
                <p style="color: #94a3b8; font-size: 0.8rem;">
                    If you did not create an account, you can safely ignore this email.<br>
                    Or copy and paste this link into your browser:<br>
                    <span style="word-break: break-all;">' . $verifyLink . '</span>
                </p>
            </div>
        ';
        $mail->AltBody = 'Click here to verify: ' . $verifyLink;

        $mail->send();
        return true;

    } catch (Exception $e) {
        return $mail->ErrorInfo;
    }
}
