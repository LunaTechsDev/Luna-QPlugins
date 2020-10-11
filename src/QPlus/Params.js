/*:
 * @plugindesc Some small changes to MV for easier plugin development.
   <Luna_QPlus>
 * @author LunaTechs | Quxios
 * @url https://lunatechs.dev/luna-qplugins
 * @exportName QPlus
 *
 * @param Quick Test
 * @desc When true, game will skip title screen and start a new game
 * @type boolean
 * @default true
 *
 * @param Default Enabled Switches
 * @desc Turns on a list of switches on new game
 * @type switch[]
 * @default []
 *
 * @param Ignore Mouse when inactive
 * @desc When true, the game window will ignore mouse input when the game
 * isn't focused / active
 * @type boolean
 * @default false
 * 
 * @command wait
 * @desc Will insert a random wait between min and max frames.
 * 
 * @arg min
 * @desc The minimum value to wait.
 * 
 * @arg max
 * @desc The maximum value to wait. If left blank it will set to a random number.
 * 
 * @help
 * This is a port of the original plugin QPlus by Quixos
 *  | https://quxios.github.io/plugins/QPlus
 *
 * ============================================================================
 * ## About
 * ============================================================================
 * This plugin is the core for most of the QPlugins. It also adds a few new
 * functionality to RPG Maker MV to improve it.
 *
 * ============================================================================
 * ## Notetags / Comments
 * ============================================================================
 * **Event retain direction**
 * ----------------------------------------------------------------------------
 * Adding the following to the notes or in a comment will make that event retain
 * its direction when changing pages.
 * ~~~
 * <retainDir>
 * ~~~
 * This will be ignored if the next page has direction fix enabled
 *
 * ----------------------------------------------------------------------------
 * **No tilemap**
 * ----------------------------------------------------------------------------
 * You can disable the tile map by adding this note to a map
 * ~~~
 * <noTilemap>
 * ~~~
 * This will replace the tilemap with a simple light weight sprite container.
 * Using this may increase performance. So if you have a map that doesn't use
 * any tiles and is all parallax, then you should considering using this.
 *
 * *Note, there's a chance this may break some plugins if they call functions in
 * the original tilemap class.*
 *
 * ============================================================================
 * ## Format Plugin Commands
 * ============================================================================
 * These formating options are only applied to QPlugins!
 *
 * ----------------------------------------------------------------------------
 * **Spaces in arg**
 * ----------------------------------------------------------------------------
 * Each arg is separated with a space. But sometimes you may need a space, for
 * example when passing a file name. To do this you just need to wrap it in quotes
 * and it'll be passed as a single arg, ex:
 * ~~~
 * qPlugin cmd arg1 "arg2 with a space" arg3
 * ~~~
 *
 * ----------------------------------------------------------------------------
 * **Variables**
 * ----------------------------------------------------------------------------
 * If you want to use a value of a variable in a plugin command you can do so
 * with the following format:
 * ~~~
 * {vID}
 * ~~~
 * - ID: The id of the variable to use
 *
 * Example:
 * ~~~
 * qPlugin cmd arg1 chara{v1}
 * ~~~
 * When the plugin command runs the {v1} will get replaced with the value of
 * variable 1. If the value of variable 1 is 10, , then your plugin command will
 * format to: `qPlugin cmd arg1 chara10`
 * ----------------------------------------------------------------------------
 * **Switches**
 * ----------------------------------------------------------------------------
 * If you want to use a value of a switch in a plugin command you can do so
 * with the following format:
 * ~~~
 * {sID}
 * ~~~
 * - ID: The id of the switch to use
 *
 * Example:
 * ~~~
 * qPlugin cmd arg1 {s1}
 * ~~~
 * When the plugin command runs the {s1} will get replaced with the value of
 * switch 1. If the value of switch 1 is true, then your plugin command will
 * format to: `qPlugin cmd arg1 true`
 *
 * ============================================================================
 * ## Plugin Commands
 * ============================================================================
 * **Random wait between X Y**
 * ----------------------------------------------------------------------------
 * This plugin command will insert a random wait between x and y frames.
 * ~~~
 * wait X Y
 * ~~~
 * If Y is left empty, it will make a random wait between 0 - X
 *
 * ----------------------------------------------------------------------------
 * **Global Lock**
 * ----------------------------------------------------------------------------
 * This plugin command will 'lock' all characters or certain characters. By
 * locking I mean you can lock their movement, or movement and character
 * animation.
 * ~~~
 * globalLock LEVEL [CHARACTERS] [options]
 * ~~~
 * - LEVEL: The level of global lock
 *  * 0: clears the global lock
 *  * 1: locks the characters movement
 *  * 2: locks the characters movement and animation
 * - [CHARACTERS] - optional, list of `Character Ids` to apply to or ignore. Seperated by a space.
 *  * CHARAID: The character identifier.
 *   - For player: 0, p, or player
 *   - For events: EVENTID, eEVENTID, eventEVENTID or this for the event that called this
 *   (replace EVENTID with a number)
 *
 * Possible options:
 *  - only: Will only apply to the characters listed
 *
 * ----------------------------------------------------------------------------
 * **Global lock Examples**
 * ----------------------------------------------------------------------------
 * ~~~
 * globalLock 2
 * ~~~
 * Will lock all characters movement and animations.
 *
 * ~~~
 * globalLock 1 0 1 4
 * globalLock 1 p e1 e4
 * globalLock 1 player event1 event4
 * ~~~
 * (Note: All 3 are the same, just using a different character id method)
 *
 * Will Lock the movements for all characters except:
 * Player, event 1 and event 4
 *
 * ~~~
 * globalLock 1 0 1 4 only
 * globalLock 1 p e1 e4 only
 * globalLock 1 player event1 event4 only
 * ~~~
 * Will Lock the movements for only these characters:
 * Player, event 1 and event 4
 *
 * ============================================================================
 * ## Links
 * ============================================================================
 * Formated Help:
 *
 *  https://quxios.github.io/#/plugins/QPlus
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
 * @tags core, character
 */
