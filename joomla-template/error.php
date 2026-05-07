<?php
/**
 * @package     Colegio NSD - Joomla Template
 * @copyright   Copyright (C) 2026 Colegio NSD.
 * @license     GNU General Public License version 2 or later;
 */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Uri\Uri;

$tplPath = 'templates/' . $this->template;
$logo    = Uri::root() . $tplPath . '/images/logo.svg';

if (!isset($this->error)) {
    $this->error      = new \Exception(Text::_('JERROR_ALERTNOAUTHOR'), 404);
    $this->debug      = false;
}

$code = $this->error->getCode() ?: 500;
?>
<!DOCTYPE html>
<html lang="<?php echo $this->language; ?>" dir="<?php echo $this->direction; ?>">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?php echo $code; ?> - <?php echo htmlspecialchars($this->error->getMessage(), ENT_QUOTES, 'UTF-8'); ?></title>
  <link rel="stylesheet" href="<?php echo Uri::root() . $tplPath; ?>/css/template.css" />
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css" />
</head>
<body class="error-page">
  <main class="container" style="min-height:90vh;display:grid;place-items:center;text-align:center;padding:60px 24px;">
    <div>
      <img src="<?php echo $logo; ?>" alt="Logo" style="width:90px;margin:0 auto 30px;" />
      <p style="font-family:var(--font-display);font-weight:900;font-size:8rem;line-height:1;margin:0;color:var(--green-700);"><?php echo $code; ?></p>
      <h1 style="font-family:var(--font-display);font-size:2rem;margin:8px 0 16px;"><?php echo htmlspecialchars($this->error->getMessage(), ENT_QUOTES, 'UTF-8'); ?></h1>
      <p style="color:var(--ink-500);max-width:520px;margin:0 auto 30px;">Lo sentimos, no hemos encontrado lo que buscas. Vuelve al inicio o navega por el menú.</p>
      <a href="<?php echo Uri::root(); ?>" class="btn btn--primary"><i class="bi bi-house"></i> Volver al inicio</a>
    </div>
  </main>
</body>
</html>
