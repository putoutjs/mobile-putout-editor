import montag from 'montag';

export default montag`
// create-app-directory

const FS = '__putout_processor_filesystem(__object)';

export const report = () => \`Create 'app' directory\`;

export const fix = (filePath) => {
    createDirectory(getParentDirectory(filePath, 'app'), 'app');
};

export const traverse = () => ({
    [FS](path) {
        const [filePath] = findFile(path, 'package.json');
        const [appPath] = findFile(path, 'app');
        
        
        if (!filePath || appPath)
            return;
        
        push(filePath);
    }
});
`;
