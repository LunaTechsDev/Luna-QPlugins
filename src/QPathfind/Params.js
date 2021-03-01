/*:
 * @plugindesc A* Pathfinding algorithm
 * <Luna_QPathfind>
 * @author LunaTechs | Quxios
 * @url https://lunatechs.dev/luna-qplugins
 *
 * @target MZ
 *
 * @param Diagonals
 * @desc Set to true or false to enable diagonals in the route
 * @type Boolean
 * @on Enable
 * @off Disable
 * @default false
 *
 * @param Any Angle
 * @desc (Only for QMovement) Set to true or false to enable moving at
 * any angle
 * @type Boolean
 * @on Enable
 * @off Disable
 * @default false
 *
 * @param Intervals
 * @desc Set to the number of calculations per frame
 * Higher value will calculate faster but can lower frames
 * @type Number
 * @min 1
 * @default 100
 *
 * @param Smart Wait
 * @desc How long should the pathfind smart 2 wait(in frames) until it
 * tries again. Default: 60
 * @type Number
 * @min 1
 * @default 60
 *
 * @param Dash on Mouse
 * @desc Should player dash when mouse clicking?
 * MV Default: true
 * @type Boolean
 * @default true
 * 
 * @command move
 * @desc Perform a move route using the pathfinding algorithm
 * 
 * @arg charId
 * @desc The character identifier (For player use 0, p, or player, for events use event ID or this)
 * @type note
 * @default player
 * 
 * @arg x
 * @desc The x tile/pixel you want the character to move to
 * @type note
 * @default 0
 * 
 * @arg y
 * @desc The y tile/pixel you want the character to move to
 * @type note
 * @default 0
 * 
 * @command towards
 * @desc Perform a pathfind towards another character.
 * 
 * @arg charId
 * @desc The character identifier (For player use 0, p, or player, for events use event ID or this)
 * @type note
 * @default player
 * 
 * @arg targetCharId
 * @desc The character identifier (For player use 0, p, or player, for events use event ID or this)
 * @type note
 * @default player
 * 
 * @arg x
 * @desc The x tile/pixel you want the character to move to
 * @type note
 * @default 0
 * 
 * @arg y
 * @desc The y tile/pixel you want the character to move to
 * @type note
 * @default 0
 * 
 * @command chase
 * @desc Perform a pathfind towards another character.
 * 
 * @arg charId
 * @desc The character identifier (For player use 0, p, or player, for events use event ID or this)
 * @type note
 * @default player
 * 
 * @arg targetCharId
 * @desc The character identifier (For player use 0, p, or player, for events use event ID or this)
 * @type note
 * @default player
 *
 * @help
 * ============================================================================
 * ## About
 * ============================================================================
 * This plugin will calculate a path for a character to take to reach a target
 * position. You can also use this plugin to make a character chase a target.
 * ============================================================================
 * ## How to use
 * ============================================================================
 * **Pathfind**
 * ----------------------------------------------------------------------------
 * To start a pathfind, you need to use a plugin command:
 * ~~~
 *  qPathfind [CHARAID] [list of options]
 * ~~~
 * - CHARAID: The character identifier.
 *  - For player: 0, p, or player
 *  - For events: EVENTID, eEVENTID, eventEVENTID or this for the event that called this
 *  (replace EVENTID with a number)
 *
 * Possible options:
 * - xX: where X is the x position in grid terms
 * - yY: where Y is the y position in grid terms
 * - pxX: where X is the x position in pixel terms (QMovement only)
 * - pyY: where Y is the y position in pixel terms (QMovement only)
 * - smartX: where X is 1 or 2.
 *  - When 1, pathfind will recalculate when its path is blocked
 *  - When 2, pathfind will also recalucate at a set interval
 * - wait: the event that called this will wait until the pathfind is complete
 * ----------------------------------------------------------------------------
 * **Pathfind Towards**
 * ----------------------------------------------------------------------------
 * To start a pathfind towards a character, you need to use a plugin command:
 * ~~~
 *  qPathfind [CHARAID] towards [TARGETCHARAID] [list of options]
 * ~~~
 * - CHARAID: The character identifier.
 *  - For player: 0, p, or player
 *  - For events: EVENTID, eEVENTID, eventEVENTID or this for the event that called this
 *  (replace EVENTID with a number)
 * - TARGETCHARAID: The CharaID of who you want the CHARAID to move towards
 *
 * Possible options:
 * - xX: where X is the x position in grid terms
 * - yY: where Y is the y position in grid terms
 * - pxX: where X is the x position in pixel terms (QMovement only)
 * - pyY: where Y is the y position in pixel terms (QMovement only)
 * - smartX: where X is 1 or 2.
 *  - When 1, pathfind will recalculate when its path is blocked
 *  - When 2, pathfind will also recalucate at a set interval
 * - wait: the event that called this will wait until the pathfind is complete
 * ----------------------------------------------------------------------------
 * **Chase**
 * ----------------------------------------------------------------------------
 * To start a chase, use the plugin command:
 * ~~~
 *  qPathfind [CHARAID] chase [TARGETCHARAID]
 * ~~~
 * - CHARAID: The character identifier.
 *  - For player: 0, p, or player
 *  - For events: EVENTID, eEVENTID, eventEVENTID or this for the event that called this
 *  (replace EVENTID with a number)
 * - TARGETCHARAID: The CharaID of who you want the CHARAID to chase
 *
 * * Chasing ends when event page changes.
 * * To force end a chase, you'll need to clear it.
 * ----------------------------------------------------------------------------
 * **Clear / End Pathfind**
 * ----------------------------------------------------------------------------
 * If you need to end a pathfind early, for example to end a chase. Then use
 * the plugin command:
 * ~~~
 *  qPathfind [CHARAID] clear
 * ~~~
 * - CHARAID: The character identifier.
 *  - For player: 0, p, or player
 *  - For events: EVENTID, eEVENTID, eventEVENTID or this for the event that called this
 *  (replace EVENTID with a number)
 * ----------------------------------------------------------------------------
 * **Examples**
 * ----------------------------------------------------------------------------
 * Make the player pathfind to 5, 1. With no smart
 * ~~~
 *  qPathfind 0 x5 y1
 *  qPathfind p x5 y1
 *  qPathfind player x5 y1
 * ~~~
 * *Note: All 3 are the same, just using a different character id method*
 *
 * Make the player pathfind to 2, 4. With smart 1
 * ~~~
 *  qPathfind 0 x2 y4 smart1
 *  qPathfind p x2 y4 smart1
 *  qPathfind player x2 y4 smart1
 * ~~~
 *
 * Make the event 1 pathfind to 2, 4. With a wait
 * ~~~
 *  qPathfind 1 x2 y4 wait
 *  qPathfind e1 x2 y4 wait
 *  qPathfind event1 x2 y4 wait
 * ~~~
 *
 * Make the event 1 chase player
 * ~~~
 *  qPathfind 1 chase 0
 *  qPathfind e1 chase p
 *  qPathfind event1 chase player1
 * ~~~
 * ============================================================================
 * ## Links
 * ============================================================================
 * Formated Help:
 *
 *  https://quxios.github.io/#/plugins/QPathfind
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
 * @tags pathfind, chase, character
 */
//=============================================================================

//=============================================================================
// QPathfind
