import montag from 'montag';

export default montag`
    __putout_processor_filesystem({
        "type": 'directory',
        "filename": '/home/coderaiser/putout',
        "files": [{
            "type": 'file',
            "filename": '/home/coderaiser/putout/package.json',
        }],
    });
`;
