/*:
 * @plugindesc Add more control over your character with pixel movement
   <Luna_QMovement>
 * @author LunaTechs | Quxios
 * @url https://lunatechs.dev/luna-qplugins
 *
 * @target MZ
 *
 * @repo https://github.com/quxios/QMovement
 *
 * @requires QPlus
 * @exportName QMovement
 *
 * @video TODO
 *
 * @param Main Settings
 *
 * @param Grid
 * @parent Main Settings
 * @desc The amount of pixels you want to move per Movement.
 * Plugin Default: 1   MV Default: 48
 * @type Number
 * @min 1
 * @default 1
 *
 * @param Tile Size
 * @parent Main Settings
 * @desc Size of tiles in pixels
 * Default: 48
 * @type Number
 * @min 1
 * @default 48
 *
 * @param Off Grid
 * @parent Main Settings
 * @desc Allow characters to move off grid?
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param Optional Settings
 *
 * @param Smart Move
 * @parent Optional Settings
 * @desc If the move didn't succeed, try again at lower speeds or at
 * a different direction
 * @type select
 * @option Disabled
 * @value 0
 * @option Adjust Speed
 * @value 1
 * @option Adjust Direction
 * @value 2
 * @option Adjust Speed and Direction
 * @value 3
 * @default 2
 *
 * @param Mid Pass
 * @parent Optional Settings
 * @desc An extra collision check for the midpoint of the Movement.
 * @type boolean
 * @on Enable
 * @off Disable
 * @default false
 *
 * @param Move on click
 * @parent Optional Settings
 * @desc Set if player moves with mouse click
 * * Requires QPathfind to work
 * @type boolean
 * @on Enable
 * @off Disable
 * @default true
 *
 * @param Diagonal
 * @parent Optional Settings
 * @desc Allow for diagonal movement?
 * @type boolean
 * @on Yes
 * @off No
 * @default true
 *
 * @param Diagonal Speed
 * @parent Optional Settings
 * @desc Adjust the speed when moving diagonal.
 * Default: 0 TODO not functional
 * @type Number
 * @min 0
 * @default 0
 *
 * @param Colliders
 *
 * @param Player Collider
 * @text Default Player Collider
 * @parent Colliders
 * @desc Default collider for the player.
 * @type Struct<Collider>
 * @default {"Type":"box","Width":"36","Height":"24","Offset X":"6","Offset Y":"24"}
 *
 * @param Event Collider
 * @text Default Event Collider
 * @parent Colliders
 * @desc Default collider for events.
 * @type Struct<Collider>
 * @default {"Type":"box","Width":"36","Height":"24","Offset X":"6","Offset Y":"24"}
 *
 * @param Presets
 * @parent Colliders
 * @desc List of preset colliders that you can assign to
 * events
 * @type Struct<ColliderPreset>[]
 * @default []
 *
 * @param Debug Settings
 *
 * @param Show Colliders
 * @parent Debug Settings
 * @desc Show the Box Colliders by default during testing.
 * -Can be toggled on/off with F10 during play test
 * @type boolean
 * @on Show by default
 * @off Hide by default
 * @default true
 *
 * @command transfer
 * @desc Perform a map transfer to a pixel x / y position.
 * @type Type
 * @default Default
 * 
 * @arg mapId
 * @desc the MapID to transfer to
 * @type number
 * 
 * @arg fade
 * @desc The fade out effect color to use
 * @type select
 * @default black
 * @option black
 * @option white
 * 
 * @arg dir
 * @desc The direction to face upon transfer
 * @type select
 * @default south
 * 
 * @option north
 * @value 2
 * @option south
 * @value 4
 * @option west
 * @value 6
 * @option east
 * @value 8
 * 
 * @arg x
 * @desc The x position to transfer to, in pixels
 * @type number
 * @default 0
 * @arg y
 * @desc The y position to transfer to, in pixels
 * @type number
 * @default 0
 * 
 * @command setPosition
 * @desc Move a character to a x / y pixel position.
 * @type Type
 * @default Default
 * 
 * @arg charId
 * @desc The character ID
 * @arg x
 * @desc The x position in pixels
 * @arg y
 * @desc The y position in pixels
 * 
 * @arg dir
 * @desc The direction the character should face when transferring. Can be 2, 4, 6, 8, or for diagonals 1, 3, 7, 9
 * @desc The direction to face upon transfer
 * @type select
 * @default south
 * 
 * @option northWest
 * @value 1
 * @option north
 * @value 2
 * @option northEast
 * @value 3
 * @option south
 * @value 4
 * @option west
 * @value 6
 * @option southWest
 * @value 7
 * @option east
 * @value 8
 * @option southEast
 * @value 9
 * 
 * @command changeCollider
 * @desc Change an event or the player's collider
 * @type Type
 * @default Default
 * 
 * @arg charId
 * @desc The ID of the character - For player: 0, p, or player, otherwise the eventID or "this" for the event this command is called from.
 * @type note
 * @default 0
 * 
 * @arg type
 * @desc The type of collider to use.
 * @type select
 * @default default
 * @option default
 * @option intersection
 * @option collision
 * 
 * @arg shape
 * @desc The shape of the collider
 * @type select
 * @default box
 * @option box
 * @option circle
 * 
 * @arg width
 * @desc The width of the collider
 * @default 32
 * @type number
 * 
 * @arg height
 * @desc The height of the collider
 * @type number
 * @default 24
 * 
 * @arg ox
 * @desc The x offset of the collider in pixels
 * @type number
 * @default 0
 * 
 * @arg oy
 * @desc The y offset of the collider in pixels
 * @type number
 * @default 0
 * 
 * @help
 * This is a port of the original plugin QMovement by Quixos
 *  | https://quxios.github.io/plugins/QMovement
 * 
 * ============================================================================
 * ## About
 * ============================================================================
 * This plugin completely rewrites the collision system to use colliders. Using
 * colliders enabled more accurate collision checking with dealing with pixel
 * movement. This plugin also lets you change how many pixels the characters
 * move per step, letting you set up a 24x24 movement or a 1x1 (pixel movement)
 *
 * Note there are a few mv features disabled/broken; mouse movement, followers,
 * and vehicles.
 * ============================================================================
 * ## Setting up
 * ============================================================================
 * To setup a pixel based movement, you'll need to change the plugin parameters
 * to something like:
 *
 * - Grid = 1
 * - Off Grid = true
 * - Mid Pass = false
 *
 * Other parameters can be set to your preference.
 *
 * For a grid based movement, set it something like:
 *
 * - Grid = GRIDSIZE YOU WANT
 * - Off Grid = false
 * - Mid Pass = true
 *
 * When in grid based movement, you want your colliders to fill up most of the
 * grid size but with a padding of 4 pixels on all sides (this is because some
 * tile colliders are 4 tiles wide or tall). So if your grid size was 48, your
 * colliders shouldn't be 48x48, instead they should be 40x40, with an ox and oy
 * of 4. So your collider setting would look like: box, 40, 40, 4, 4
 * ============================================================================
 * ## Colliders
 * ============================================================================
 * There are 3 types of colliders; Polygon, Box and Circle. Though you can only
 * create box and circle colliders, unless you modify the code to accept
 * polygons. This is intentional since polygon would be "harder" to setup.
 *
 * ![Colliders Image](https://quxios.github.io/imgs/qmovement/colliders.png)
 *
 * - Boxes takes in width, height, offset x and offset y
 * - Circles similar to boxes, takes in width, height, offset x and offset y
 * ----------------------------------------------------------------------------
 * **Setting up colliders**
 * ----------------------------------------------------------------------------
 * Colliders are setup inside the Players notebox or as a comment inside an
 * Events page. Events colliders depends it's page, so you may need to make the
 * collider on all pages.
 *
 * There are two ways to setup colliders. using `<collider:-,-,-,->` and using
 * `<colliders>-</colliders>`. The first method sets the 'Default' collider for
 * that character. The second one you create the colliders for every collider
 * type.
 * ----------------------------------------------------------------------------
 * **Collider Types**
 * ----------------------------------------------------------------------------
 * There are 3 collider types. Default, Collision and Interaction.
 * - Default: This is the collider to use if collider type that was called was
 * not found
 * - Collision: This collider is used for collision checking
 * - Interaction: This collider is used for checking interaction.
 * ----------------------------------------------------------------------------
 * **Collider Presets**
 * ----------------------------------------------------------------------------
 * You can create colliders in the plugin parameters which you can use when
 * setting up other colliders.
 * ----------------------------------------------------------------------------
 * **Collider Terms**
 * ----------------------------------------------------------------------------
 * ![Colliders Terms Image](https://quxios.github.io/imgs/qmovement/colliderInfo.png)
 * ----------------------------------------------------------------------------
 * **Collider Notetag**
 * ----------------------------------------------------------------------------
 * ~~~
 *  <collider: [SHAPE], [WIDTH], [HEIGHT], [OX], [OY]>
 * ~~~
 * This notetag sets all collider types to these values.
 * - SHAPE: Set to box, circle or poly
 *   - If poly read next section on poly shape
 * - WIDTH: The width of the collider, in pixels
 * - HEIGHT: The height of the collider, in pixels
 * - OX: The X Offset of the collider, in pixels
 * - OY: The Y Offset of the collider, in pixels
 * ----------------------------------------------------------------------------
 * **Colliders Notetag**
 * ----------------------------------------------------------------------------
 * ~~~
 *  <colliders>
 *  [TYPE]: [SHAPE], [WIDTH], [HEIGHT], [OX], [OY]
 *  </colliders>
 * ~~~
 * This notetag sets all collider types to these values.
 * - TYPE: The type of collider, set to default, collision or interaction
 * - SHAPE: Set to box, circle or poly
 *   - If poly read next section on poly shape
 * - WIDTH: The width of the collider, in pixels
 * - HEIGHT: The height of the collider, in pixels
 * - OX: The X Offset of the collider, in pixels
 * - OY: The Y Offset of the collider, in pixels
 *
 * To add another type, just add `type: shape, width, height, ox, oy` on
 * another line.
 *
 * Example:
 * ~~~
 *  <colliders>
 *  default: box, 48, 48
 *  collision: circle, 24, 24, 12, 12
 *  interaction: box, 32, 32, 8, 8
 *  </colliders>
 * ~~~
 * ----------------------------------------------------------------------------
 * **Using Preset**
 * ----------------------------------------------------------------------------
 * To use a collider preset in the notetag, the format is:
 * ~~~
 *  preset, [PRESETID]
 * ~~~
 * - PRESETID: The PresetID you set in the preset parameter.
 *
 * You will use this format instead of the: `SHAPE, WIDTH, HEIGHT, OX, OY`
 *
 * Example:
 * ~~~
 *  <collider: preset, largeCollider>
 * ~~~
 * Will look for the preset with the ID `largeCollider`
 *
 * Example 2:
 * ~~~
 *  <colliders>
 *  default: preset, largeDefault
 *  collision: preset, largeCollider
 *  interaction: preset, largeInteraction
 *  </colliders>
 * ~~~
 * Will use the presets; `largeDefault`, `largeCollider`, and `largeInteraction`
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
 * Example of using it inside a collider tag
 * ~~~
 *  <collider:poly,(24,0),(48,24),(24,48),(0,24)>
 * ~~~
 * ============================================================================
 * ## Move Routes
 * ============================================================================
 * By default, event move commands (moveup, movedown, ect) will convert to a
 * qmove that moves the character based off your tilesize. So if your tilesize
 * is 48 and your gridsize is 1. Then a moveup command will move the character
 * up 48 pixels not 1. But if you want to move the character by a fixed amount
 * of pixels, then you will use the QMove commands.
 * ----------------------------------------------------------------------------
 * **QMove**
 * ----------------------------------------------------------------------------
 * ![QMove Script Call](https://quxios.github.io/imgs/qmovement/qmove.png)
 *
 * To do a QMove, add a script in the move route in the format:
 * ~~~
 *  qmove(DIR, AMOUNT, MULTIPLER)
 * ~~~
 * - DIR: Set to a number representing the direction to move;
 *  - 4: left, 6: right, 8: up 2: down,
 *  - 1: lower left, 3: lower right, 7: upper left, 9: upper right,
 *  - 5: current direction, 0: reverse direction
 * - AMOUNT: The amount to move in that direction, in pixels
 * - MULTIPLIER: multiplies against amount to make larger values easier [OPTIONAL]
 *
 * Example:
 * ~~~
 *  qmove(4, 24)
 * ~~~
 * Will move that character 24 pixels to the left.
 * ----------------------------------------------------------------------------
 * **Arc**
 * ----------------------------------------------------------------------------
 * Arcing is used to make a character orbit around a position. Note that collisions
 * are ignored when arcing, but interactions still work. To add a arc add a script
 * in the move route in the format:
 * ~~~
 *  arc(PIVOTX, PIVOTY, RADIAN, CCWISE?, FRAMES)
 * ~~~
 * - PIVOTX: The x position to orbit around, in pixels
 * - PIVOTY: The y position to orbit around, in pixels
 * - RADIAN: The degrees to move, in radians
 * - CCWISE?: set to true or false; if true it will arc countclock wise
 * - FRAMES: The amount of frames to complete the arc
 *
 * Example:
 * ~~~
 *  arc(480,480,Math.PI*2,false,60)
 * ~~~
 * Will make the character do a full 360 arc clockwise around the point 480, 480
 * and it'll take 60 frames.
 * ============================================================================
 * ## Event Notetags/Comments
 * ============================================================================
 * **Offsets**
 * ----------------------------------------------------------------------------
 * To shift an events initial starting position, you can use the following
 * note tags:
 * ~~~
 *  <ox:X>
 * ~~~
 * or
 * ~~~
 *  <oy:X>
 * ~~~
 * Where X is the number of pixels to shift the event. Can be negative.
 * ----------------------------------------------------------------------------
 * **SmartDir**
 * ----------------------------------------------------------------------------
 * By default, when the player collides with an event it won't trigger the
 * Smart Move Dir effect. To enable this, add following notetag to the event:
 * ~~~
 *  <smartDir>
 * ~~~
 * ----------------------------------------------------------------------------
 * **IgnoreCharas**
 * ----------------------------------------------------------------------------
 * You can have an event ignore certain characters when collision checking. This
 * allows you to let some events move through some events or the player. Note that
 * this is not 2 ways, so if an event can move through the player, that doesn't
 * mean the player can move through the event.
 * ~~~
 *  <ignoreCharas:CHARAIDS>
 * ~~~
 * Where CHARAIDS is a list of character Ids, separated by a comma
 * ============================================================================
 * ## Map Notetags
 * ============================================================================
 * **GridSize**
 * ----------------------------------------------------------------------------
 * You can set the grid size for certain maps by using the notetag:
 * ~~~
 *  <grid:X>
 * ~~~
 * Where X is the grid size to use for this map.
 * ----------------------------------------------------------------------------
 * **OffGrid**
 * ----------------------------------------------------------------------------
 * You can set weither you can or can't move off the grid for certain maps by
 * using the notetag:
 * ~~~
 *  <offGrid:BOOL>
 * ~~~
 * Where BOOL is true or false
 * ----------------------------------------------------------------------------
 * **MidPass**
 * ----------------------------------------------------------------------------
 * You can set weither you want to use the mid pass function for certain maps by
 * using the notetag:
 * ~~~
 *  <midPass:BOOL>
 * ~~~
 * Where BOOL is true or false
 * ============================================================================
 * ## Plugin Commands
 * ============================================================================
 * **Transfer**
 * ----------------------------------------------------------------------------
 * MV event transfers are grid based. So this plugin command lets you map transfer
 * to a pixel x / y position.
 * ~~~
 *  qMovement transfer [MAPID] [X] [Y] [OPTIONS]
 * ~~~
 * - MAPID: The id of the map to transfer to
 * - X: The x position to transfer to, in pixels
 * - Y: The y position to transfer to, in pixels
 *
 * Possible options:
 *
 * - dirX: Set X to the dir to face after the transfer.
 *   - Can be 2, 4, 6, 8, or for diagonals 1, 3, 7, 9
 * - fadeBlack: Will fade black when transfering
 * - fadeWhite: Will fade white when transfering
 *
 * Example:
 * ~~~
 *  qMovement transfer 1 100 116 dir2 fadeBlack
 * ~~~
 * Will transfer the player to map 1 at x100, y116. There will be a black fade
 * and player will be facing down
 * ~~~
 *  qMovement transfer 1 100 116
 * ~~~
 * Will transfer the player to map 1 at x100, y116. There will be no fade and
 * players direction won't change
 * ----------------------------------------------------------------------------
 * **Set Pos**
 * ----------------------------------------------------------------------------
 * This command will let you move a character to a x / y pixel position. Note
 * this will not "walk" the character to that position! This will place the
 * character at this position, similar to a transfer.
 * ~~~
 *  qMovement setPos [CHARAID] [X] [Y] [OPTIONS]
 * ~~~
 * - CHARAID: The character identifier.
 *  - For player: 0, p, or player
 *  - For events: EVENTID, eEVENTID, eventEVENTID or this for the event that called this (replace EVENTID with a number)
 * - X: The x position to set to, in pixels
 * - Y: The y position to set to, in pixels
 *
 * Possible options:
 *
 * - dirX: Set X to the dir to face after the transfer.
 *   - Can be 2, 4, 6, 8, or for diagonals 1, 3, 7, 9
 *
 * ----------------------------------------------------------------------------
 * **Change Collider**
 * ----------------------------------------------------------------------------
 * This command will let you change a collider for a character. Note that you
 * should use this carefully. If you don't you can get that character stuck.
 * ~~~
 *  qMovement changeCollider [CHARAID] [TYPE] [SHAPE] [WIDTH] [HEIGHT] [OX] [OY]
 * ~~~
 * - CHARAID: The character identifier.
 *  - For player: 0, p, or player
 *  - For events: EVENTID, eEVENTID, eventEVENTID or this for the event that called this (replace EVENTID with a number)
 * - TYPE: The type of collider, set to default, collision or interaction
 * - SHAPE: Set to box or circle
 * - WIDTH: The width of the collider, in pixels
 * - HEIGHT: The height of the collider, in pixels
 * - OX: The X Offset of the collider, in pixels
 * - OY: The Y Offset of the collider, in pixels
 *
 * You can also set it to a preset by using the format:
 * ~~~
 *  qMovement changeCollider [CHARAID] [TYPE] preset [PRESETID]
 * ~~~
 * - CHARAID: The character identifier.
 *  - For player: 0, p, or player
 *  - For events: EVENTID, eEVENTID, eventEVENTID or this for the event that called this (replace EVENTID with a number)
 * - TYPE: The type of collider, set to default, collision or interaction
 * - PRESETID: The PresetID you set in the preset parameter.
 * ============================================================================
 * ## Tips
 * ============================================================================
 * **No closed open spaces!**
 * ----------------------------------------------------------------------------
 * For performance reasons, you should try to avoid having open spaces that are
 * closed off.
 *
 * ![Example](https://quxios.github.io/imgs/qmovement/openSpaces.png)
 *
 * On the left we can see some tiles that have a collider border, but their inside
 * is "open". This issue is should be corrected when using QPathfind because
 * if someone was to click inside that "open" space, it is passable and QPathfind
 * will try to find a way in even though there is no way in and will cause massive
 * lag. The fix can be pretty simple, you could add a CollisionMap (though that
 * may be another issue in its own) or add a RegionCollider to fill up the full
 * tile like I did on the correct side of that image.
 * ----------------------------------------------------------------------------
 * **Collision Maps - Heavy**
 * ----------------------------------------------------------------------------
 * Try to use collision maps only if you absolutely need to. Collision maps
 * can be very large images which will make your game use more memory and can
 * cause some slower pcs to start lagging. The collision checking for collision
 * maps are also take about 2-4x more time to compute and is a lot less accurate
 * since it only checks if the colliders edge collided with the collision map.
 * So using collision maps, might be pretty, but use it with caution as it can
 * slow down your game! A better solution for this would be to use a PolygonMap
 * where you create polygon colliders and add them into the map.
 * ============================================================================
 * ## Addons
 * ============================================================================
 * **Pathfind**
 * ----------------------------------------------------------------------------
 * https://quxios.github.io/plugins/QPathfind
 *
 * QPathfind is an A* pathfinding algorithm. This algorithm can be pretty heavy
 * if you are doing pixel based movements. So avoid having to many pathfinders
 * running at the same time.
 *
 * For the interval settings, you want to set this to a value where the path
 * can be found in 1-3 frames. You can think of intervals as the number of
 * moves to try per frame. The default setting 100, is good for grid based
 * since that will take you 100 grid spaces away. But for a pixel based, 100
 * steps might not be as far. If most of your pathfinds will be short (paths less then
 * 10 tiles away), then you should set this to a value between 100-300. For medium
 * paths (10-20 tiles away) try a value between 300-700. For large or complicated
 * paths (20+ tiles away or lots of obsticles) try something between 1000-2000.
 * I would avoid going over 2000. My opinion is to keep it below 1000, and simplify
 * any of your larger paths by either splitting it into multiple pathfinds or
 * just making the path less complex.
 *
 * ----------------------------------------------------------------------------
 * **Collision Map**
 * ----------------------------------------------------------------------------
 * https://quxios.github.io/plugins/QM+CollisionMap
 *
 * Collision Map is an addon for this plugin that lets you use images for
 * collisions. Note that collision map checks are a lot heavier then normal
 * collision checks. So this plugin can make your game laggier if used with
 * other heavy plugins.
 *
 * ----------------------------------------------------------------------------
 * **Region Colliders**
 * ----------------------------------------------------------------------------
 * https://quxios.github.io/plugins/QM+RegionColliders
 *
 * Region Colliders is an addon for this plugin that lets you add colliders
 * to regions by creating a json file.
 * ============================================================================
 * ## Showcase
 * ============================================================================
 * This section is for user created stuff. If you created a video, game, tutorial,
 * or an addon for QMovement feel free to send me a link and I'll showcase it here!
 * ----------------------------------------------------------------------------
 * **Videos**
 * ----------------------------------------------------------------------------
 * Great example of using the collision map addon:
 *
 * https://www.youtube.com/watch?v=-BN4Pyr5IBo
 *
 * ============================================================================
 * ## Links
 * ============================================================================
 * Formated Help:
 *
 *  https://quxios.github.io/plugins/QMovement
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
 * @tags movement, pixel, character
 */
/*~struct~Collider:
 * @param Type
 * @desc Set to box or circle
 * @type select
 * @option Box
 * @value box
 * @option Circle
 * @value circle
 * @default box
 *
 * @param Width
 * @desc Set to the width of the collider.
 * @type Number
 * @default 36
 *
 * @param Height
 * @desc Set to the height of the collider.
 * @type Number
 * @default 24
 *
 * @param Offset X
 * @desc Set to the x offset of the collider.
 * @type Number
 * @min -9999
 * @default 6
 *
 * @param Offset Y
 * @desc Set to the y offset of the collider.
 * @type Number
 * @min -9999
 * @default 24
 */
/*~struct~ColliderPreset:
 * @param ID
 * @desc The ID of this preset, needs to be unique!
 * @default
 *
 * @param Type
 * @desc Set to box or circle
 * @type select
 * @option Box
 * @value box
 * @option Circle
 * @value circle
 * @default box
 *
 * @param Width
 * @desc Set to the width of the collider.
 * @type Number
 * @default 36
 *
 * @param Height
 * @desc Set to the height of the collider.
 * @type Number
 * @default 24
 *
 * @param Offset X
 * @desc Set to the x offset of the collider.
 * @type Number
 * @default 6
 *
 * @param Offset Y
 * @desc Set to the y offset of the collider.
 * @type Number
 * @default 24
 */
