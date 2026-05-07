<?php
/**
 * @package     Colegio NSD - Joomla Template (mod_menu override)
 * @copyright   Copyright (C) 2026 Colegio NSD.
 * @license     GNU General Public License version 2 or later;
 */

defined('_JEXEC') or die;

use Joomla\CMS\HTML\HTMLHelper;

/** @var \Joomla\CMS\Menu\AbstractMenu $menu */
/** @var array $list */
?>
<ul class="nav-menu" role="menubar">
<?php foreach ($list as $i => &$item) :
    $class = 'item-' . $item->id;
    if ($item->id == $active_id) {
        $class .= ' is-active';
    }
    if (in_array($item->id, $path)) {
        $class .= ' is-parent-active';
    }
    if ($item->deeper) {
        $class .= ' has-dropdown';
    }
    if ($item->parent) {
        $class .= ' has-parent';
    }
?>
  <li class="<?php echo $class; ?>" role="none">
    <?php
    require __DIR__ . '/default_' . $item->type . '.php';
    if ($item->deeper) :
    ?>
      <ul class="dropdown" role="menu">
        <?php foreach ($item->children as $child) : ?>
          <li class="item-<?php echo $child->id; ?>" role="none">
            <a href="<?php echo $child->flink; ?>" role="menuitem"><?php echo $child->title; ?></a>
          </li>
        <?php endforeach; ?>
      </ul>
    <?php endif; ?>
  </li>
<?php endforeach; ?>
</ul>
