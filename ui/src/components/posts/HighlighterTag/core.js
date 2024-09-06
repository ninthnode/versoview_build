import React from 'react';
import ReactDOM from 'react-dom/client';
import PopoverContent from './PopoverContent';
import { stylePopover, lifeCycleFactory } from "./popover.js";
import { constrainRange } from "./selection.js";
import { extend, isCallable } from "./utils.js";

let _undefined;
const eventTypes = [ "selectionchange", "mouseup", "touchend", "touchcancel" ];

export default (opts) => {
    const options = (Object.assign || extend)({
        document,
        selector: "body",
        popoverClass: "share-this-popover",
        transformer: raw => raw.trim().replace(/\s+/g, " ")
    }, opts || {});

    let initialized = false;
    let destroyed = false;

    let _document = _undefined;
    let _window = _undefined;

    let popover = _undefined;
    let root = _undefined;
    let lifeCycle = _undefined;

    return {
        init() {
            if (initialized) return false;

            _document = options.document;
            _window = _document.defaultView;
            if (!_window.getSelection) {
                console.warn("Selection API isn't supported");
                return false;
            }

            eventTypes.forEach(addListener);
            _window.addEventListener("resize", resizeHandler);

            lifeCycle = lifeCycleFactory(_document);

            return initialized = true;
        },
        destroy() {
            if (!initialized || destroyed) return false;

            eventTypes.forEach(removeListener);
            _window.removeEventListener("resize", resizeHandler);

            setTimeout(() => {
                killPopover();
            }, 200);

            _document = _undefined;
            _window = _undefined;

            return destroyed = true;
        },
        reposition() {
            if (popover) {
                stylePopover(popover, getConstrainedRange(), options);
            }
            return !!popover;
        }
    };

    function addListener(type) { _document.addEventListener(type, selectionCheck); }
    function removeListener(type) { _document.removeEventListener(type, selectionCheck); }
    
    function resizeHandler() {
        if (popover) {
            stylePopover(popover, getConstrainedRange(), options);
        }
    }

    function selectionCheck({ type }) {
        const shouldHavePopover = type === "selectionchange";
        if (!popover !== shouldHavePopover) {
            setTimeout(() => {
                if (_window) {
                    const range = getConstrainedRange();
                    if (range) drawPopover(range);
                    else setTimeout(() => {
                        killPopover();
                    }, 200);
                }
            }, 10);
        }
    }

    function getConstrainedRange() {
        const selection = _window.getSelection();
        const range = selection.rangeCount && selection.getRangeAt(0);
        if (!range) return;

        const constrainedRange = constrainRange(range, options.selector);
        if (constrainedRange.collapsed || !constrainedRange.getClientRects().length) return;

        return constrainedRange;
    }

    function drawPopover(range) {
        const toBeOpened = !popover;
        const rawText = range.toString();
        const text = options.transformer(rawText);

        if (toBeOpened) {
            popover = lifeCycle.createPopover();
            popover.className = options.popoverClass;
            lifeCycle.attachPopover(popover);
        }
         root = ReactDOM.createRoot(popover);
        root.render(
            <PopoverContent
                onClick={() => {
                    if (isCallable(options.onClick)) {
                        options.onClick(text);
                    }
                }}
            />
        );

        stylePopover(popover, range, options);

        if (isCallable(options.onOpen)) {
            options.onOpen(popover, text, rawText);
        }
    }

    function killPopover() {
        if (!popover) return;
    // Unmount the component
    root.unmount();

        lifeCycle.removePopover(popover);
        popover = _undefined;
        if (isCallable(options.onClose)) {
            options.onClose();
        }
    }
};
