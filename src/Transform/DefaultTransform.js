import montag from 'montag';

export default montag`
// https://git.io/JqcMn

module.exports.report = () => \`Identifiers should be swapped\`;

module.exports.replace = () => ({
    '__a.replace(__b, __c)': ({__a, __b, __c}) => {
        return \`'\${__a.value}'\`;
    },
});
`;

