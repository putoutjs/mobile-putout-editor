import montag from 'montag';

export default montag`
// create-app-directory

export const report = () => \`Create 'app' directory\`;

export const fix = (filePath) => {
    createDirectory(getParentDirectory(filePath, 'app'), 'app');
};

export const traverse = () => ({
    [__filesystem](path) {
        const [filePath] = findFile(path, 'package.json');
        const [appPath] = findFile(path, 'app');
        
        
        if (!filePath || appPath)
            return;
        
        push(filePath);
    }
});
`;
