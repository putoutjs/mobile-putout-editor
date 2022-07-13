import montag from 'montag';

export default montag`
// https://git.io/JqcMn

export const report = () => \`Identifiers should be swapped\`;

export const replace = () => ({
    '__a.replace(__b, __c)': ({__a, __b, __c}) => {
        return \`'\${__a.value}'\`;
    },
});
`;

