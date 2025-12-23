import { getOffsetScroll, closest } from "./dom.js";
import { isSelectionForward, getEndLineRect } from "./selection.js";

export function stylePopover(popover, range, options) {
    const _document = options.document;
    const _window = _document.defaultView;
    const selection = _window.getSelection();
    const isForward = isSelectionForward(selection);
    const endLineRect = getEndLineRect(range, isForward);
    const offsetScroll = getOffsetScroll(_window);
    const style = popover.style;
    if (isForward) {
        style.right = `${_document.documentElement.clientWidth - endLineRect.right + offsetScroll.left}px`;
    } else {
        style.left = `${endLineRect.left - offsetScroll.left}px`;
    }
    style.width = `${endLineRect.right - endLineRect.left}px`;
    style.height = `${endLineRect.bottom - endLineRect.top}px`;
    // Position the popover just below the selected text so it doesn't overlap
    // native copy / selection toolbars on mobile devices.
    const verticalOffset = 8; // small gap in pixels below selection
    style.top = `${endLineRect.bottom - offsetScroll.top + verticalOffset}px`;
    style.position = "absolute";

    // eslint-disable-next-line no-param-reassign
    popover.className = options.popoverClass;
}

export function lifeCycleFactory(document) {
    return {
        createPopover() {
            const popover = document.createElement("div");
            return popover;
        },
        attachPopover(popover) {
            document.body.appendChild(popover);
        },
        removePopover(popover) {
            const parent = popover.parentNode;
            if (parent) parent.removeChild(popover);
        }
    };
}
