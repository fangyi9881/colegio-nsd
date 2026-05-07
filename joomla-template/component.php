<?php
/**
 * @package     Colegio NSD - Joomla Template
 * @copyright   Copyright (C) 2026 Colegio NSD.
 * @license     GNU General Public License version 2 or later;
 */

defined('_JEXEC') or die;

use Joomla\CMS\Uri\Uri;

$tplPath = 'templates/' . $this->template;
?>
<!DOCTYPE html>
<html lang="<?php echo $this->language; ?>" dir="<?php echo $this->direction; ?>">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <jdoc:include type="metas" />
  <jdoc:include type="styles" />
  <link rel="stylesheet" href="<?php echo Uri::root() . $tplPath; ?>/css/template.css" />
  <jdoc:include type="scripts" />
</head>
<body class="component-only">
  <jdoc:include type="message" />
  <jdoc:include type="component" />
</body>
</html>
