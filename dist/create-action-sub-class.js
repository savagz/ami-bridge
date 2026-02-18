function ensureIfNoDefaultsForOptional(defaults, optional) {
    optional.forEach((fieldName) => {
        if (Object.prototype.hasOwnProperty.call(defaults, fieldName)) {
            throw new Error(`Unexpected default value for field ${fieldName}.`);
        }
    });
}
function ensureIfOptionalExistsInParams(params, optional) {
    optional.forEach((fieldName) => {
        if (params.includes(fieldName))
            return;
        throw new Error(`Did not found optional field ${fieldName} in params.`);
    });
}
function getArgsObject(args, params) {
    const result = params.reduce((resultLocal, field, i) => {
        if (i < args.length)
            resultLocal[field] = args[i];
        return resultLocal;
    }, {});
    return result;
}
function applyDefaults(self, defaults) {
    return Object.assign(self, defaults);
}
const emptyObject = {};
const emptyArray = [];
export default function createActionSubClass({ name, params: paramNames = emptyArray, optional = emptyArray, defaults = emptyObject, }, ParentClass) {
    ensureIfNoDefaultsForOptional(defaults, optional);
    ensureIfOptionalExistsInParams(paramNames, optional);
    const ResultClass = class extends ParentClass {
        static from(...params) {
            if (params.length === 0)
                return new ResultClass();
            if (params[0] === undefined) {
                throw new Error("Can't work with passed undefined as the 1st arg");
            }
            if (typeof params[0] === 'object' && params[0] !== null) {
                return new ResultClass(params[0]);
            }
            throw new Error(`${name}.from() can be called only without arguments or with named arguments (pass plain object)`);
        }
        constructor(...args) {
            super(name);
            if (args.length === 0) {
                return applyDefaults(this, defaults);
            }
            const [params] = args;
            if (typeof params === 'undefined') {
                throw new Error("Can't work with passed undefined as the 1st arg");
            }
            if (params === null || typeof params !== 'object') {
                return new ResultClass(getArgsObject(args, paramNames));
            }
            applyDefaults(this, defaults);
            Object.assign(this, params);
        }
    };
    Object.defineProperty(ResultClass, 'name', { value: name });
    return ResultClass;
}
//# sourceMappingURL=create-action-sub-class.js.map