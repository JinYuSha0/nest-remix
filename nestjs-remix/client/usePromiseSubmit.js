"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.usePromiseSubmit = void 0;
const react_1 = require("react");
const react_2 = require("@remix-run/react");
const helper_1 = require("./helper");
const object_to_formdata_1 = require("object-to-formdata");
function usePromiseSubmit(options) {
    const { delay = 0 } = options ?? {};
    const submit = (0, react_2.useSubmit)();
    const navigation = (0, react_2.useNavigation)();
    const actionData = (0, react_2.useActionData)();
    const $deferred = (0, react_1.useRef)((0, helper_1.deferred)());
    const nextCanActiveTs = (0, react_1.useRef)();
    const [loading, setLoading] = (0, react_1.useState)(false);
    const _submit = (0, react_1.useCallback)((...args) => {
        if (nextCanActiveTs.current && Date.now() < nextCanActiveTs.current) {
            return Promise.reject();
        }
        setLoading(true);
        nextCanActiveTs.current = Date.now() + delay;
        if (!(args[0] instanceof FormData)) {
            args[0] = (0, object_to_formdata_1.serialize)(args[0]);
        }
        submit.apply(null, args);
        return $deferred.current.promise;
    }, [submit]);
    (0, react_1.useEffect)(() => {
        if (navigation.state === "idle" && actionData) {
            function resolve() {
                $deferred.current.resolve(actionData);
                $deferred.current = (0, helper_1.deferred)();
                setLoading(false);
            }
            if (nextCanActiveTs.current && Date.now() < nextCanActiveTs.current) {
                setTimeout(resolve, nextCanActiveTs.current - Date.now());
            }
            else {
                resolve();
            }
        }
    }, [navigation.state, actionData]);
    return [_submit, loading];
}
exports.usePromiseSubmit = usePromiseSubmit;
//# sourceMappingURL=usePromiseSubmit.js.map