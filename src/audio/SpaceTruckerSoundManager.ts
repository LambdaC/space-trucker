import { Scene, SoundTrack } from "@babylonjs/core";

/**
 * 
 */
export class SpaceTruckerSoundManager {
    private _channels: { music: SoundTrack, sfx: SoundTrack, ui: SoundTrack };

    constructor(scene: Scene, soundIds: string[]) {
        this._channels = {
            music: new SoundTrack(scene, { mainTrack: false, volume: 0.89 }),
            sfx: new SoundTrack(scene, { mainTrack: true, volume: 1 }),
            ui: new SoundTrack(scene, { mainTrack: false, volume: 0.94 }),
        };

        soundIds.forEach(soundId => { });
    }
}