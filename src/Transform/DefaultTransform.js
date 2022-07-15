import montag from 'montag';

export default montag`
// https://git.io/JqcMn

export const report = () => \`Use 'if condition' instead of 'ternary expression'\`;

export const replace = () => ({
    '__a ? __b : __c': 'if (__a) __b; else __c;'
});
`;

