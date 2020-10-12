/*:
 * @plugindesc <QMap>
 * Creates maps made with QMap Editor
 * @version 2.0.3
 * @author Quxios  | Version 2.0.3
 * @site https://quxios.github.io/
 * @updateurl https://quxios.github.io/data/pluginsMin.json
 *
 * @requires QPlus
 *
 * @video https://www.youtube.com/watch?v=x7vcK96aW28
 *
 * @help
 * ============================================================================
 * ## About
 * ============================================================================
 * Similar to a parallax plugin. This plugin creates maps you created using
 * QMap Editor.
 *
 * ============================================================================
 * ## How to use
 * ============================================================================
 * Create a map using the [QMap Editor](https://github.com/quxios/QMapEditor).
 * And that's it, no setup required.
 *
 * ============================================================================
 * ## QMap Editor Notes
 * ============================================================================
 * **Collider**
 * ----------------------------------------------------------------------------
 * Lets you add a collider to your map object for additional features.
 * There's two different methods for setting up a collider.
 *
 * First:
 * ~~~
 *  <collider:SHAPE,WIDTH,HEIGHT,OX,OY>
 * ~~~
 * - SHAPE: Set to box, circle or poly (only box works unless QMovement is installed)
 *   - If poly read next section on poly shape
 * - WIDTH: The width of the collider, in pixels
 * - HEIGHT: The height of the collider, in pixels
 * - OX: The X Offset of the collider, in pixels
 * - OY: The Y Offset of the collider, in pixels
 *
 * This will set the default collider to these settings.
 *
 * Second:
 * ~~~
 *  <colliders>
 *  TYPE: SHAPE,WIDTH,HEIGHT,OX,OY
 *  TYPE: SHAPE,WIDTH,HEIGHT,OX,OY
 *  TYPE: SHAPE,WIDTH,HEIGHT,OX,OY
 *  </colliders>
 * ~~~
 * You can include as many different colliders as you want, as long as TYPE
 * is different on each line.
 *
 * - TYPE: When this collider will be used. Set to default when you want that
 *  collider to be used when ever the type isn't found. Set to collision, for
 *  that collider to be used as a collision. Set to other values if needed
 *  for example, if a certain type is needed for a plugin feature.
 * - SHAPE: Set to box, circle or poly (only box works unless QMovement is installed)
 *   * If poly read next section on poly shape
 * - WIDTH: The width of the collider, in pixels
 * - HEIGHT: The height of the collider, in pixels
 * - OX: The X Offset of the collider, in pixels
 * - OY: The Y Offset of the collider, in pixels
 *
 * ----------------------------------------------------------------------------
 * **Poly Colliders**
 * ----------------------------------------------------------------------------
 * To create a polygon collider, set the shape to poly. After that the rest
 * of the line should be a list of points separated with a comma. Points are
 * written as "(X,Y)". An example polygon would be:
 * ~~~
 *  poly,(24,0),(48,24),(24,48),(0,24)
 * ~~~
 * Would create a diamond shaped polygon.
 *
 * ----------------------------------------------------------------------------
 * **OnPlayer**
 * ----------------------------------------------------------------------------
 * Experimental feature, might be changed / renamed
 *
 * At the moment, this note will change this map objects alpha to 0.5 when
 * the player is behind it. This feature requires a default or interaction
 * collider.
 * ~~~
 *  <onPlayer>
 * ~~~
 * Just add that note to the map object to have this feature, then include
 * a collider.
 *
 * ----------------------------------------------------------------------------
 * **Breath**
 * ----------------------------------------------------------------------------
 * Adds a breathing effect to the map object. A breathing effect is where the
 * the sprites scale is increased and decreased in a sin wave.
 * ~~~
 *  <breath:OFFSET,DURATION,INITIALTIME?>
 * ~~~
 * - OFFSET: How much to scale. 1 is 100%, 0.5 is 50%. So 0.5 means its
 *  scale will go between 0.5 and 1.5;
 * - DURATION: How long it takes for 1 cycle, in frames. 60 frames = 1 second
 * - INITIALTIME: (Optional, Default: 0) Which frame should it start at. Ex;
 *  if DURATION was 60 and this is set at 30, it'll start in the middle of the
 *  cycle.
 *
 * ----------------------------------------------------------------------------
 * **Tint**
 * ----------------------------------------------------------------------------
 * Change the tint of the map object. Similar to the Tint Screen event command.
 * ~~~
 *  <tint:RED,GREEN,BLUE,GRAY>
 * ~~~
 * - RED: Red value of tint, set between -255 to 255. Default: 0
 * - GREEN: Red value of tint, set between -255 to 255. Default: 0
 * - BLUE: Red value of tint, set between -255 to 255. Default: 0
 * - GRAY: Red value of tint, set between -255 to 255. Default: 0
 *
 * ============================================================================
 * ## Videos
 * ============================================================================
 * Example of a map made with QMap
 * https://www.youtube.com/watch?v=n6aF6mnHEAk
 *
 * Example of the full QMap process, from the editor to mv
 * https://www.youtube.com/watch?v=XMWluxVErKo
 * If you have a video you'd like to have listed here, feel free to send me a
 * link in the RPGMakerWebs thread! (link below)
 *
 * ============================================================================
 * ## Links
 * ============================================================================
 * Formated Help:
 *
 *  https://quxios.github.io/plugins/QMap
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
 * @tags sprite, map, parallax
 */
