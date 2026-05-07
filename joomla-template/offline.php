<?php
/**
 * @package     Colegio NSD - Joomla Template
 * @copyright   Copyright (C) 2026 Colegio NSD.
 * @license     GNU General Public License version 2 or later;
 */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\Uri\Uri;

$app     = Factory::getApplication();
$tplPath = 'templates/' . $this->template;
$logo    = Uri::root() . $tplPath . '/images/logo.svg';
?>
<!DOCTYPE html>
<html lang="<?php echo $this->language; ?>" dir="<?php echo $this->direction; ?>">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title><?php echo $app->get('sitename'); ?> - <?php echo htmlspecialchars($app->get('offline_message')); ?></title>
  <jdoc:include type="metas" />
  <jdoc:include type="styles" />
  <link rel="stylesheet" href="<?php echo Uri::root() . $tplPath; ?>/css/template.css" />
</head>
<body class="offline-page">
  <main class="container" style="min-height:90vh;display:grid;place-items:center;padding:40px 24px;">
    <div style="text-align:center;max-width:520px;">
      <img src="<?php echo $logo; ?>" alt="Logo" style="width:90px;margin:0 auto 30px;" />
      <h1 style="font-family:var(--font-display);font-size:2rem;margin-bottom:14px;"><?php echo $app->get('sitename'); ?></h1>
      <p style="color:var(--ink-500);margin-bottom:24px;"><?php echo htmlspecialchars($app->get('offline_message')); ?></p>
      <jdoc:include type="message" />
      <?php if ($app->get('offline_image')) : ?>
        <img src="<?php echo Uri::root() . $app->get('offline_image'); ?>" alt="" style="max-width:100%;border-radius:14px;margin:24px 0;" />
      <?php endif; ?>
      <jdoc:include type="installation" />
    </div>
  </main>
</body>
</html>
