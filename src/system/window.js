var ffi = require('ffi')
var ref = require('ref');

class Window {
    constructor() {
        this.lpctstr = {
            name: 'lpctstr',
            indirection: 1,
            size: ref.sizeof.pointer,
            get: function(buffer, offset) {
                var _buf = buffer.readPointer(offset);
                if(_buf.isNull()) {
                    return null;
                }
                return _buf.readCString(0);
            },
            set: function(buffer, offset, value) {
                var _buf = ref.allocCString(value, 'ucs2');
        
                return buffer.writePointer(_buf, offset);
            },
            ffi_type: ffi.types.CString.ffi_type
        };

        this.user32 = ffi.Library('user32', {
            FindWindowW: ['int', [this.lpctstr, this.lpctstr]],
            SetForegroundWindow: ['bool', ['int']],
        });
    }

    focusWindow() {
        
        var foo = this.user32.FindWindowW(null, 'Path of Exile')
        var bar = this.user32.SetForegroundWindow(foo)
    }
}

module.exports = Window;