/*:
 * @plugindesc QMovement Addon: Adds image collision maps
  <Luna_QMCollisionMap>

 * @author LunaTechs | Quxios
 * @url https://lunatechs.dev/luna-qplugins/
 *
 *
 * @param Scan Size
 * @desc How accurate to scan Collision Map, 1 is most Accurate
 * Default: 4
 * @type number
 * @min 1
 * @default 4
 *
 * @param Folder
 * @desc Which folder are collision maps located.
 * Default: img/parallaxes/
 * @default img/parallaxes/
 *
 * @help
 * This is a port of the original plugin QM + CollisionMap by Quixos
 *  | https://quxios.github.io/plugins/QM+CollisionMap
 * ============================================================================
 * ## About
 * ============================================================================
 * This is an addon to QMovement plugin. This addon adds a feature that lets
 * you use images as a collision map.
 * ============================================================================
 * ## How to use
 * ============================================================================
 * Install this plugin somewhere below QMovement. Make your collision map,
 * White and transparent are passable areas, other colors will be impassable.
 * ----------------------------------------------------------------------------
 * **Note tag**
 * ----------------------------------------------------------------------------
 * To add a collision map to a map, open the map properties and add a notetag
 * with the following format:
 * ~~~
 *  <cm:FILENAME>
 * ~~~
 * Where FILENAME is the name of the image you want to use thats located in the
 * folder you set in the plugin parameters.
 * ============================================================================
 * ## Links
 * ============================================================================
 * Formated Help:
 *
 *  https://quxios.github.io/#/plugins/QM+CollisionMap
 *
 * RPGMakerWebs:
 *
 *  http://forums.rpgmakerweb.com/index.php?threads/qplugins.73023/
 *
 * Terms of use:
 *
 *  https://github.com/quxios/QMV-Master-Demo/blob/master/readme.md
 *
 * Like my plugins? Support me on Patreon!
 *
 *  https://www.patreon.com/quxios
 *
 * @tags QM-Addon, collision
 */
