<?php
/**
 * @package     Colegio NSD - Joomla Template
 * @version     1.0.0
 * @author      Colegio NSD
 * @copyright   Copyright (C) 2026 Colegio Nuestra Señora de los Dolores.
 * @license     GNU General Public License version 2 or later; see LICENSE.txt
 */

defined('_JEXEC') or die;

use Joomla\CMS\Factory;
use Joomla\CMS\HTML\HTMLHelper;
use Joomla\CMS\Language\Text;
use Joomla\CMS\Uri\Uri;

/** @var \Joomla\CMS\Document\HtmlDocument $this */

$app          = Factory::getApplication();
$wa           = $this->getWebAssetManager();
$tplPath      = 'templates/' . $this->template;
$tplUri       = Uri::root(true) . '/' . $tplPath;
$logo         = $this->params->get('logoFile', $tplPath . '/images/logo.svg');
$primaryColor = $this->params->get('primaryColor', '#1FA42C');
$accentColor  = $this->params->get('accentColor', '#F7D300');
$phone        = $this->params->get('phone', '91 123 45 67');
$email        = $this->params->get('email', 'secretaria@colegionsdolores.com');
$address      = $this->params->get('address', 'C/ Tordo, 9-15 · 28019 Madrid');

// Asset registry
$wa->registerAndUseStyle('colegio.fonts', 'https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,700;9..144,900&family=Inter:wght@400;500;600;700&display=swap');
$wa->registerAndUseStyle('colegio.icons', 'https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css');
$wa->registerAndUseStyle('colegio.styles', $tplUri . '/css/template.css');
$wa->registerAndUseStyle('colegio.pages', $tplUri . '/css/pages.css');
$wa->registerAndUseScript('colegio.main', $tplUri . '/js/template.js', [], ['defer' => true]);

// Detect view
$itemid     = (int) $app->input->getInt('Itemid');
$menu       = $app->getMenu();
$activeMenu = $menu->getActive();
$isHome     = ($activeMenu && $activeMenu->id == $menu->getDefault()->id);
$pageClass  = $activeMenu ? $activeMenu->getParams()->get('pageclass_sfx', '') : '';

$this->setHtml5(true);
?>
<!DOCTYPE html>
<html lang="<?php echo $this->language; ?>" dir="<?php echo $this->direction; ?>">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="theme-color" content="<?php echo htmlspecialchars($primaryColor); ?>" />
  <jdoc:include type="metas" />
  <jdoc:include type="styles" />
  <jdoc:include type="scripts" />
  <style>
    :root {
      --green-700: <?php echo htmlspecialchars($primaryColor); ?>;
      --yellow-500: <?php echo htmlspecialchars($accentColor); ?>;
    }
  </style>
</head>
<body class="site <?php echo $pageClass; ?> <?php echo $isHome ? 'is-home' : 'is-internal'; ?>" id="top">

  <!-- TOPBAR -->
  <div class="topbar">
    <div class="container topbar__inner">
      <div class="topbar__contact">
        <a href="tel:<?php echo preg_replace('/\s+/', '', $phone); ?>"><i class="bi bi-telephone-fill"></i> <?php echo htmlspecialchars($phone); ?></a>
        <a href="mailto:<?php echo htmlspecialchars($email); ?>"><i class="bi bi-envelope-fill"></i> <?php echo htmlspecialchars($email); ?></a>
        <span class="topbar__addr d-none-mobile"><i class="bi bi-geo-alt-fill"></i> <?php echo htmlspecialchars($address); ?></span>
      </div>
      <div class="topbar__quick">
        <jdoc:include type="modules" name="quick-access" style="none" />
      </div>
    </div>
  </div>

  <!-- NAVBAR -->
  <header class="navbar" id="navbar">
    <div class="container navbar__inner">
      <a href="<?php echo Uri::root(); ?>" class="brand">
        <img src="<?php echo Uri::root() . htmlspecialchars($logo); ?>" alt="<?php echo Text::_('TPL_COLEGIO_NSD_LOGO_ALT'); ?>" class="brand__logo" />
        <span class="brand__text">
          <strong><?php echo $app->get('sitename'); ?></strong>
          <small>Nuestra Señora de los Dolores</small>
        </span>
      </a>

      <button class="hamburger" id="hamburger" aria-label="<?php echo Text::_('TPL_COLEGIO_NSD_MENU'); ?>" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>

      <nav class="nav" id="primaryNav" aria-label="<?php echo Text::_('TPL_COLEGIO_NSD_NAV_PRIMARY'); ?>">
        <jdoc:include type="modules" name="menu" style="none" />
      </nav>
    </div>
  </header>

  <?php if ($isHome) : ?>
    <!-- HERO area for the home -->
    <jdoc:include type="modules" name="banner" style="none" />
    <jdoc:include type="modules" name="features" style="none" />
  <?php else : ?>
    <!-- Internal pages: page hero placeholder -->
    <section class="page-hero">
      <div class="container page-hero__inner">
        <div>
          <nav class="crumbs"><jdoc:include type="modules" name="breadcrumbs" style="none" /></nav>
          <h1><?php echo $this->getTitle() ?: ($activeMenu ? $activeMenu->title : ''); ?></h1>
        </div>
      </div>
    </section>
  <?php endif; ?>

  <!-- MAIN CONTENT -->
  <main id="content" class="<?php echo $isHome ? '' : 'section'; ?>">
    <div class="<?php echo $isHome ? '' : 'container'; ?>">
      <jdoc:include type="message" />
      <jdoc:include type="component" />
    </div>
  </main>

  <?php if ($isHome) : ?>
    <jdoc:include type="modules" name="news" style="none" />
    <jdoc:include type="modules" name="secretaria" style="none" />
    <jdoc:include type="modules" name="servicios" style="none" />
  <?php endif; ?>

  <!-- FOOTER -->
  <footer class="footer">
    <div class="container footer__grid">
      <div class="footer__brand">
        <a href="<?php echo Uri::root(); ?>" class="brand">
          <img src="<?php echo Uri::root() . htmlspecialchars($logo); ?>" alt="" class="brand__logo brand__logo--lg" />
          <span class="brand__text">
            <strong><?php echo $app->get('sitename'); ?></strong>
            <small>Nuestra Señora de los Dolores</small>
          </span>
        </a>
        <p><?php echo Text::_('TPL_COLEGIO_NSD_FOOTER_TAGLINE'); ?></p>
      </div>
      <div><jdoc:include type="modules" name="footer-1" style="none" /></div>
      <div><jdoc:include type="modules" name="footer-2" style="none" /></div>
      <div><jdoc:include type="modules" name="footer-3" style="none" /></div>
      <div><jdoc:include type="modules" name="footer-4" style="none" /></div>
    </div>

    <div class="footer__bottom">
      <div class="container footer__bottom-inner">
        <p>© <?php echo date('Y'); ?> <?php echo $app->get('sitename'); ?>. <?php echo Text::_('TPL_COLEGIO_NSD_FOOTER_RIGHTS'); ?></p>
        <jdoc:include type="modules" name="copyright" style="none" />
      </div>
    </div>

    <a href="#top" class="to-top" aria-label="<?php echo Text::_('TPL_COLEGIO_NSD_TO_TOP'); ?>"><i class="bi bi-arrow-up"></i></a>
  </footer>

  <jdoc:include type="modules" name="debug" style="none" />
</body>
</html>
