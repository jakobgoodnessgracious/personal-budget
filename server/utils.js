const createError = (statusCode, message) => {
    const err = new Error(message); err.status = statusCode;
    return err;
}

const bodyValidatorCreator = (required) => (req, res, next) => {
    const requiredFields = [];
    const typedObject = {};
    const validate = (complexType, key, value) => {
        if (!complexType) {
            return;
        }
        let isCustomValid = true;
        let type, existsString;
        // check for broader customvalidators array
        const { customValidators = [] } = complexType;
        if (customValidators.length) {
            for (const cValidator in customValidators) {
                const [key, isValid] = cValidator(req, res, next);
                if (!isValid) {
                    requiredFields.push(key);
                    return;
                }
            }
        }
        ///
        // break down complex type object
        if (typeof complexType === 'string') {
            [type, existsString] = complexType.split(':');
        } else {
            const { type: cType, customValidator = () => true, exists } = complexType
            if (exists) {
                type = cType;
                existsString = 'exists';
            } else {
                [type, existsString] = cType.split(':');
            }
            isCustomValid = customValidator(req, res, next);
        }
        ///
        const exists = existsString === 'exists';
        if (type === 'number') {
            if (!isCustomValid) {
                requiredFields.push(key);
            } else if (exists && typeof value === type) {
                typedObject[key] = value;
            } else if (typeof value === type && value >= 0) {
                typedObject[key] = value;
            } else {
                requiredFields.push(key);
            }
        }
        if (type === 'string') {
            console.log('string', key);
            if (!isCustomValid) {
                requiredFields.push(key);
            } else if (exists && typeof value === type) {
                typedObject[key] = value;
            } else if (typeof value === type && value) {
                typedObject[key] = value;
            } else {
                requiredFields.push(key);
            }
        }
        if (type === 'date') {
            if (!isCustomValid) {
                requiredFields.push(key);
            } else if (exists && value instanceof Date) {
                typedObject[key] = value;
            } else if (value instanceof Date && !isNaN(value)) {
                typedObject[key] = value;
            } else {
                requiredFields.push(key);
            }
        }
    }
    Object.entries(required).forEach(([key, value]) => {
        let type = value;
        if (value && (value.put || value.post)) {
            console.log('god', value);
            const entries = Object.entries(value);
            for (const [key, val] of entries) {
                console.log('req', req.method.toLowerCase(), key);
                if (req.method.toLowerCase() === key) {
                    type = val;
                } else { type = null }
            };
        }
        if (type) {
            validate(type, key, req.body[key]);
        }
    });
    if (requiredFields.length) {
        next(createError(400, `Required fields: [${requiredFields.toString()}] are malformed or missing from the request body.`))
    } else {
        req.typedObject = typedObject;
        next();
    }
}

const moneyOperate = (action, amount, fromTo) => {
    const ADD = 'add';
    const SUBTRACT = 'subtract';
    if (action === ADD) {
        return parseFloat(fromTo + amount).toFixed(2);
    } else if (action === SUBTRACT) {
        return parseFloat(fromTo - amount).toFixed(2);
    }

    return null;
}

module.exports = {
    createError,
    bodyValidatorCreator,
    moneyOperate
}