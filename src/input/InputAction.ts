import { IKeyboardEvent, IMouseEvent } from "@babylonjs/core"

export interface InputAction {
    action: string,
    shouldBounce?: () => boolean
    lastEvent?: number | IMouseEvent | IKeyboardEvent
}