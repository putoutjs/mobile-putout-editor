const {API_HOST = 'https://putout.cloudcmd.io'} = process.env;

export default function api(path, options) {
    return fetch(`${API_HOST}/api/v1${path}`, options);
}

