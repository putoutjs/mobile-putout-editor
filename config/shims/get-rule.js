export const getRule = (name, options = 'on') => ({
    [name]: [options, {}],
});
